export const getBaseURL = (req) => {
  return process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://" + req.get("host");
};
