import { Request, Response } from "express";
import {
  errorHandler,
  getClickedAssetAndKeyAsset,
  getCredentials,
  getLongestStreak,
  getWorldDetails
} from "../utils/index.js";

export const handleGetLeaderboard = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug, username } = credentials;
    const { isKeyAsset } = req.query;

    let keyAssetId = assetId;
    if (!JSON.parse(isKeyAsset as string)) {
      const { keyAsset } = await getClickedAssetAndKeyAsset(credentials);
      keyAssetId = keyAsset.id;
    }

    const world = await getWorldDetails({ ...credentials, assetId: keyAssetId });

    let leaderboard = [],
      shouldUpdateDataObject = false;
    const keyAssets = world.dataObject?.keyAssets
    const profileMapper = world.dataObject?.profileMapper
    let itemsCollectedByUser = keyAssets?.[keyAssetId]?.itemsCollectedByUser;
    if (keyAssets?.[keyAssetId]?.questItems) shouldUpdateDataObject = true

    for (const profileId in itemsCollectedByUser) {
      const thisUsersItems = itemsCollectedByUser[profileId]
      let streak = thisUsersItems.longestStreak;
      if (!streak) {
        const { currentStreak, longestStreak, lastCollectedDate } = getLongestStreak(thisUsersItems);
        streak = longestStreak;
        itemsCollectedByUser[profileId] = {
          currentStreak,
          lastCollectedDate,
          longestStreak,
          total: thisUsersItems.total,
          totalCollectedToday: 0,
          username
        };
        shouldUpdateDataObject = true;
      }

      let name = thisUsersItems.username;
      if (!name) {
        name = profileMapper[profileId];
        itemsCollectedByUser[profileId].username = name;
        shouldUpdateDataObject = true;
      }

      leaderboard.push({
        name,
        collected: thisUsersItems.total,
        profileId,
        streak,
      });
    }

    if (shouldUpdateDataObject) {
      // If only one active instance with user data then remove profile mapper
      let removeProfileMapper = true
      if (!profileMapper) removeProfileMapper = false;
      else if (Object.keys(keyAssets).length > 1) {
        let activeQuestCount = 0
        for (const index in keyAssets) {
          if (keyAssets[index].itemsCollectedByUser && Object.keys(keyAssets[index].itemsCollectedByUser).length > 0) {
            activeQuestCount = 0
          }
          if (activeQuestCount > 1) removeProfileMapper = false
        }
      }
      if (removeProfileMapper) world.updateDataObject({ [`profileMapper`]: null })

      await world.updateDataObject({
        [`keyAssets.${keyAssetId}.itemsCollectedByUser`]: itemsCollectedByUser,
        [`keyAssets.${keyAssetId}.questItems`]: null,
      }, {
        lock: {
          lockId: `${urlSlug}-${assetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`,
          releaseLock: true,
        }
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
