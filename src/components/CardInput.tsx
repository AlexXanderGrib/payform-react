import {
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  RefObject,
  useEffect,
  useRef,
  useState
} from "react";
import IMask, { FactoryArg } from "imask";
import { useCombinedRefs } from "../hooks/useCombinedRefs";
import { useFocus } from "../hooks/useFocus";
import { cn } from "../utils/cn";

type IMaskOptions = FactoryArg;

type CardInputOptions = DetailedHTMLProps<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> & {
  icon?: ReactNode;
  label: string;
  validate: (value: string) => string;
  mask: IMaskOptions;
  onUpdate?: (value: string, el: HTMLInputElement) => void;
};

type UseMaskOptions = {
  onAccept?: (value: string, element: HTMLInputElement) => void;
};

function useMask(
  ref: RefObject<HTMLInputElement>,
  options: IMaskOptions,
  { onAccept }: UseMaskOptions = {}
) {
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const mask = IMask(el, options);

    mask.on("accept", () => {
      onAccept?.(mask.value, el);
    });

    return () => {
      mask.destroy();
    };
  }, [ref.current, options, onAccept]);
}

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
  const ref = useCombinedRefs(outerRef);
  const focused = useFocus(ref);

  useMask(ref, maskOptions, {
    onAccept(value, element) {
      const error = validate(value);
      onUpdate(value, element);
      setError(error);
      element.setCustomValidity(error);
    }
  });

  return (
    <label className="flex flex-col gap-1">
      <span
        className={cn("text-sm text-secondary-600 dark:text-white", {
          "text-danger-600": error
        })}
      >
        {label}
      </span>
      <div
        className={cn(
          "bg-white border-2 border-secondary-400 dark:bg-slate-900 dark:border-secondary-700 flex rounded-lg overflow-hidden",
          { "!border-primary-600": focused, "!border-danger-600": error }
        )}
      >
        <input
          {...props}
          ref={ref}
          className={cn(
            "w-full py-4 px-2 md:px-4 border-none ![box-shadow:none] outline-none text-lg text-secondary-900 dark:text-white dark:bg-slate-900 !no-arrow placeholder-select-none",
            { "!pr-0": !!icon }
          )}
        />

        {!!icon && (
          <span className="py-4 px-1 sm:px-2 md:px-4 flex items-center justify-center text-secondary-600 forced-colors:text-white dark:text-secondary-400">
            {icon}
          </span>
        )}
      </div>
      <div className="text-danger-600 text-sm empty:hidden">{error}</div>
    </label>
  );
});
