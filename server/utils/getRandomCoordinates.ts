export const getRandomCoordinates = (width: number, height: number) => {
  const x = Math.floor(Math.random() * (width / 2 - -width / 2 + 1) + -width / 2);
  const y = Math.floor(Math.random() * (height / 2 - -height / 2 + 1) + -height / 2);
  return { x, y };
};
