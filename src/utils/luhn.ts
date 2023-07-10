export function luhnCheck(digits: string): boolean {
  let sum = 0;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits[i], 10);

    // replace i % 2 with i & 1 if perf junkie
    if (i % 2 === 0) {
      digit *= 2;
    }

    if (digit > 9) {
      digit -= 9;
    }

    sum += digit;
  }

  return sum % 10 === 0;
}
