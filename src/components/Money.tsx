import { chunk } from "@xxhax/lists"

function format(main: number) {
  return chunk(main.toString().split('').reverse(), 3).map(group => group.join('')).join(' ').split('').reverse().join('');
}


export function Money({ amount = 0, currencySign = '₽' }) {
  amount = parseFloat(amount.toString());
  const mainPart = Math.trunc(amount);
  const fraction = amount * 100 - mainPart * 100;
  const nbsp = String.fromCharCode(160);

  return (
    <span className="text-black dark:text-white">
      {format(mainPart).replace(/\ /g, nbsp)}
      <span className="text-secondary-600 dark:text-secondary-400">
        ,{Math.round(fraction).toFixed().padStart(2, '0')}&nbsp;{currencySign}
      </span>
    </span>
  );
}
