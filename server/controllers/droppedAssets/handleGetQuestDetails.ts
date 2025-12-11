import { Request, Response } from "express";
import { errorHandler, getCredentials, getVisitor, getWorldDetails } from "../../utils/index.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const getWorldDetailsResponse = await getWorldDetails(credentials, false);
    if (getWorldDetailsResponse instanceof Error) throw getWorldDetailsResponse;

    const { dataObject } = getWorldDetailsResponse;

    const getVisitorResponse = await getVisitor(credentials, credentials.assetId);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor } = getVisitorResponse;

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
