import {
  createContext,
  type FormEvent,
  forwardRef,
  type RefObject,
  useCallback,
  useContext,
  useId,
  useMemo,
  useRef,
  useState
} from "react";
import {
  CalendarIcon,
  CreditCardIcon,
  InformationCircleIcon
} from "@heroicons/react/24/outline";
import IMask from "imask";

import { useAutoJump } from "../hooks/useAutoJump";
import {
  acceptedPaymentSystems,
  Card,
  type CardPaymentSystem,
  Csc,
  detectPaymentSystem,
  Expiry,
  getCardPaymentSystemMeta,
  Pan} from "../utils/card";
import { indexOfNth } from "../utils/index-of-nth";
import { validatorOf } from "../utils/validator";

import { CardInput } from "./CardInput";
import MainButton from "./MainButton";

const filterPan = (cardNumber: string): string => cardNumber.replace(/\D/g, "");

type CardFormProps = {
  disabled?: boolean;
  onSubmit?: (card: Card) => void;
};

const ValidationContext = createContext({
  disabled: false,
  canSubmit: (): boolean => false
});

const names = Object.freeze({
  pan: "cc-number",
  expiry: "cc-exp",
  csc: "cc-csc"
});

export function CardForm({
  disabled = false,
  onSubmit
}: CardFormProps): JSX.Element {
  const ref = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");

  const canSubmit = useCallback(
    () => ref.current?.checkValidity() ?? false,
    [ref.current]
  );

  const panRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cscRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ref.current) return;

      const formData = new FormData(ref.current);

      const card = {
        pan: filterPan(formData.get(names.pan)?.toString() ?? ""),
        expiry: formData.get(names.expiry)?.toString().split("/"),
        csc: formData.get(names.csc)?.toString()
      };

      const result = Card.validate(card);

      if (!result.success) {
        setError(result.message);
        return;
      }

      onSubmit?.(result.value);
    },
    [ref.current]
  );

  return (
    <form action="#" ref={ref} onSubmit={handleSubmit}>
      <ValidationContext.Provider value={{ canSubmit, disabled }}>
        <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-4 rounded-xl bg-secondary-100 p-4 dark:bg-secondary-800 forced-colors:border-2">
          <section className="col-span-2">
            <CardPan name={names.pan} ref={panRef} next={expiryRef} />
          </section>
          <CardExpiry
            name={names.expiry}
            ref={expiryRef}
            next={cscRef}
            prev={panRef}
          />
          <CardCsc name={names.csc} ref={cscRef} prev={expiryRef} />
        </div>
      </ValidationContext.Provider>
      <div className="pt-8 text-danger-500 empty:hidden">{error}</div>
      <div className="h-8" />
      <MainButton type="submit">Оплатить</MainButton>
    </form>
  );
}

type CardElementProps = {
  next?: RefObject<HTMLElement>;
  prev?: RefObject<HTMLElement>;
  name: string;
};

const validatePan = validatorOf((x: string) => Pan.validate(filterPan(x)));

const CardPan = forwardRef<HTMLInputElement, CardElementProps>(function CardPan(
  { next, name },
  ref
) {
  const [paymentSystem, setPaymentSystem] = useState<CardPaymentSystem>();
  const { disabled } = useContext(ValidationContext);
  const { onKeyDown, onUpdate } = useAutoJump({
    next,
    dependencies: [setPaymentSystem],
    effect(value) {
      const systems = detectPaymentSystem(filterPan(value));

      setPaymentSystem(systems[0]);
    }
  });

  const descriptor = getCardPaymentSystemMeta(paymentSystem);
  const mask = descriptor.mask;
  const minLength = Math.min(...descriptor.lengths);
  const maxLength = indexOfNth(mask, "0", Math.max(...descriptor.lengths)) + 1;

  return (
    <>
      <CardInput
        label="Номер карты"
        mask={{ mask }}
        validate={validatePan}
        ref={ref}
        onUpdate={onUpdate}
        onKeyDown={onKeyDown}
        name={name}
        icon={
          paymentSystem != null &&
          acceptedPaymentSystems.includes(paymentSystem) ? (
            <img
              src={`icons/ps_${paymentSystem.toLowerCase()}.svg`}
              alt={paymentSystem}
              className="h-6 select-none"
              draggable="false"
              loading="eager"
              decoding="auto"
            />
          ) : (
            <CreditCardIcon className="h-6 w-6" />
          )
        }
        autoComplete="cc-number"
        placeholder={mask.replace(/0/g, "•").replace(/\s+/g, "   ")}
        inputMode="numeric"
        pattern="[\d ]{10,30}"
        required
        minLength={minLength}
        maxLength={maxLength}
        type="text"
        disabled={disabled}
      />
    </>
  );
});

