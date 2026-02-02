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
  awardBadge,
} from "../../utils/index.js";
import { AxiosError } from "axios";

export const handleQuestItemClicked = async (req: Request, res: Response) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, displayName, identityId, profileId, urlSlug } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    const now = new Date();
    const localDateString = now.toLocaleDateString();
    const currentDate = new Date(localDateString);
    currentDate.setHours(0, 0, 0, 0);

    const analytics = [],
      promises = [];

    const questItem = await DroppedAsset.get(assetId, urlSlug, { credentials });

    const getWorldDetailsResponse = await getWorldDetails(credentials, true);
    if (getWorldDetailsResponse instanceof Error) throw getWorldDetailsResponse;

    const { dataObject: worldDataObject, world } = getWorldDetailsResponse;

    let { keyAssetId, numberAllowedToCollect } = worldDataObject as WorldDataObjectType;
    if (typeof numberAllowedToCollect === "string") numberAllowedToCollect = parseInt(numberAllowedToCollect);

    const getVisitorResponse = await getVisitor(credentials, keyAssetId);
    if (getVisitorResponse instanceof Error) throw getVisitorResponse;

    const { visitor, visitorProgress, visitorInventory } = getVisitorResponse;

    let { currentStreak, lastCollectedDate, longestStreak, totalCollected, totalCollectedToday } = visitorProgress;

    // Award First Find badge if visitor collected their first quest item
    if (totalCollected === 0) {
      promises.push(
        awardBadge({ credentials, visitor, visitorInventory, badgeName: "First Find" }).catch((error) =>
          errorHandler({
            error,
            functionName: "handleQuestItemClicked",
            message: "Error awarding First Find badge",
          }),
        ),
      );
    }

    const differenceInDays = getDifferenceInDays(currentDate, new Date(lastCollectedDate));
    const hasCollectedToday = differenceInDays === 0;

    if (!hasCollectedToday) analytics.push({ analyticName: "starts", profileId, urlSlug, uniqueKey: profileId });

    if (hasCollectedToday && totalCollectedToday >= numberAllowedToCollect) {
      return res.json({ addedClick: false, numberAllowedToCollect, questDetails: worldDataObject });
    } else {
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

      promises.push(
        world
          .triggerParticle({ position: questItem.position, name: "lightBlueSmoke_puff" })
          .catch((error: AxiosError) =>
            errorHandler({
              error,
              functionName: "handleQuestItemClicked",
              message: "Error triggering particle effects",
            }),
          ),
      );

      totalCollected = totalCollected + 1;

      // Award Quest Veteran badges if visitor collected [x] quest items
      let veteranBadgeName;
      if (totalCollected === 25) veteranBadgeName = "Quest Veteran - Bronze";
      else if (totalCollected === 50) veteranBadgeName = "Quest Veteran - Silver";
      else if (totalCollected === 75) veteranBadgeName = "Quest Veteran - Gold";
      else if (totalCollected === 100) veteranBadgeName = "Quest Veteran - Diamond";
      if (veteranBadgeName) {
        promises.push(
          awardBadge({ credentials, visitor, visitorInventory, badgeName: veteranBadgeName }).catch((error) =>
            errorHandler({
              error,
              functionName: "handleQuestItemClicked",
              message: `Error awarding ${veteranBadgeName} badge`,
            }),
          ),
        );
      }

      if (!hasCollectedToday) {
        totalCollectedToday = 1;
        if (differenceInDays === 1) {
          currentStreak = currentStreak + 1;

          // Award Streak badges if visitor collected their item for 3 or 5 days in a row
          if (currentStreak === 3) {
            promises.push(
              awardBadge({ credentials, visitor, visitorInventory, badgeName: "3-Day Streak" }).catch((error) =>
                errorHandler({
                  error,
                  functionName: "handleQuestItemClicked",
                  message: "Error awarding 3-Day Streak badge",
                }),
              ),
            );
          } else if (currentStreak === 5) {
            promises.push(
              awardBadge({ credentials, visitor, visitorInventory, badgeName: "5-Day Streak" }).catch((error) =>
                errorHandler({
                  error,
                  functionName: "handleQuestItemClicked",
                  message: "Error awarding 5-Day Streak badge",
                }),
              ),
            );
          }
        }
      } else {
        totalCollectedToday = totalCollectedToday + 1;
      }

      if (currentStreak > longestStreak) longestStreak = currentStreak;

      if (totalCollectedToday === numberAllowedToCollect) {
        promises.push(
          visitor.triggerParticle({ duration: 60, name: "redPinkHeart_float" }).catch((error: AxiosError) =>
            errorHandler({
              error,
              functionName: "handleQuestItemClicked",
              message: "Error triggering particle effects",
            }),
          ),
        );

        analytics.push({ analyticName: "completions", profileId, urlSlug, uniqueKey: profileId });
        promises.push(
          addNewRowToGoogleSheets([
            {
              identityId,
              displayName,
              event: "completions",
              urlSlug,
            },
          ]),
        );

        // Award Inventory Pro badge if visitor has collected all allowed quest items for the day
        promises.push(
          awardBadge({ credentials, visitor, visitorInventory, badgeName: "Inventory Pro" }).catch((error) =>
            errorHandler({
              error,
              functionName: "handleQuestItemClicked",
              message: "Error awarding Inventory Pro badge",
            }),
          ),
        );
      }

      promises.push(
        visitor.updateDataObject(
          {
            [`${urlSlug}-${sceneDropId}`]: {
              currentStreak,
              lastCollectedDate: currentDate,
              longestStreak,
              totalCollected,
              totalCollectedToday,
            },
          },
          {},
        ),
      );

      if (totalCollected % 50 === 0) {
        analytics.push({ analyticName: `itemsCollected${totalCollected}`, profileId, uniqueKey: profileId });

        const name = process.env.EMOTE_NAME || "quest_1";
        // @ts-ignore
        const awardExpressionResult = await visitor.awardExpression({ name });

        let title = "🔎 New Emote Unlocked",
          text = "Congrats! Your detective skills paid off.";
        // @ts-ignore
        if (awardExpressionResult.data?.statusCode === 200 || awardExpressionResult.status === 200) {
          promises.push(
            visitor.triggerParticle({ name: "firework2_gold" }).catch((error: AxiosError) =>
              errorHandler({
                error,
                functionName: "handleQuestItemClicked",
                message: "Error triggering particle effects",
              }),
            ),
          );

          analytics.push({ analyticName: `${name}-emoteUnlocked`, urlSlug, uniqueKey: urlSlug });
          // @ts-ignore
        } else if (awardExpressionResult.data?.statusCode === 409 || awardExpressionResult.status === 409) {
          title = `Congrats! You collected ${totalCollected} quest items`;
          text = "Keep up the solid detective work 🔎";
        }

        promises.push(
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
            ),
        );
      }

      const getKeyAssetResponse = await getKeyAsset(credentials, keyAssetId);
      if (getKeyAssetResponse instanceof Error) throw getKeyAssetResponse;

      const keyAsset = getKeyAssetResponse;

      promises.push(
        keyAsset.updateDataObject(
          {
            [`leaderboard.${profileId}`]: `${displayName}|${totalCollected}|${longestStreak}`,
          },
          { analytics },
        ),
      );

      const results = await Promise.allSettled(promises);
      results.forEach((result) => {
        if (result.status === "rejected") console.error(result.reason);
      });

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
