export function excludePassword(
  candidateData: Record<string, any>,
): Omit<typeof candidateData, 'password'> {
  const { password, ...rest } = candidateData;
  return rest;
}
