import { Request } from "express";

export const getBaseURL = (req: Request) => {
  return process.env.NODE_ENV === "development"
    ? process.env.DEV_URL || "http://localhost:3000"
    : "https://" + req.get("host");
};
