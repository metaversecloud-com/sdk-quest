import { getDateFromString } from "./getDateFromString.js";

export const getDifferenceInDays = (date1, date2) => {
  date1 = getDateFromString(date1);
  date2 = getDateFromString(date2);
  const differenceInDays = (date1 - date2) / (1000 * 60 * 60 * 24);
  return differenceInDays;
};
