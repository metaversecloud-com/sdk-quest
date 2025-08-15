import { Request, Response } from "express";
import { WorldDataObjectType } from "../../types/DataObjectTypes.js";
import {
  DroppedAsset,
  addNewRowToGoogleSheets,
  errorHandler,
  getBaseURL,
  getCredentials,
  getDifferenceInDays,
  getKeyAsset,
  getRandomCoordinates,
  getVisitor,
  getWorldDetails,
} from "../../utils/index.js";
import { AxiosError } from "axios";

export const handleQuestItemClicked = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, identityId, profileId, urlSlug, username } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    const now = new Date();
    const localDateString = now.toLocaleDateString();
    const currentDate = new Date(localDateString);
    currentDate.setHours(0, 0, 0, 0);

    const analytics = [];

    const questItem = await DroppedAsset.get(assetId, urlSlug, { credentials });

    const { dataObject: worldDataObject, world } = await getWorldDetails(credentials, true);
    let { keyAssetId, numberAllowedToCollect } = worldDataObject as WorldDataObjectType;
    if (typeof numberAllowedToCollect === "string") numberAllowedToCollect = parseInt(numberAllowedToCollect);

    const { visitor, visitorProgress } = await getVisitor(credentials);

    let { currentStreak, lastCollectedDate, longestStreak, totalCollected, totalCollectedToday } = visitorProgress;

    const differenceInDays = getDifferenceInDays(currentDate, new Date(lastCollectedDate));
    const hasCollectedToday = differenceInDays === 0;

    if (!hasCollectedToday) analytics.push({ analyticName: "starts", profileId, urlSlug, uniqueKey: profileId });

    if (hasCollectedToday && totalCollectedToday >= numberAllowedToCollect) {
      return res.json({ addedClick: false, numberAllowedToCollect, questDetails: worldDataObject });
    } else {
      const promises = [];
      analytics.push({ analyticName: "itemsCollected" });

      // Move the quest item to a new random location
      const position = getRandomCoordinates(world.width, world.height);
      promises.push(questItem.updatePosition(position.x, position.y));
      promises.push(
        questItem.updateClickType({
          // @ts-ignore
          clickType: "link",
          clickableLinkTitle: "Quest",
          isOpenLinkInDrawer: true,
          clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
        }),
      );

      world.triggerParticle({ position: questItem.position, name: "lightBlueSmoke_puff" }).catch((error: AxiosError) =>
        errorHandler({
          error,
          functionName: "handleQuestItemClicked",
          message: "Error triggering particle effects",
        }),
      );

      totalCollected = totalCollected + 1;
      if (lastCollectedDate) {
        if (!hasCollectedToday) {
          totalCollectedToday = 1;
          if (differenceInDays === 1) currentStreak = currentStreak + 1;
        } else if (hasCollectedToday) {
          totalCollectedToday = totalCollectedToday + 1;
        }
      }

      if (currentStreak > longestStreak) longestStreak = currentStreak;

      if (totalCollectedToday === numberAllowedToCollect) {
        visitor.triggerParticle({ duration: 60, name: "redPinkHeart_float" }).catch((error: AxiosError) =>
          errorHandler({
            error,
            functionName: "handleQuestItemClicked",
            message: "Error triggering particle effects",
          }),
        );

        analytics.push({ analyticName: "completions", profileId, urlSlug, uniqueKey: profileId });
        addNewRowToGoogleSheets([
          {
            identityId,
            displayName,
            event: "completions",
            urlSlug,
          },
        ]);
      }

      promises.push(
        visitor.updateDataObject({
          [`${urlSlug}-${sceneDropId}`]: {
            currentStreak,
            lastCollectedDate: currentDate,
            longestStreak,
            totalCollected,
            totalCollectedToday,
            username,
          },
        }),
      );

      if (totalCollected % 50 === 0) {
        analytics.push({ analyticName: `itemsCollected${totalCollected}`, profileId, uniqueKey: profileId });

        const name = process.env.EMOTE_NAME || "quest_1";
        const grantExpressionResult = await visitor.grantExpression({ name });

        let title = "🔎 New Emote Unlocked",
          text = "Congrats! Your detective skills paid off.";
        // @ts-ignore
        if (grantExpressionResult.data?.statusCode === 200 || grantExpressionResult.status === 200) {
          visitor.triggerParticle({ name: "firework2_gold" }).catch((error: AxiosError) =>
            errorHandler({
              error,
              functionName: "handleQuestItemClicked",
              message: "Error triggering particle effects",
            }),
          );

          analytics.push({ analyticName: `${name}-emoteUnlocked`, urlSlug, uniqueKey: urlSlug });
        } else if (grantExpressionResult.data?.statusCode === 409 || grantExpressionResult.status === 409) {
          title = `Congrats! You collected ${totalCollected} quest items`;
          text = "Keep up the solid detective work 🔎";
        }

        visitor
          .fireToast({
            groupId: "QuestExpression",
            title,
            text,
          })
          .catch((error: AxiosError) =>
            errorHandler({
              error,
              functionName: "handleQuestItemClicked",
              message: "Error firing toast",
            }),
          );
      }

      const keyAsset = await getKeyAsset(credentials, keyAssetId);
      promises.push(
        keyAsset.updateDataObject(
          {
            [`leaderboard.${profileId}`]: `${displayName}|${totalCollected}|${longestStreak}`,
          },
          { analytics },
        ),
      );

      await Promise.all(promises);

      return res.json({
        addedClick: true,
        numberAllowedToCollect,
        totalCollectedToday,
        questDetails: worldDataObject,
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
