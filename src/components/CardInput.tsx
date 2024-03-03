import {
  type DetailedHTMLProps,
  type ForwardedRef,
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type RefObject,
  useEffect,
  useState
} from "react";
import IMask, { type FactoryArg } from "imask";

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
): void {
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
): JSX.Element {
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
          "flex overflow-hidden rounded-lg border-2 border-secondary-400 bg-white dark:border-secondary-700 dark:bg-slate-900",
          { "!border-primary-600": focused, "!border-danger-600": error }
        )}
      >
        <input
          {...props}
          ref={ref}
          className={cn(
            "w-full border-none px-2 py-4 text-lg text-secondary-900 outline-none placeholder-select-none !no-arrow ![box-shadow:none] md:px-4 dark:bg-slate-900 dark:text-white",
            { "!pr-0": !!icon }
          )}
        />

        {!!icon && (
          <span className="flex items-center justify-center px-1 py-4 text-secondary-600 sm:px-2 md:px-4 dark:text-secondary-400 forced-colors:text-white">
            {icon}
          </span>
        )}
      </div>
      <div className="text-sm text-danger-600 empty:hidden">{error}</div>
    </label>
  );
});
