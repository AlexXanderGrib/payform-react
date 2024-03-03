import { type Result } from "runtypes";

export function validatorOf<T>(fn: (x: T) => Result<any>): (value: T) => string {
  return (value: T) => {
    const result = fn(value);
    const message = !result.success ? result.message : "";

    if (!message) {
      return message;
    }

    if (message.includes(": ")) {
      return message.slice(message.indexOf(": ") + ": ".length);
    }

    return "Данные введены в неверном формате";
  };
}
