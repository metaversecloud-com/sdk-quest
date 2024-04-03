import { Request, Response } from "express";
import { errorHandler, getCredentials, getQuestItems } from "../../utils/index.js";

export const handleGetQuestItems = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const droppedAssets = await getQuestItems(credentials);

    return res.json({ droppedAssets, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetQuestItems",
      message: "Error fetching Quest items",
      req,
      res,
    });
  }
};
