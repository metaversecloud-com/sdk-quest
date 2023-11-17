import { error, getDroppedAssetDetails, getLongestStreak, getWorldDataObject } from "../utils/index.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, isKeyAsset, urlSlug, visitorId } = req.query;

    let keyAssetId = assetId;
    if (!JSON.parse(isKeyAsset)) {
      const droppedAsset = await getDroppedAssetDetails({
        credentials: {
          assetId,
          interactiveNonce,
          interactivePublicKey,
          visitorId,
        },
        droppedAssetId: assetId,
        urlSlug,
      });
      keyAssetId = droppedAsset.uniqueName;
    }

    const { dataObject } = await getWorldDataObject({
      assetId: keyAssetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
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
  } catch (e) {
    error("Getting leaderboard", e, res);
  }
};
