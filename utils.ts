/**
 * Splits an array into smaller arrays of a specified size.
 * @param array The array to split.
 * @param size The size of each chunk.
 * @returns A new array containing the chunked arrays.
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  const chunkedArr: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArr.push(array.slice(i, i + size));
  }
  return chunkedArr;
}
