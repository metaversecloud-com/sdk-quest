import { Request, Response } from "express";
import { DataObjectType } from "../../types/DataObjectType.js";
import {
  DroppedAsset,
  Visitor,
  addNewRowToGoogleSheets,
  errorHandler,
  getBaseURL,
  getCredentials,
  getDifferenceInDays,
  getRandomCoordinates,
  getWorldDetails,
} from "../../utils/index.js";

export const handleQuestItemClicked = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, identityId, profileId, urlSlug, username, visitorId } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    const now = new Date();
    const localDateString = now.toLocaleDateString();
    const currentDate = new Date(localDateString);
    currentDate.setHours(0, 0, 0, 0);

    const analytics = [];

    const visitor = await Visitor.create(visitorId, urlSlug, { credentials });

    const droppedAsset = await DroppedAsset.get(assetId, urlSlug, { credentials });

    const { dataObject, world } = await getWorldDetails(credentials, true);
    const { itemsCollectedByUser, numberAllowedToCollect } = dataObject as DataObjectType;

    const lastCollectedDate = itemsCollectedByUser?.[profileId]?.lastCollectedDate;
    const differenceInDays = getDifferenceInDays(currentDate, new Date(lastCollectedDate));
    const hasCollectedToday = differenceInDays === 0;
    let totalCollectedToday = 1,
      total = 1;

    if (!hasCollectedToday) analytics.push({ analyticName: "starts", profileId, urlSlug, uniqueKey: profileId });

    if (hasCollectedToday && itemsCollectedByUser?.[profileId]?.totalCollectedToday >= numberAllowedToCollect) {
      return res.json({ addedClick: false, numberAllowedToCollect, success: true });
    } else {
      const promises = [];
      analytics.push({ analyticName: "itemsCollected" });

      // Move the quest item to a new random location
      const position = getRandomCoordinates(world.width, world.height);
      promises.push(world.triggerParticle({ position: droppedAsset.position, name: "Smoke" }));
      promises.push(droppedAsset.updatePosition(position.x, position.y));
      promises.push(
        droppedAsset.updateClickType({
          // @ts-ignore
          clickType: "link",
          clickableLinkTitle: "Quest",
          isOpenLinkInDrawer: true,
          clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
        }),
      );

      if (!itemsCollectedByUser?.[profileId]) {
        // first time user has interacted with Quest ever
        promises.push(
          world.updateDataObject({
            [`scenes.${sceneDropId}.itemsCollectedByUser.${profileId}`]: {
              currentStreak: 1,
              lastCollectedDate: currentDate,
              longestStreak: 1,
              total: 1,
              totalCollectedToday: 1,
              username,
            },
            [`scenes.${sceneDropId}.lastInteractionDate`]: new Date(),
          }),
        );
      } else {
        let currentStreak = itemsCollectedByUser[profileId].currentStreak || 1;
        total = itemsCollectedByUser[profileId].total ? itemsCollectedByUser[profileId].total + 1 : 1;

        let longestStreak = itemsCollectedByUser[profileId].longestStreak || 0;

        if (lastCollectedDate) {
          if (hasCollectedToday) {
            totalCollectedToday = itemsCollectedByUser[profileId].totalCollectedToday + 1;
          } else if (differenceInDays === 1) {
            currentStreak = currentStreak + 1;
          }
        }

        if (currentStreak > longestStreak) longestStreak = currentStreak;

        if (totalCollectedToday === numberAllowedToCollect) {
          promises.push(visitor.triggerParticle({ duration: 60, name: "firework3_blue" }));
          analytics.push({ analyticName: "completions", profileId, urlSlug, uniqueKey: profileId });
          addNewRowToGoogleSheets([
            {
              identityId,
              displayName,
              event: "completions",
            },
          ]);
        }

        promises.push(
          world.updateDataObject({
            [`scenes.${sceneDropId}.itemsCollectedByUser.${profileId}`]: {
              currentStreak,
              lastCollectedDate: currentDate,
              longestStreak,
              total,
              totalCollectedToday,
              username,
            },
          }),
        );
      }

      if (total % 50 === 0) {
        analytics.push({ analyticName: `itemsCollected${total}`, profileId, uniqueKey: profileId });

        const name = process.env.EMOTE_NAME || "quest_1";
        const grantExpressionResult = await visitor.grantExpression({ name });

        let title = "🔎 New Emote Unlocked",
          text = "Congrats! Your detective skills paid off.";
        // @ts-ignore
        if (grantExpressionResult.data?.statusCode === 200) {
          promises.push(visitor.triggerParticle({ name: "firework2_gold" }));
          analytics.push({ analyticName: `${name}-emoteUnlocked`, urlSlug, uniqueKey: urlSlug });
        }
        // @ts-ignore
        else if (grantExpressionResult.data?.statusCode === 409) {
          title = `Congrats! You collected ${total} quest items`;
          text = "Keep up the solid detective work 🔎";
        }

        promises.push(
          visitor.fireToast({
            groupId: "QuestExpression",
            title,
            text,
          }),
        );
      }

      promises.push(world.incrementDataObjectValue([`scenes.${sceneDropId}.totalItemsCollected`], 1, { analytics }));

      await Promise.all(promises);

      return res.json({
        addedClick: true,
        numberAllowedToCollect,
        totalCollectedToday,
        success: true,
      });
    }
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleQuestItemClicked",
      message: "Error updating dropped asset update position, click type, and world/visitor data object",
      req,
      res,
    });
  }
};
