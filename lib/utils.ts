  import { Dispatch, SetStateAction } from "react";

export function calculateAge(birthday: number) {
  const ageDiffMs = Date.now() - birthday;
  const ageDate = new Date(ageDiffMs);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
}

export function toggleArrayValue<T>(setter: Dispatch<SetStateAction<T[]>>) {
  return (value: T) => {
    setter((prev) => {
      const next = [...prev];
      const index = next.indexOf(value);
      if (index === -1) {
        next.push(value);
      } else {
        next.splice(index, 1);
      }
      return next;
    });
  };
}
