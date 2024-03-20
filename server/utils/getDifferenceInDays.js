export const getDifferenceInDays = (date1, date2) => {
  const differenceInDays = (date1 - date2) / (1000 * 60 * 60 * 24);
  return differenceInDays;
};
