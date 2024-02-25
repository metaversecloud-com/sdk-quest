export const getBaseURL = (req) => {
  return process.env.NODE_ENV === "development"
    ? process.env.DEV_URL || "http://localhost:3000"
    : "https://" + req.get("host");
};
