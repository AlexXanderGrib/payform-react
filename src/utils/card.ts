/* eslint-disable @typescript-eslint/no-redeclare */
import * as t from "runtypes";

import { luhnCheck } from "./luhn";

export const enum CardPaymentSystem {
  Mastercard = "mastercard",
  Electron = "electron",
  Visa = "visa",
  Maestro = "maestro",
  Mir = "mir",
  AmericanExpress = "amex",
  DinersClub = "dinersclub",
  Discover = "discover",
  JCB = "jcb",
  UnionPay = "unionpay",
  UzCard = "uzcard",
  Humo = "humo",
  Troy = "troy"
}

export function formatPan(
  pan: string,
  mask = "0000 0000 0000 0000 000",
  maskChar = "0"
): string {
  let index = 0;
  let result = "";
  for (const char of mask.split("")) {
    if (char !== maskChar) {
      result += char;
      continue;
    }
    const realChar = pan[index++];
    if (realChar === undefined) break;
    result += realChar;
  }
  return result;
}

export function resolveCardExpiryYear(year: number | string): number {
  year = parseInt(String(year));

  const MAX_CARD_ISSUE_YEARS = 30;
  const currentYear = new Date().getFullYear();
  if (currentYear + MAX_CARD_ISSUE_YEARS > year) return 2000 + year;

  return 1900 + year;
}

type BinTableRow = readonly [
  paymentSystem: CardPaymentSystem,
  start: number,
  end?: number
];

// https://en.wikipedia.org/wiki/Payment_card_number#Issuer_identification_number_(IIN)
const BIN_TABLE: readonly BinTableRow[] = [
  [CardPaymentSystem.Mir, 2200, 2204],
  [CardPaymentSystem.Mastercard, 2221, 2720],
  [CardPaymentSystem.JCB, 3528, 3589],
  [CardPaymentSystem.AmericanExpress, 34],
  [CardPaymentSystem.AmericanExpress, 37],
  [CardPaymentSystem.DinersClub, 36],
  [CardPaymentSystem.Electron, 417500],
  [CardPaymentSystem.Electron, 4026],
  [CardPaymentSystem.Electron, 4508],
  [CardPaymentSystem.Electron, 4844],
  [CardPaymentSystem.Electron, 4913],
  [CardPaymentSystem.Electron, 4917],
  [CardPaymentSystem.Visa, 4],
  [CardPaymentSystem.Maestro, 5018],
  [CardPaymentSystem.Maestro, 5020],
  [CardPaymentSystem.Maestro, 5038],
  [CardPaymentSystem.Maestro, 5893],
  [CardPaymentSystem.DinersClub, 54],
  [CardPaymentSystem.Mastercard, 51, 55],
  [CardPaymentSystem.Discover, 622126, 622925],
  [CardPaymentSystem.Discover, 6011],
  [CardPaymentSystem.Maestro, 6304],
  [CardPaymentSystem.Maestro, 6759],
  [CardPaymentSystem.Maestro, 6761],
  [CardPaymentSystem.Maestro, 6762],
  [CardPaymentSystem.Maestro, 6763],
  [CardPaymentSystem.Maestro, 676770],
  [CardPaymentSystem.Maestro, 676774],
  [CardPaymentSystem.Discover, 644, 649],
  [CardPaymentSystem.Discover, 65],

  // this is for detection of Mir-UnionPay cards. 629157 is only bin i know
  [CardPaymentSystem.Mir, 629157],
  [CardPaymentSystem.UnionPay, 62]

  // [CardPaymentSystem.UzCard, 8600],
  // [CardPaymentSystem.Humo, 9860],
  // [CardPaymentSystem.Troy, 9792]
];

type Overrides<T> = Readonly<
  Partial<Record<CardPaymentSystem, T>> & { defaultValue: T }
>;

type PaymentSystemMeta = {
  mask: string;
  lengths: number[];
};

const extendedDefault: PaymentSystemMeta = {
  mask: "0000 0000 0000 0000000",
  lengths: [16, 17, 18, 19]
};

const meta: Overrides<PaymentSystemMeta> = {
  defaultValue: {
    mask: "0000 0000 0000 0000",
    lengths: [16]
  },

  [CardPaymentSystem.AmericanExpress]: {
    mask: "0000 000000 00000",
    lengths: [15]
  },

  [CardPaymentSystem.Mir]: extendedDefault,
  [CardPaymentSystem.UnionPay]: extendedDefault,
  [CardPaymentSystem.Discover]: extendedDefault,
  [CardPaymentSystem.JCB]: extendedDefault,

  [CardPaymentSystem.Visa]: {
    mask: "0000 0000 0000 0000",
    lengths: [13, 16]
  },

  [CardPaymentSystem.Maestro]: {
    mask: "0000 0000 0000 0000 000",
    lengths: [12, 13, 14, 15, 16, 17, 18, 19]
  },

  [CardPaymentSystem.DinersClub]: {
    mask: "0000 0000 0000 0000 000",
    lengths: [14, 15, 16, 17, 18, 19]
  }
};

