import { space } from "../utils/space";

type MoneyProps = {
  amount: string | number;
  currencySign?: string;
}

export function Money({ amount = 0, currencySign = "₽" }: MoneyProps): JSX.Element {
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
