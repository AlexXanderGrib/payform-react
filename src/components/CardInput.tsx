import {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  useEffect,
  useRef,
  useState
} from "react";
import IMask from "imask";
import { useCombinedRefs } from "../hooks/useCombinedRefs";
import classNames from "classnames";
import If from "./If";

type CardInputOptions = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  icon?: ReactNode;
  label: string;
  validate: (value: string) => string;
  mask: IMask.AnyMaskedOptions;
  onUpdate?: (value: string, el: HTMLInputElement) => void;
};

export const CardInput = forwardRef(function CardInput(
  {
    icon,
    label,
    validate,
    onUpdate = () => {},
    mask: maskOptions,
    ...props
  }: CardInputOptions,
  outerRef: ForwardedRef<HTMLInputElement>
) {
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);
  const innerRef = useRef<HTMLInputElement>(null);
  const ref = useCombinedRefs(innerRef, outerRef);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const onFocus = () => setFocused(true);
    const onBlur = () => setFocused(false);

    el.addEventListener("focus", onFocus);
    el.addEventListener("blur", onBlur);

    if (document.activeElement === el) {
      onFocus();
    }

    const mask = IMask(el, maskOptions);

    mask.on("accept", () => {
      const error = validate(mask.value);
      onUpdate(mask.value, el);
      setError(error);
    });

    return () => {
      el.removeEventListener("focus", onFocus);
      el.removeEventListener("blur", onBlur);
      mask.destroy();
    };
  }, [ref.current, setError, setFocused, maskOptions]);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.setCustomValidity(error);
  }, [error, ref.current]);

  return (
    <label className="flex flex-col gap-1">
      <span
        className={classNames("text-sm text-secondary-600 dark:text-white", {
          "text-danger-600": error
        })}
      >
        {label}
      </span>
      <div
        className={classNames(
          "bg-white border-2 border-secondary-400 dark:bg-slate-900 dark:border-secondary-700 flex rounded-lg overflow-hidden",
          {
            "!border-primary-600": focused,
            "!border-danger-600": error
          }
        )}
      >
        <input
          {...props}
          ref={ref}
          className={classNames(
            "w-full py-4 px-2 md:px-4 border-none ![box-shadow:none] outline-none text-lg text-secondary-900 dark:text-white dark:bg-slate-900 !no-arrow",
            {
              "!pr-0": !!icon
            }
          )}
        />
        <If condition={!!icon}>
          <span className="py-4 px-1 sm:px-2 md:px-4 flex items-center justify-center text-secondary-600 forced-colors:text-white dark:text-secondary-400">{icon}</span>
        </If>
      </div>
      <div className="text-danger-600 text-sm empty:hidden">{error}</div>
    </label>
  );
});
