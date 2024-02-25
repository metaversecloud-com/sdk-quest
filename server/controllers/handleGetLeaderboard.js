import { errorHandler, getClickedAssetAndKeyAsset, getLongestStreak, getWorldDataObject } from "../utils/index.js";

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

    const { dataObject } = await getWorldDataObject({
      credentials: { ...credentials, assetId: keyAssetId },
      urlSlug,
    });

    let leaderboard = [];
    if (dataObject && dataObject.keyAssets && dataObject?.keyAssets?.[keyAssetId]) {
      const itemsCollectedByUser = dataObject.keyAssets?.[keyAssetId]?.itemsCollectedByUser;
      if (itemsCollectedByUser) {
        for (const profileId in itemsCollectedByUser) {
          const longestStreak = getLongestStreak(itemsCollectedByUser[profileId]);

          leaderboard.push({
            name: dataObject.profileMapper[profileId],
            collected: itemsCollectedByUser[profileId].total,
            profileId,
            streak: longestStreak,
          });
        }
        leaderboard.sort((a, b) => b.collected - a.collected);
      }
    }
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
