export const getDateFromString = (date) => {
  if (typeof date === "string") {
    if (date.includes("_")) {
      const [year, month, day] = date.split("_");
      return new Date(year, month - 1, day); // month is 0-indexed
    } else {
      return new Date(date);
    }
  }
  return date;
};