function getMonths(): Map<string, string> {
  const months = new Map<string, string>();
  const date = new Date();
  let formatter: Intl.DateTimeFormat | undefined;

  for (let i = 0; i < 10 * 12; i++) {
    if (typeof window === "undefined") {
      break;
    }

    if (!formatter && typeof Intl.DateTimeFormat !== "undefined") {
      formatter = new Intl.DateTimeFormat(navigator.language, {
        month: "long",
        year: "numeric"
      });
    }

    const text =
      (date.getMonth() + 1).toFixed(0).padStart(2, "0") +
      "/" +
      date.getFullYear().toFixed(0).slice(2, 4);

    months.set(text, formatter ? formatter.format(date) : "");
    date.setMonth(date.getMonth() + 1);
  }

  return months;
}

const validateExpiry = validatorOf((expiry: string) =>
  Expiry.validate(expiry.split("/"))
);

const CardExpiry = forwardRef<HTMLInputElement, CardElementProps>(
  function CardExpiry({ next, name, prev }, ref) {
    const { disabled } = useContext(ValidationContext);
    const { onUpdate, onKeyDown } = useAutoJump({ next, prev });
    const id = useId();
    const months = useMemo(() => getMonths(), []);

    return (
      <>
        <datalist id={id}>
          {[...months].map(([month, text]) => (
            <option value={month} key={month}>
              {text}
            </option>
          ))}
        </datalist>
        <CardInput
          list={id}
          validate={validateExpiry}
          icon={<CalendarIcon className="h-6 w-6" />}
          mask={{
            mask: "MM{/}YY",
            blocks: {
              YY: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 99
              },
              MM: {
                mask: IMask.MaskedRange,
                from: 1,
                to: 12
              }
            }
          }}
          label="Срок действия"
          ref={ref}
          name={name}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/ГГ"
          maxLength={5}
          required
          pattern="[0-9/]+"
          type="text"
          disabled={disabled}
          onUpdate={onUpdate}
          onKeyDown={onKeyDown}
        />
      </>
    );
  }
);

const validateCsc = validatorOf((csc: string) => Csc.validate(csc));
const alertTargetTitle = (event: { currentTarget: HTMLElement }): void => {
  alert(event.currentTarget.title);
};

const CardCsc = forwardRef<HTMLInputElement, CardElementProps>(
  function CardExpiry({ name, prev }, ref) {
    const { disabled } = useContext(ValidationContext);
    const { onUpdate, onKeyDown } = useAutoJump({ prev });

    return (
      <CardInput
        label="Защитный код"
        mask={{ mask: "0000" }}
        validate={validateCsc}
        icon={
          <button
            title="Он находится с обратной стороны карты - 3 цифры"
            aria-label='Узнать что такое "Код"'
            type="button"
            className="block !cursor-help appearance-none clickable"
            onClick={alertTargetTitle}
          >
            <InformationCircleIcon className="h-6 w-6" />
          </button>
        }
        ref={ref}
        name={name}
        autoComplete="cc-csc"
        placeholder="CVC"
        pattern="[0-9]+"
        inputMode="numeric"
        minLength={3}
        maxLength={4}
        required
        type="password"
        disabled={disabled}
        onUpdate={onUpdate}
        onKeyDown={onKeyDown}
      />
    );
  }
);
