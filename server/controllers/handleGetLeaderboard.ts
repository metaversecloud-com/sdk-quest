import { Request, Response } from "express";
import { KeyAssetDataObjectType } from "../types/DataObjectTypes.js";
import { errorHandler, getCredentials, getKeyAsset, getVisitor, getWorldDetails } from "../utils/index.js";

export const handleGetLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const isKeyAsset = req.query.isKeyAsset === "true";
    let keyAssetId = credentials.assetId;

    if (!isKeyAsset) {
      const getWorldDetailsResponse = await getWorldDetails(credentials, false);
      if (getWorldDetailsResponse instanceof Error) throw getWorldDetailsResponse;

      const { dataObject } = getWorldDetailsResponse;
      keyAssetId = dataObject.keyAssetId;
    }

    const getKeyAssetResponse = await getKeyAsset(credentials, keyAssetId);
    if (getKeyAssetResponse instanceof Error) throw getKeyAssetResponse;

    const keyAsset = getKeyAssetResponse;
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

    const getVisitorResponse = await getVisitor(credentials, keyAssetId);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor, visitorInventory } = getVisitorResponse;

    return res.json({
      leaderboard: formattedLeaderboard,
      visitor: { isAdmin: visitor.isAdmin, profileId: credentials.profileId },
      visitorInventory,
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
