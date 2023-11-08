export const getLongestStreak = (data) => {
  // Convert keys to dates and sort in ascending order
  const dates = Object.keys(data)
    .map((key) => {
      const [year, month, day] = key.split("_");
      return new Date(year, month - 1, day); // month is 0-indexed
    })
    .sort((a, b) => a - b);

  let longestStreak = 0;
  let currentStreak = 1;

  // Iterate over sorted dates
  for (let i = 1; i < dates.length; i++) {
    const diffInDays = (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    const dayOfWeek = dates[i].getDay();

    if (
      diffInDays === 1 ||
      (diffInDays <= 3 && dayOfWeek === 1 && dates[i - 1].getDay() !== 0) ||
      [0, 6].includes(dayOfWeek)
    ) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 1;
    }
  }

  // Check once more at the end to cover the case where the longest streak ends on the last date
  longestStreak = Math.max(longestStreak, currentStreak);

  return longestStreak;
};
