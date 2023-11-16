export const getLongestStreak = (data) => {
  let longestStreak = 0;

  for (const day in data) {
    if (data[day].count > longestStreak) longestStreak = data[day].count;
  }

  return longestStreak;
};
