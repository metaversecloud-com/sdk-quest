import { Request, Response } from "express";
import { errorHandler, getCredentials, getWorldDetails } from "../../utils/index.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getWorldDetails(credentials, false);

    return res.json(dataObject);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetQuestDetails",
      message: "Error getting quest details image",
      req,
      res,
    });
  }
};
