import { Request, Response } from "express";
import { errorHandler, getBadges, getCredentials, getVisitor, getWorldDetails } from "../../utils/index.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const forceRefreshInventory = req.query.forceRefreshInventory === "true";

    const { dataObject } = await getWorldDetails(credentials, false);

    const { visitor, visitorInventory } = await getVisitor(credentials, credentials.assetId);

    const badges = await getBadges(credentials, forceRefreshInventory);

    return res.json({
      questDetails: dataObject,
      visitor: { isAdmin: visitor.isAdmin, profileId: credentials.profileId },
      visitorInventory,
      badges,
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
