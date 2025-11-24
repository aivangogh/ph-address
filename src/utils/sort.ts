/**
 * Sorts an array of objects by the `name` property in ascending order.
 * This is a pure function and does not mutate the original array.
 *
 * @param array The array of objects to sort. Each object must have a `name` property.
 * @returns A new array with the elements sorted by name. Returns an empty array if the input is null or undefined.
 */
function sortByName<TData extends { name: string }>(array: readonly TData[]): TData[] {
  if (!array) return [];

  return [...array].sort((a, b) => {
    if (typeof a.name !== "string" || typeof b.name !== "string") return 0;
    return a.name.localeCompare(b.name);
  });
}

export { sortByName };
