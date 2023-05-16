export const getStreak = (data) => {
  let currentDate = new Date();
  let streak = 0;

  while (true) {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed, so we add 1
    const day = String(currentDate.getDate()).padStart(2, "0");
    const dayOfWeek = currentDate.getDay();

    const key = `${year}_${month}_${day}`;

    // TODO: Check when the world was closed, which requires that we save the history of open and closed days.
    if (data[key]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Go to the previous day
    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Skips weekends, but gives you streak credit above if you somehow came on a weekend
      currentDate.setDate(currentDate.getDate() - 1); // Go to the previous day
    } else {
      break; // End the loop when we find a day that doesn't exist in the data
    }
  }

  return streak;
};

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
