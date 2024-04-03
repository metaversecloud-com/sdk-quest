export const getDateFromString = (date: Date | string) => {
  if (typeof date === "string") {
    if (date.includes("_")) {
      const [year, month, day] = date.split("_");
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)); // month is 0-indexed
    } else {
      return new Date(date);
    }
  }
  return date;
};
