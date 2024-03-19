import { errorHandler, getClickedAssetAndKeyAsset, getLongestStreak, getWorldDetails } from "../utils/index.js";

export const handleGetLeaderboard = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, isKeyAsset, urlSlug, visitorId } = req.query;
    const credentials = {
      assetId,
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    };

    let keyAssetId = assetId;
    if (!JSON.parse(isKeyAsset)) {
      const { keyAsset } = await getClickedAssetAndKeyAsset(credentials);
      keyAssetId = keyAsset.id;
    }

    const world = await getWorldDetails({
      credentials: { ...credentials, assetId: keyAssetId },
      urlSlug,
    });

    let leaderboard = [],
      shouldUpdateDataObject = false;

    let itemsCollectedByUser = world.dataObject?.keyAssets?.[keyAssetId]?.itemsCollectedByUser;

    for (const profileId in itemsCollectedByUser) {
      let streak = itemsCollectedByUser[profileId].longestStreak;
      if (!streak) {
        const { currentStreak, longestStreak, lastCollectedDate } = getLongestStreak(itemsCollectedByUser[profileId]);
        streak = longestStreak;
        itemsCollectedByUser[profileId] = {
          currentStreak,
          lastCollectedDate,
          longestStreak,
          total: itemsCollectedByUser[profileId].total,
          totalCollectedToday: 0,
        };
        shouldUpdateDataObject = true;
      }

      leaderboard.push({
        name: world.dataObject.profileMapper[profileId],
        collected: itemsCollectedByUser[profileId].total,
        profileId,
        streak,
      });
    }

    if (shouldUpdateDataObject) {
      world.updateDataObject({
        [`keyAssets.${keyAssetId}.itemsCollectedByUser`]: itemsCollectedByUser,
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
