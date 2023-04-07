export function indexOfNth<T>(input: ArrayLike<T>, search: T, nth: number) {
  for(let count = 0, index = 0; index < input.length; index++) {
    if(input[index] === search) count++;

    if(count >= nth) return index;
  }

  return -1;
}
