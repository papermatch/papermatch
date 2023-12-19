export function calculateAge(birthday: number) {
  const ageDiffMs = Date.now() - birthday;
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function padWithZeros(num: number, size: number) {
  let s = num + "";
  while (s.length < size) s = "0" + s;
  return s;
}

export function toDateString(date: Date) {
  const year = padWithZeros(date.getFullYear(), 4);
  const month = padWithZeros(date.getMonth() + 1, 2);
  const day = padWithZeros(date.getDate(), 2);
  return `${year}-${month}-${day}`;
}

export function toTimeString(date: Date) {
  const hours = padWithZeros(date.getHours(), 2);
  const minute = padWithZeros(date.getMinutes(), 2);
  const seconds = padWithZeros(date.getSeconds(), 2);
  return `${hours}:${minute}:${seconds}`;
}

export function toDateTimeString(date: Date) {
  return `${toDateString(date)} ${toTimeString(date)}`;
}
