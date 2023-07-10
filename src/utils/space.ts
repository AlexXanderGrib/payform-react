const nbsp = String.fromCharCode(160);

/**
 *
 *
 * @param {number} number
 * @returns {string}
 *
 * @example
 * space(1000000) => "1 000 000"
 * //                  ^   ^
 * // These are non-break spaces &nbsp;
 */
export function space(number: number): string {
  const characters: string[] = [];
  const stringified = number.toFixed(0);

  for (let i = stringified.length - 1; i >= 0; i--) {
    const char = stringified[i];

    characters.push(char);

    if ((stringified.length - i) % 3 === 0) {
      characters.push(nbsp);
    }
  }

  return characters.reverse().join("");
}
