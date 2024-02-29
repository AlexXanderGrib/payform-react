import {
  createContext,
  FormEvent,
  useCallback,
  useContext,
  useRef,
  useState,
  forwardRef,
  RefObject,
  useId,
  useMemo
} from "react";
import IMask from "imask";
import {
  CalendarIcon,
  InformationCircleIcon,
  CreditCardIcon
} from "@heroicons/react/24/outline";

import { CardInput } from "./CardInput";
import { validatorOf } from "../utils/validator";
import {
  acceptedPaymentSystems,
  Card,
  CardPaymentSystem,
  Csc,
  detectPaymentSystem,
  Expiry,
  meta,
  Pan
} from "../utils/card";
import MainButton from "./MainButton";
import { useAutoJump } from "../hooks/useAutoJump";
import { indexOfNth } from "../utils/index-of-nth";

const filterPan = (cardNumber: string) => cardNumber.replace(/\D/g, "");

type CardFormProps = {
  disabled?: boolean;
  onSubmit?: (card: Card) => void;
};

const ValidationContext = createContext({
  disabled: false,
  canSubmit: (): boolean => false
});

export function CardForm({ disabled = false, onSubmit }: CardFormProps) {
  const ref = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");

  const canSubmit = useCallback(
    () => ref.current?.checkValidity() || false,
    [ref.current]
  );

  const names = {
    pan: "cc-number",
    expiry: "cc-exp",
    csc: "cc-csc"
  };

  const panRef = useRef<HTMLInputElement>(null);
  const expiryRef = useRef<HTMLInputElement>(null);
  const cscRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!ref.current) return;

      const formData = new FormData(ref.current);

      const pan = filterPan(formData.get(names.pan)?.toString()!);
      const expiry = formData.get(names.expiry)?.toString().split("/");
      const csc = formData.get(names.csc)?.toString();

      const result = Card.validate({ pan, expiry, csc } as Card);

      if (!result.success) {
        setError(result.message);
        return;
      }

      onSubmit?.(result.value);
    },
    [ref.current!]
  );

  return (
    <form action="#" ref={ref} onSubmit={handleSubmit}>
      <ValidationContext.Provider value={{ canSubmit, disabled }}>
        <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-4 bg-secondary-100 dark:bg-secondary-800 p-4 rounded-xl forced-colors:border-2">
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
      <div className="pt-8 empty:hidden text-danger-500">{error}</div>
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

  const descriptor =
    meta[paymentSystem as CardPaymentSystem] ?? meta.defaultValue;
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
          paymentSystem && acceptedPaymentSystems.includes(paymentSystem) ? (
            <img
              src={`icons/ps_${paymentSystem.toLowerCase()}.svg`}
              alt={paymentSystem}
              className="h-6 select-none"
              draggable="false"
              loading="eager"
              decoding="auto"
            />
          ) : (
            <CreditCardIcon className="w-6 h-6" />
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

function getMonths() {
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
          icon={<CalendarIcon className="w-6 h-6" />}
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
const alertTargetTitle = (event: { currentTarget: HTMLElement }) =>
  alert(event.currentTarget.title);

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
            className="clickable appearance-none block !cursor-help"
            onClick={alertTargetTitle}
          >
            <InformationCircleIcon className="w-6 h-6" />
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
