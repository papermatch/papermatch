export function calculateAge(birthday: number) {
  const ageDiffMs = Date.now() - birthday;
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}
