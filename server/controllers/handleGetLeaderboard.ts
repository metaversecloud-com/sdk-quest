import { Request, Response } from "express";
import { DataObjectType } from "../types/DataObjectType.js";
import { errorHandler, getCredentials, getWorldDetails } from "../utils/index.js";

export const handleGetLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);

    const { dataObject } = await getWorldDetails(credentials, false);
    if (!dataObject) throw "No data object found";
    const { itemsCollectedByUser } = dataObject as DataObjectType;

    const leaderboard = [];

    for (const profileId in itemsCollectedByUser) {
      const thisUsersItems = itemsCollectedByUser[profileId];
      leaderboard.push({
        name: thisUsersItems.username,
        collected: thisUsersItems.total,
        profileId,
        streak: thisUsersItems.longestStreak || 0,
      });
    }

    leaderboard.sort((a, b) => b.collected - a.collected);

    return res.json({ leaderboard, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleGetLeaderboard",
      message: "Error getting leaderboard",
      req,
      res,
    });
  }
};
