// Game rules: streaks, milestone badges, the emote unlock, daily limits and Quest instances.
import { Page } from "@playwright/test";
import {
  CUSTOM_QUEST_IMAGE,
  KEY_ASSET_ID,
  QUEST_ITEM_ID,
  SCENE_DROP_ID,
  TopiaWorld,
  VISITOR_ID,
  day,
  expect,
  progress,
  questItem,
  questScene,
  seedQuest,
  test,
} from "../../fixtures";

/** Clicks the quest item the way Topia opens it and waits for the result. */
const collect = async (page: Page, world: TopiaWorld, assetId = QUEST_ITEM_ID) => {
  await page.goto(world.questItemUrl(assetId));
  await expect(page.getByText(/collected today|already been found|Quest has/)).toBeVisible();
};

const granted = async (world: TopiaWorld) => (await world.events("grant-item")).map((e) => e.name);
const analytics = async (world: TopiaWorld) => (await world.events("analytics")).map((e) => e.analyticName);

test.describe("streaks", () => {
  test("a first find starts a streak of one day", async ({ page, world }) => {
    // Known bug: the streak only grows when the last find was exactly yesterday, so a first find
    // (no previous date) leaves it at 0 and every streak badge needs one day more than its name says.
    test.fail(true, "EXP-435: first find leaves the streak at 0");
    await seedQuest(world);

    await collect(page, world);

    expect(await world.progress()).toMatchObject({ currentStreak: 1, longestStreak: 1 });
  });

  test("finding an item on the next day extends the streak", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: {
        [world.progressKey]: progress({ currentStreak: 1, longestStreak: 1, totalCollected: 5, totalCollectedToday: 5, lastCollectedDate: day(1) }),
      },
    });

    await collect(page, world);

    expect(await world.progress()).toMatchObject({ currentStreak: 2, longestStreak: 2, totalCollectedToday: 1 });
    expect((await world.assetData()).leaderboard[world.profileId]).toBe("E2E Player|6|2");
  });

  for (const [days, badge] of [
    [3, "3-Day Streak"],
    [5, "5-Day Streak"],
  ] as const) {
    test(`day ${days} in a row awards ${badge}`, async ({ page, world }) => {
      await seedQuest(world, {
        badges: ["First Find"],
        visitorData: {
          [world.progressKey]: progress({ currentStreak: days - 1, longestStreak: days - 1, totalCollected: 10, lastCollectedDate: day(1) }),
        },
      });

      await collect(page, world);

      expect(await world.progress()).toMatchObject({ currentStreak: days });
      expect(await granted(world)).toEqual([badge]);
    });
  }

  test("missing a day restarts the streak but keeps the longest one", async ({ page, world }) => {
    // Known bug: when the last find is older than yesterday the streak is left untouched, so a
    // player who skips days keeps their streak (and can still earn the streak badges).
    test.fail(true, "EXP-435: a missed day doesn't reset the streak");
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: {
        [world.progressKey]: progress({ currentStreak: 4, longestStreak: 4, totalCollected: 20, lastCollectedDate: day(3) }),
      },
    });

    await collect(page, world);

    expect(await world.progress()).toMatchObject({ currentStreak: 1, longestStreak: 4 });
  });
});

test.describe("milestones", () => {
  test("the 25th find awards Quest Veteran - Bronze", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 24, lastCollectedDate: day(0), totalCollectedToday: 1 }) },
    });

    await collect(page, world);

    expect(await granted(world)).toEqual(["Quest Veteran - Bronze"]);
  });

  test("the 50th find awards Quest Veteran - Silver and unlocks the Quest emote", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 49, lastCollectedDate: day(0), totalCollectedToday: 1 }) },
    });

    await collect(page, world);

    expect(await granted(world)).toEqual(["Quest Veteran - Silver"]);
    expect(await world.events("grant-expression")).toEqual([expect.objectContaining({ name: "quest_1" })]);
    expect(await analytics(world)).toContain("itemsCollected50");
    expect(await world.events("fire-toast")).toContainEqual(
      expect.objectContaining({ groupId: "QuestExpression", title: "🔎 New Emote Unlocked" }),
    );
  });

  // Known bug: grantExpression resolves to the response body ({ success: true } or, for a repeat
  // grant, { statusCode: 409 }), but the app reads data.statusCode/status from it, so neither branch
  // runs: no fireworks or emoteUnlocked analytic, and owners are told they unlocked it again.
  const EMOTE_RESULT = "EXP-435: grantExpression result is read at the wrong level";

  test("a newly unlocked emote is celebrated with fireworks and counted", async ({ page, world }) => {
    test.fail(true, EMOTE_RESULT);
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 49, lastCollectedDate: day(0), totalCollectedToday: 1 }) },
    });

    await collect(page, world);

    expect(await world.events("particles")).toContainEqual(expect.objectContaining({ particleId: "particle-3", followPlayerId: VISITOR_ID }));
    expect(await analytics(world)).toContain("quest_1-emoteUnlocked");
  });

  test("the 100th find with the emote already owned congratulates instead", async ({ page, world }) => {
    test.fail(true, EMOTE_RESULT);
    await seedQuest(world, {
      badges: ["First Find"],
      expressions: ["quest_1"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 99, lastCollectedDate: day(0), totalCollectedToday: 1 }) },
    });

    await collect(page, world);

    expect(await granted(world)).toEqual(["Quest Veteran - Diamond"]);
    expect(await world.events("grant-expression")).toEqual([]);
    expect(await world.events("fire-toast")).toContainEqual(
      expect.objectContaining({ title: "Congrats! You collected 100 quest items" }),
    );
  });

  test("badges the player already owns aren't granted again", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find", "Quest Veteran - Bronze"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 24, lastCollectedDate: day(0), totalCollectedToday: 1 }) },
    });

    await collect(page, world);

    expect(await granted(world)).toEqual([]);
    expect(await world.events("fire-toast")).toEqual([]);
  });
});

