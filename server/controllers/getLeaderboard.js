import { error, getLongestStreak, getWorldDataObject } from "../utils/index.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const worldDataObject = await getWorldDataObject(
      {
        interactiveNonce,
        interactivePublicKey,
        visitorId,
      },
      urlSlug,
    );
    let leaderboard = [];
    if (worldDataObject) {
      const { eggsCollectedByUser, itemsCollectedByUser, profileMapper } = worldDataObject;
      const itemsCollected = itemsCollectedByUser || eggsCollectedByUser;
      if (itemsCollected) {
        for (const profileId in itemsCollected) {
          const longestStreak = getLongestStreak(itemsCollected[profileId]);
          let collected = 0;
          Object.values(itemsCollected[profileId]).forEach((day) => {
            if (day === true) collected++;
            if (day.length) collected += day.length;
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
    res.json({ leaderboard, success: true });
  } catch (e) {
    error("Getting leaderboard", e, res);
  }
};
