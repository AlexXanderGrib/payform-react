import { space } from "../utils/space";

export function Money({ amount = 0, currencySign = "₽" }) {
  amount = parseFloat(amount.toString());
  const mainPart = Math.trunc(amount);
  const fraction = amount * 100 - mainPart * 100;

  return (
    <span className="text-black dark:text-white">
      {space(mainPart)}
      <span className="text-secondary-600 dark:text-secondary-400">
        ,{Math.round(fraction).toFixed().padStart(2, "0")}&nbsp;{currencySign}
      </span>
    </span>
  );
}
