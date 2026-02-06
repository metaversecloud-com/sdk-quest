import { Request, Response } from "express";
import { KeyAssetDataObjectType } from "../types/DataObjectTypes.js";
import { errorHandler, getCredentials, getKeyAsset, getVisitor, getWorldDetails } from "../utils/index.js";

export const handleGetLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const isKeyAsset = req.query.isKeyAsset === "true";
    let keyAssetId = credentials.assetId;

    if (!isKeyAsset) {
      const { dataObject } = await getWorldDetails(credentials, false);
      keyAssetId = dataObject.keyAssetId;
    }

    const keyAsset = await getKeyAsset(credentials, keyAssetId);
    const { leaderboard } = (keyAsset.dataObject as KeyAssetDataObjectType) || {};

    let formattedLeaderboard = [];

    for (const profileId in leaderboard) {
      const data = leaderboard[profileId];

      const [displayName, totalCollected, longestStreak] = data.split("|");

      const collected = parseInt(totalCollected) || 0;

      formattedLeaderboard.push({
        name: displayName,
        collected,
        profileId,
        streak: parseInt(longestStreak) || 0,
      });
    }

    formattedLeaderboard.sort((a, b) => b.collected - a.collected);

    return res.json({
      leaderboard: formattedLeaderboard,
    });
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