export function getCardPaymentSystemMeta(
  system?: CardPaymentSystem
): PaymentSystemMeta {
  if (!system || !(system in meta)) {
    return meta.defaultValue;
  }

  return meta[system] ?? meta.defaultValue;
}

export const acceptedPaymentSystems = [
  CardPaymentSystem.Mastercard,
  CardPaymentSystem.Electron,
  CardPaymentSystem.Visa,
  CardPaymentSystem.Maestro,
  CardPaymentSystem.Mir,
  CardPaymentSystem.AmericanExpress,
  CardPaymentSystem.DinersClub,
  CardPaymentSystem.Discover,
  CardPaymentSystem.JCB,
  CardPaymentSystem.UnionPay
];

const errorMessages = {
  ONLY_NUMBERS_ALLOWED: "Поле может содержать только цифры",

  INCOMPLETE_CARD_NUMBER: "Неполный номер карты",
  INVALID_CARD_NUMBER: "Недопустимый номер карты. В нём допущена ошибка",
  UNSUPPORTED_CARD_NETWORK: "Карта не поддерживается",

  CARD_EXPIRED: "Срок действия карты истёк"
};

export function detectPaymentSystem(
  cardNumber: string,
  supported: CardPaymentSystem[] = acceptedPaymentSystems
): CardPaymentSystem[] {
  if (typeof cardNumber !== "string" || cardNumber === "") {
    return [];
  }

  const paymentSystem = BIN_TABLE.filter(([system, start, end = start]) => {
    const cardNumberNumeric = Number.parseInt(
      cardNumber.slice(0, String(start).length),
      10
    );

    const match = cardNumberNumeric >= start && cardNumberNumeric <= end;
    return match && (!supported?.length || supported.includes(system));
  }).map(x => x[0]);

  return paymentSystem;
}

export const Pan = t.String.withConstraint(str => {
  if (!/^\d+$/.test(str)) {
    return errorMessages.ONLY_NUMBERS_ALLOWED;
  }

  if (str.length < 6) {
    return errorMessages.INCOMPLETE_CARD_NUMBER;
  }

  const system = detectPaymentSystem(str);

  if (system.length === 0) {
    return errorMessages.UNSUPPORTED_CARD_NETWORK;
  }

  const descriptor = meta[system[0]] ?? meta.defaultValue;

  if (!descriptor.lengths.includes(str.length)) {
    return errorMessages.INCOMPLETE_CARD_NUMBER;
  }

  if (!luhnCheck(str)) {
    return errorMessages.INVALID_CARD_NUMBER;
  }

  return true;
});

export const Expiry = t
  .Tuple(
    t.String.withConstraint(
      str => /^(0?\d|10|11|12)$/.test(str) || errorMessages.ONLY_NUMBERS_ALLOWED
    ),
    t.String.withConstraint(
      str => /^\d{2}$/.test(str) || errorMessages.ONLY_NUMBERS_ALLOWED
    )
  )
  .withConstraint(value => {
    const [month, year] = value
      .map(value => parseInt(value, 10))
      .concat([NaN, NaN]);

    if (Number.isNaN(month) || Number.isNaN(year)) {
      return errorMessages.ONLY_NUMBERS_ALLOWED;
    }

    const today = new Date();
    const expiry = new Date(
      resolveCardExpiryYear(year),
      month,
      1,
      0,
      -today.getTimezoneOffset()
    );

    if (expiry.getTime() < today.getTime()) {
      return errorMessages.CARD_EXPIRED;
    }

    return true;
  });

export const Csc = t.String.withConstraint(
  str => /^\d{3,4}$/.test(str) || errorMessages.ONLY_NUMBERS_ALLOWED
);

export const Card = t
  .Record({
    pan: Pan,
    expiry: Expiry,
    csc: Csc
  })
  .asReadonly();

export type Card = t.Static<typeof Card>;

export function card2string(card: Card): string {
  Card.check(card);
  const data = [card.pan, card.expiry.join("/"), card.csc];
  const string = data.join(",");

  return string;
}

export function string2card(string: string): Card {
  const [pan, expiry, csc] = string.split(",");

  return Card.check({
    pan,
    expiry: expiry.split("/"),
    csc
  });
}

export function maskPan(pan: string): string {
  const bin = pan.slice(0, 6);
  const id = pan.slice(-4);
  const mask = "*".repeat(pan.length - 10);

  return bin + mask + id;
}
