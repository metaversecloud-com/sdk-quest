import {
  errorHandler,
  getClickedAssetAndKeyAsset,
  getCredentials,
  getLongestStreak,
  getWorldDetails
} from "../utils/index.js";

export const handleGetLeaderboard = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug } = credentials;
    const { isKeyAsset } = req.query;

    let keyAssetId = assetId;
    if (!JSON.parse(isKeyAsset)) {
      const { keyAsset } = await getClickedAssetAndKeyAsset(credentials);
      keyAssetId = keyAsset.id;
    }

    const world = await getWorldDetails({ ...credentials, assetId: keyAssetId });

    let leaderboard = [],
      shouldUpdateDataObject = false;
    let itemsCollectedByUser = world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser;
    if (world.dataObject?.keyAssets?.[keyAssetId]?.questItems) shouldUpdateDataObject = true

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
        name = world.dataObject.profileMapper[profileId];
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
      await world.updateDataObject({
        [`keyAssets.${keyAssetId}.itemsCollectedByUser`]: itemsCollectedByUser,
        [`keyAssets.${keyAssetId}.questItems`]: null
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
