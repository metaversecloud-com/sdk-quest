import { error, getLongestStreak, getWorldDataObject } from "../utils/index.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { assetId, interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const { dataObject } = await getWorldDataObject({
      assetId,
      credentials: {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    });

    let leaderboard = [];
    if (dataObject) {
      const { eggsCollectedByUser, itemsCollectedByUser, profileMapper } = dataObject;
      const itemsCollected = itemsCollectedByUser || eggsCollectedByUser;
      if (itemsCollected) {
        for (const profileId in itemsCollected) {
          const longestStreak = getLongestStreak(itemsCollected[profileId]);
          let collected = 0;
          Object.values(itemsCollected[profileId]).forEach((day) => {
            if (day === true) collected++;
            if (day.length > 0) collected += day.length;
          });

          leaderboard.push({
            name: profileMapper[profileId],
            collected,
            profileId,
            streak: longestStreak,
          });
        }
      }
      leaderboard.sort((a, b) => b.collected - a.collected);
    }
    return res.json({ leaderboard, success: true });
  } catch (e) {
    error("Getting leaderboard", e, res);
  }
};
