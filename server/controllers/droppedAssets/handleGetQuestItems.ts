import { Request, Response } from "express";
import { errorHandler, getCredentials, getQuestItems } from "../../utils/index.js";

export const handleGetQuestItems = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const getQuestItemsResponse = await getQuestItems(credentials);
    if (getQuestItemsResponse instanceof Error) throw getQuestItemsResponse;

    const droppedAssets = getQuestItemsResponse;

    return res.json({ droppedAssets });
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
