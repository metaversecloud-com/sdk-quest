import { Request, Response } from "express";
import { errorHandler, getCredentials, getVisitor, getWorldDetails } from "../../utils/index.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getWorldDetails(credentials, false);

    const { visitor } = await getVisitor(credentials, credentials.assetId);

    return res.json({
      questDetails: dataObject,
      visitor: { isAdmin: visitor.isAdmin, profileId: credentials.profileId },
    });
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
