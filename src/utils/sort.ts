function sortByName<TData extends { name: string }>(array: TData[]): TData[] {
  if (!array) return [];

  return [...array].sort((a, b) => {
    if (typeof a.name !== "string" || typeof b.name !== "string") return 0;
    return a.name.localeCompare(b.name);
  });
}

export { sortByName };