test.describe("configuration", () => {
  test("the admin's daily limit decides when the quest is complete", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find"],
      assetData: { numberAllowedToCollect: 2, questItemImage: CUSTOM_QUEST_IMAGE, leaderboard: {} },
      visitorData: { [world.progressKey]: progress({ totalCollected: 1, totalCollectedToday: 1, lastCollectedDate: day(0) }) },
    });

    await collect(page, world);

    await expect(page.getByText("🎉 Congratulations! You have completed your daily quest!")).toBeVisible();
    await expect(page.getByText("2/2 collected today")).toBeVisible();
    expect(await granted(world)).toEqual(["Inventory Pro"]);
  });

  test("a Quest set up before the config move keeps its world settings", async ({ page, world }) => {
    const legacyImage = "https://example.invalid/quest/legacy-egg.png";
    await world.seed({
      worldData: questScene({ numberAllowedToCollect: 3, questItemImage: legacyImage }),
      assetData: {},
    });

    await page.goto(world.url("/"));

    await expect(page.getByRole("img", { name: "Find me" }).first()).toHaveAttribute("src", legacyImage);
    expect(await world.assetData()).toEqual({ numberAllowedToCollect: 3, questItemImage: legacyImage, leaderboard: {} });
    // Legacy fields stay on the world so older app versions keep working.
    expect((await world.state()).dataObject.scenes[SCENE_DROP_ID]).toMatchObject({ keyAssetId: KEY_ASSET_ID, numberAllowedToCollect: 3 });
  });

  test("two Quests in the same world keep separate progress and leaderboards", async ({ page, world }) => {
    const otherScene = "scene-2";
    const otherKey = "key-asset-2";
    const otherProgress = progress({ totalCollected: 30, totalCollectedToday: 5, lastCollectedDate: day(0) });
    await seedQuest(world, {
      badges: ["First Find"],
      worldData: { scenes: { [SCENE_DROP_ID]: { keyAssetId: KEY_ASSET_ID }, [otherScene]: { keyAssetId: otherKey } } },
      visitorData: { [`${world.urlSlug}-${otherScene}`]: otherProgress },
      extraAssets: {
        [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID),
        [otherKey]: { id: otherKey, sceneDropId: otherScene, dataObject: { numberAllowedToCollect: 5, leaderboard: { [world.profileId]: "E2E Player|30|0" } } },
      },
    });

    await collect(page, world);

    expect(await world.progress()).toMatchObject({ totalCollected: 1, totalCollectedToday: 1 });
    expect((await world.visitorData())[`${world.urlSlug}-${otherScene}`]).toEqual(otherProgress);
    expect((await world.assetData(otherKey)).leaderboard[world.profileId]).toBe("E2E Player|30|0");
  });
});

test.describe("orphaned quest items", () => {
  const seedOrphans = (world: TopiaWorld, isAdmin: boolean) =>
    world.seed({
      isAdmin,
      withAsset: false, // the admin deleted the key asset by hand
      worldData: { scenes: { [SCENE_DROP_ID]: { keyAssetId: KEY_ASSET_ID }, "scene-2": { keyAssetId: "key-asset-2" } } },
      extraAssets: {
        [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID),
        "quest-item-2": questItem("quest-item-2"),
        "key-asset-2": { id: "key-asset-2", sceneDropId: "scene-2", dataObject: {} },
        "other-quest-item": questItem("other-quest-item", { sceneDropId: "scene-2", uniqueName: "questItem_scene-2" }),
      },
    });

  test("a click on a leftover item clears that Quest's items and tells the player it ended", async ({ page, world }) => {
    await seedOrphans(world, false);

    await page.goto(world.questItemUrl(QUEST_ITEM_ID));

    await expect(page.getByRole("heading", { name: "This Quest has ended" })).toBeVisible();
    expect(Object.keys((await world.state()).assets).sort()).toEqual(["key-asset-2", "other-quest-item"]);
    expect(await world.progress()).toBeUndefined();
  });

  test("an admin is told how to set the Quest up again", async ({ page, world }) => {
    await seedOrphans(world, true);

    await page.goto(world.questItemUrl(QUEST_ITEM_ID));

    await expect(page.getByRole("heading", { name: "This Quest has been removed" })).toBeVisible();
    await expect(page.getByText("To start a new Quest, add the Quest app again.")).toBeVisible();
  });
});
