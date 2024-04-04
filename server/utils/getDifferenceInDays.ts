export const getDifferenceInDays = (date1: Date, date2: Date) => {
  if (!date1 || !date2) return;
  const differenceInDays = (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
  return differenceInDays;
};
