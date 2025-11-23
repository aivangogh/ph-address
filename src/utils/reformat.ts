export function reformatCityName(name: string): string {
  // Transform "City of [Name]" to "[Name] City"
  const cityOfPattern = /^City of (.+)$/i;
  if (cityOfPattern.test(name)) {
    return name.replace(cityOfPattern, '$1 City');
  }

  // Transform "Municipality of [Name]" to "[Name]"
  const munOfPattern = /^Municipality of (.+)$/i;
  if (munOfPattern.test(name)) {
    return name.replace(munOfPattern, '$1');
  }

  return name;
}
