import {
  createContext,
  FormEvent,
  MutableRefObject,
  ReactNode,
  useCallback,
  useEffect,
  useContext,
  useRef,
  useState,
  forwardRef,
  RefObject
} from "react";
import { filterString } from "@xxhax/strings";
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
  masks,
  Pan
} from "../utils/card";
import MainButton from "./MainButton";
import { useAutoJump } from "../hooks/useAutoJump";
import classNames from "classnames";

const filterPan = (cardNumber: string) => filterString(cardNumber, /\d/);

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
        <div className="grid grid-cols-2 grid-rows-[auto_auto] gap-4 bg-secondary-100 p-4 rounded-xl">
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

  return (
    <>
      <CardInput
        label="Номер карты"
        mask={{
          mask: masks[paymentSystem as CardPaymentSystem] ?? masks.defaultMask
        }}
        validate={validatorOf((x) => Pan.validate(filterString(x, /\d/)))}
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
            <CreditCardIcon className="w-6 h-6 text-secondary-600" />
          )
        }
        autoComplete="cc-number"
        placeholder="••••   ••••   ••••   ••••"
        inputMode="numeric"
        pattern="[\d ]{10,30}"
        required
        minLength={19}
        maxLength={23}
        type="text"
        disabled={disabled}
      />

      <ul
        aria-aria-label="Поддерживаемые платёжные системы"
        className="flex py-2 gap-2 flex-wrap"
      >
        {acceptedPaymentSystems.map((name) => (
          <li
            key={name}
            className={classNames("transition-all duration-100", {
              "opacity-50": name !== paymentSystem
            })}
          >
            <img
              lang="en"
              src={`icons/ps_${name.toLowerCase()}.svg`}
              alt={name}
              title={name}
              className="h-3 w-4 sm:h-4 sm:w-6 select-none"
              draggable="false"
              loading="eager"
              decoding="auto"
            />
          </li>
        ))}
      </ul>
    </>
  );
});

const CardExpiry = forwardRef<HTMLInputElement, CardElementProps>(
  function CardExpiry({ next, name, prev }, ref) {
    const { disabled } = useContext(ValidationContext);
    const { onUpdate, onKeyDown } = useAutoJump({ next, prev });

    return (
      <CardInput
        validate={validatorOf((expiry) => Expiry.validate(expiry.split("/")))}
        icon={<CalendarIcon className="w-6 h-6 text-secondary-600" />}
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
    );
  }
);

const CardCsc = forwardRef<HTMLInputElement, CardElementProps>(
  function CardExpiry({ name, prev }, ref) {
    const { disabled } = useContext(ValidationContext);
    const { onUpdate, onKeyDown } = useAutoJump({ prev });

    return (
      <CardInput
        label="Защитный код"
        mask={{ mask: "0000" }}
        validate={validatorOf((csc) => Csc.validate(csc))}
        icon={
          <button
            title="Он находится с обратной стороны карты - 3 цифры"
            aria-label='Узнать что такое "Код"'
            type="button"
            className="clickable appearance-none block !cursor-help"
            onClick={(event) => alert(event.currentTarget.title)}
          >
            <InformationCircleIcon className="w-6 h-6 text-secondary-600" />
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
