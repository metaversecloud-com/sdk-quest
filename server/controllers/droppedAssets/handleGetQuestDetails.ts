import { Request, Response } from "express";
import { errorHandler, getCredentials, getWorldDetails } from "../../utils/index.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getWorldDetails(credentials);

    return res.json(dataObject);
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetKeyAssetImage",
      message: "Error getting key asset image",
      req,
      res,
    });
  }
};