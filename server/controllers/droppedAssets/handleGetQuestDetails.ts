import { Request, Response } from "express";
import {
  errorHandler,
  getCachedInventoryItems,
  getCredentials,
  getVisitor,
  getWorldDetails,
} from "../../utils/index.js";

export const handleGetQuestDetails = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const getWorldDetailsResponse = await getWorldDetails(credentials, false);
    if (getWorldDetailsResponse instanceof Error) throw getWorldDetailsResponse;

    const { dataObject } = getWorldDetailsResponse;

    const getVisitorResponse = await getVisitor(credentials, credentials.assetId);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor, visitorInventory } = getVisitorResponse;

    const inventoryItems = await getCachedInventoryItems({ credentials });

    const badges: {
      [name: string]: {
        id: string;
        name: string;
        icon: string;
        description: string;
      };
    } = {};

    for (const item of inventoryItems) {
      const { id, name, image_path, description, type, status } = item;
      if (name && type === "BADGE" && status === "ACTIVE") {
        badges[name] = {
          id: id,
          name,
          icon: image_path || "",
          description: description || "",
        };
      }
    }

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
