/**
 * @param {string} orig Original string
 * @param {string|string[]} dict Dictionary of allowed letters
 *
 * @return {string} String containing only letters in dict, keeping the order
 *
 * @example
 * filterString('8 (800) 555 35-35', '1234567890')
 * // => 88005553535
 */
export function filterString(
  orig: string,
  dict: string | string[] | RegExp
): string {
  return orig
    .split("")
    .filter((letter) =>
      dict instanceof RegExp ? dict.test(letter) : dict.includes(letter)
    )
    .join("");
}
