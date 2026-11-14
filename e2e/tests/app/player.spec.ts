// Player flows: the key asset drawer (leaderboard, badges) and clicking quest items hidden in the world.
import {
  CUSTOM_QUEST_IMAGE,
  QUEST_ITEM_ID as ITEM,
  QUEST_ITEM_POSITION as ITEM_POSITION,
  VISITOR_ID,
  day,
  expect,
  progress,
  seedQuest,
  test,
} from "../../fixtures";

test.describe("key asset drawer", () => {
  test("a new player sees what to look for and no admin controls", async ({ page, world }) => {
    await seedQuest(world);

    await page.goto(world.url("/"));

    await expect(page.getByRole("heading", { name: "Quest" })).toBeVisible();
    await expect(page.getByText("Explore and find")).toBeVisible();
    await expect(page.getByRole("img", { name: "Find me" }).first()).toHaveAttribute("src", CUSTOM_QUEST_IMAGE);
    await expect(page.locator("button.icon-with-rounded-border")).toHaveCount(0);
  });

  test("the leaderboard ranks players by items collected and shows my stats", async ({ page, world }) => {
    await seedQuest(world, {
      assetData: {
        numberAllowedToCollect: 5,
        questItemImage: CUSTOM_QUEST_IMAGE,
        leaderboard: { "profile-ana": "Ana|3|2", [world.profileId]: "E2E Player|7|4", "profile-bo": "Bo|12|1" },
      },
    });

    await page.goto(world.url("/"));

    const myStats = page.locator("table").first().locator("tbody tr");
    await expect(myStats).toContainText("2 of 3");
    await expect(myStats.locator("td")).toHaveText(["2 of 3", "4", "7"]);
    const rows = page.locator("table").nth(1).locator("tbody tr");
    await expect(rows).toHaveCount(3);
    await expect(rows.nth(0)).toContainText("Bo");
    await expect(rows.nth(1)).toContainText("E2E Player");
    await expect(rows.nth(2)).toContainText("Ana");
  });

  test("the badges tab shows owned badges in color and the rest greyed out", async ({ page, world }) => {
    await seedQuest(world, { badges: ["First Find"] });

    await page.goto(world.url("/"));
    await page.getByRole("button", { name: "Badges" }).click();

    await expect(page.locator(".tooltip img")).toHaveCount(8);
    await expect(page.getByRole("img", { name: "First Find" })).toHaveCSS("filter", "none");
    await expect(page.getByRole("img", { name: "Inventory Pro" })).toHaveCSS("filter", "grayscale(1)");
  });
});

test.describe("clicking a quest item", () => {
  test("credits the find, re-hides the item and awards First Find", async ({ page, world }) => {
    await seedQuest(world);

    await page.goto(world.questItemUrl(ITEM));

    await expect(page.getByText("🎉 Congratulations! You are one step closer to completing your daily quest!")).toBeVisible();
    await expect(page.getByText("1/5 collected today")).toBeVisible();
    const myStats = page.locator("table").first().locator("tbody tr td");
    await expect(myStats.first()).toHaveText("1 of 1");
    await expect(myStats.last()).toHaveText("1");

    expect(await world.progress()).toMatchObject({ totalCollected: 1, totalCollectedToday: 1, lastCollectedDate: day(0) });
    expect((await world.assetData()).leaderboard[world.profileId]).toMatch(/^E2E Player\|1\|\d+$/);

    // The item moved to a new random spot inside the world, with a fresh link, and puffed smoke where it was.
    const [moved] = await world.events("set-position");
    expect(moved).toMatchObject({ assetId: ITEM });
    expect(Math.abs(moved.x)).toBeLessThanOrEqual(1000);
    expect(Math.abs(moved.y)).toBeLessThanOrEqual(750);
    expect(await world.events("change-click-type")).toContainEqual(
      expect.objectContaining({ assetId: ITEM, clickableLink: expect.stringMatching(/\/quest-item-clicked\/\?lastMoved=\d+$/) }),
    );
    expect(await world.events("particles")).toContainEqual(
      expect.objectContaining({ particleId: "particle-1", position: ITEM_POSITION }),
    );

    const analytics = (await world.events("analytics")).map((a) => a.analyticName);
    expect(analytics).toEqual(expect.arrayContaining(["starts", "itemsCollected"]));
    expect(await world.events("grant-item")).toEqual([expect.objectContaining({ name: "First Find" })]);
    expect(await world.events("fire-toast")).toContainEqual(
      expect.objectContaining({ title: "Badge Awarded", text: "You have earned the First Find badge!" }),
    );
  });

  test("completing the daily quota celebrates and awards Inventory Pro", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 4, totalCollectedToday: 4, lastCollectedDate: day(0) }) },
    });

    await page.goto(world.questItemUrl(ITEM));

    await expect(page.getByText("🎉 Congratulations! You have completed your daily quest!")).toBeVisible();
    await expect(page.getByText("5/5 collected today")).toBeVisible();
    expect(await world.progress()).toMatchObject({ totalCollected: 5, totalCollectedToday: 5 });
    expect(await world.events("particles")).toContainEqual(
      expect.objectContaining({ particleId: "particle-2", followPlayerId: VISITOR_ID }),
    );
    expect(await world.events("grant-item")).toEqual([expect.objectContaining({ name: "Inventory Pro" })]);
    expect((await world.events("analytics")).map((a) => a.analyticName)).toContain("completions");
  });

  test("after the daily quota, finds don't count until tomorrow", async ({ page, world }) => {
    const done = progress({ currentStreak: 2, longestStreak: 2, totalCollected: 9, totalCollectedToday: 5, lastCollectedDate: day(0) });
    await seedQuest(world, { badges: ["First Find"], visitorData: { [world.progressKey]: done } });

    await page.goto(world.questItemUrl(ITEM));

    await expect(page.getByText("🎉 You have already completed your daily quest! Come back tomorrow!")).toBeVisible();
    await expect(page.getByText("5/5 collected today")).toBeVisible();
    expect(await world.progress()).toEqual(done);
    expect(await world.events("set-position")).toEqual([]);
    expect((await world.events("analytics")).map((a) => a.analyticName)).not.toContain("itemsCollected");
  });

  test("a new day starts a fresh daily count", async ({ page, world }) => {
    await seedQuest(world, {
      badges: ["First Find"],
      visitorData: { [world.progressKey]: progress({ totalCollected: 9, totalCollectedToday: 5, lastCollectedDate: day(2) }) },
    });

    await page.goto(world.questItemUrl(ITEM));

    await expect(page.getByText("1/5 collected today")).toBeVisible();
    expect(await world.progress()).toMatchObject({ totalCollected: 10, totalCollectedToday: 1, lastCollectedDate: day(0) });
  });

  test("the drawer keeps showing the quest item after a find", async ({ page, world }) => {
    // Known bug: /quest-item-clicked returns the world's scene entry ({ keyAssetId }) as questDetails,
    // so the client loses questItemImage and the picture at the top of the drawer disappears.
    test.fail(true, "EXP-435: quest item page drops questItemImage");
    await seedQuest(world);

    await page.goto(world.questItemUrl(ITEM));
    await expect(page.getByText("1/5 collected today")).toBeVisible();

    await expect(page.getByRole("img", { name: "Find me" }).first()).toHaveAttribute("src", CUSTOM_QUEST_IMAGE, { timeout: 2000 });
  });
});
