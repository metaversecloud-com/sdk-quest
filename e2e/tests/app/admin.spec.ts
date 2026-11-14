// Admin flows in the key asset drawer: setup, hiding and removing items, settings, image uploads.
import { Page } from "@playwright/test";
import { MOCK_TOPIA_URL, S3_BUCKET } from "../../constants";
import {
  CUSTOM_QUEST_IMAGE,
  DEFAULT_QUEST_IMAGE,
  KEY_ASSET_ID,
  QUEST_ITEM_ID,
  QUEST_ITEM_UNIQUE_NAME,
  SCENE_DROP_ID,
  TopiaWorld,
  expect,
  questItem,
  seedQuest,
  test,
} from "../../fixtures";

const NEW_IMAGE = "https://example.invalid/quest/star.png";
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

const openSettings = async (page: Page, world: TopiaWorld) => {
  await page.goto(world.url("/"));
  await page.locator("button.icon-with-rounded-border").click();
  await expect(page.getByText("Number Allowed To Collect Per Day:")).toBeVisible();
};

const s3Keys = async (page: Page) =>
  ((await (await page.request.get(`${MOCK_TOPIA_URL}/__mock/s3`)).json()) as { key: string; size: number; contentType: string }[]);

test.beforeEach(async ({ page }) => {
  // Uploaded images point at the (fake) bucket's public URL; never let the browser fetch from S3.
  await page.route(`https://${S3_BUCKET}.s3.amazonaws.com/**`, (route) =>
    route.fulfill({ contentType: "image/png", body: PNG }),
  );
});

test("only admins see the settings button", async ({ page, world }) => {
  await seedQuest(world, { isAdmin: false });
  await page.goto(world.url("/"));
  await expect(page.getByRole("heading", { name: "Quest" })).toBeVisible();
  await expect(page.locator("button.icon-with-rounded-border")).toHaveCount(0);

  await seedQuest(world, { isAdmin: true });
  await page.reload();
  await expect(page.locator("button.icon-with-rounded-border")).toBeVisible();
});

test("the first open links the scene to the key asset and seeds the defaults", async ({ page, world }) => {
  await world.seed({ isAdmin: true });

  await page.goto(world.url("/"));

  await expect(page.getByRole("img", { name: "Find me" }).first()).toHaveAttribute("src", DEFAULT_QUEST_IMAGE);
  expect((await world.state()).dataObject).toEqual({ scenes: { [SCENE_DROP_ID]: { keyAssetId: KEY_ASSET_ID } } });
  expect(await world.assetData()).toEqual({ numberAllowedToCollect: 5, questItemImage: DEFAULT_QUEST_IMAGE, leaderboard: {} });
});

test("hiding an item drops a clickable quest item somewhere in the world", async ({ page, world }) => {
  await seedQuest(world, { isAdmin: true, extraAssets: {} });
  await openSettings(page, world);
  await expect(page.getByText("0 hidden in this world")).toBeVisible();

  await page.getByRole("button", { name: /^Hide/ }).click();

  await expect(page.getByText("1 hidden in this world")).toBeVisible();
  const dropped = Object.values((await world.state()).assets).filter((a) => a.id !== KEY_ASSET_ID);
  expect(dropped).toEqual([
    expect.objectContaining({
      assetId: "webImageAsset",
      uniqueName: QUEST_ITEM_UNIQUE_NAME,
      sceneDropId: SCENE_DROP_ID,
      layer1: CUSTOM_QUEST_IMAGE,
      isInteractive: true,
      interactivePublicKey: "e2e-public-key",
      clickType: "link",
      isOpenLinkInDrawer: true,
      clickableLink: expect.stringMatching(/^https:\/\/localhost:\d+\/quest-item-clicked\/\?lastMoved=\d+$/),
    }),
  ]);
  expect(Math.abs(dropped[0].position.x)).toBeLessThanOrEqual(1000);
  expect(Math.abs(dropped[0].position.y)).toBeLessThanOrEqual(750);
});

test("placed items can be walked to and removed one by one", async ({ page, world }) => {
  await seedQuest(world, {
    isAdmin: true,
    extraAssets: {
      [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID, { position: { x: 120, y: -80 } }),
      "quest-item-2": questItem("quest-item-2", { position: { x: -300, y: 410 } }),
    },
  });
  await openSettings(page, world);
  await expect(page.getByText("2 hidden in this world")).toBeVisible();
  const firstRow = page.locator("tr").filter({ has: page.getByRole("img", { name: "Walk to" }) }).first();

  await firstRow.getByRole("button").filter({ has: page.getByRole("img", { name: "Walk to" }) }).click();
  await expect.poll(() => world.events("move")).toEqual([expect.objectContaining({ moveTo: { x: 120, y: -80 } })]);

  await firstRow.getByRole("button").filter({ has: page.getByRole("img", { name: "Remove" }) }).click();
  await expect(page.getByText("1 hidden in this world")).toBeVisible();
  expect(Object.keys((await world.state()).assets).sort()).toEqual([KEY_ASSET_ID, "quest-item-2"]);
});

test("remove all clears this Quest's items and nothing else", async ({ page, world }) => {
  await seedQuest(world, {
    isAdmin: true,
    extraAssets: {
      [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID),
      "quest-item-2": questItem("quest-item-2"),
      tree: { id: "tree", assetName: "Tree", sceneDropId: SCENE_DROP_ID, uniqueName: "tree" },
      "other-quest-item": questItem("other-quest-item", { sceneDropId: "scene-2", uniqueName: "questItem_scene-2" }),
    },
  });
  await openSettings(page, world);

  await page.getByRole("button", { name: "Remove all items" }).click();

  await expect(page.getByText("0 hidden in this world")).toBeVisible();
  expect(Object.keys((await world.state()).assets).sort()).toEqual([KEY_ASSET_ID, "other-quest-item", "tree"]);
});

test("saving settings updates the key asset and re-skins every hidden item", async ({ page, world }) => {
  await seedQuest(world, {
    isAdmin: true,
    extraAssets: { [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID), "quest-item-2": questItem("quest-item-2") },
  });
  await openSettings(page, world);

  await page.locator('input[name="numberAllowedToCollect"]').fill("3");
  await page.getByRole("button", { name: "Change Image" }).click();
  await page.getByRole("textbox", { name: "Image URL" }).fill(NEW_IMAGE);
  await page.getByRole("button", { name: "Done" }).click();
  await page.getByRole("button", { name: "Save" }).click();

  await expect.poll(async () => (await world.assetData()).questItemImage).toBe(NEW_IMAGE);
  expect(Number((await world.assetData()).numberAllowedToCollect)).toBe(3);
  await expect.poll(async () => (await world.events("set-webimage-layers")).map((e) => [e.assetId, e.top]).sort()).toEqual([
    [QUEST_ITEM_ID, NEW_IMAGE],
    ["quest-item-2", NEW_IMAGE],
  ]);
  expect((await world.assetData(QUEST_ITEM_ID)).questItemImage).toBe(NEW_IMAGE);
});

test("removing the Quest deletes its items and key asset and leaves a tombstone", async ({ page, world }) => {
  await seedQuest(world, {
    isAdmin: true,
    extraAssets: { [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID), tree: { id: "tree", sceneDropId: SCENE_DROP_ID, uniqueName: "tree" } },
  });
  await openSettings(page, world);

  await page.getByRole("button", { name: "Remove Quest from world" }).click();
  await page.locator(".modal").getByRole("button", { name: "Remove" }).click();

  await expect.poll(async () => Object.keys((await world.state()).assets)).toEqual(["tree"]);
  expect((await world.state()).dataObject.scenes[SCENE_DROP_ID]).toMatch(/^Removed from world on /);
  expect(await world.events("fire-toast")).toContainEqual(expect.objectContaining({ title: "Quest Successfully Removed" }));
  expect(await world.events("close-iframe")).toHaveLength(1);
});

test("opening the remove dialog doesn't save half-edited settings", async ({ page, world }) => {
  // Known bug: "Remove Quest from world" is a submit button inside the settings form, so opening
  // the dialog also posts /admin-settings with whatever is in the form.
  test.fail(true, "EXP-435: Remove Quest button submits the settings form");
  await seedQuest(world, { isAdmin: true });
  await openSettings(page, world);

  await page.locator('input[name="numberAllowedToCollect"]').fill("9");
  await page.getByRole("button", { name: "Remove Quest from world" }).click();
  await page.locator(".modal").getByRole("button", { name: "Close" }).click();
  await page.waitForLoadState("networkidle");

  expect((await world.assetData()).numberAllowedToCollect).toBe(5);
});

test.describe("image uploads", () => {
  test("an uploaded image goes to the app's S3 folder and becomes the quest item image", async ({ page, world }) => {
    await seedQuest(world, { isAdmin: true });
    await openSettings(page, world);
    const expectedKey = `userUploads/e2e-public-key/${world.profileId}_gem.png`;

    await page.getByRole("button", { name: "Change Image" }).click();
    await page.getByRole("button", { name: "Upload", exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles({ name: "gem.png", mimeType: "image/png", buffer: PNG });

    const publicUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${expectedKey}`;
    await expect(page.getByRole("img", { name: "Quest Item Image: preview" })).toHaveAttribute("src", publicUrl);
    expect(await s3Keys(page)).toContainEqual({ key: expectedKey, size: PNG.length, contentType: "image/png" });

    await page.getByRole("button", { name: "Save" }).click();
    await expect.poll(async () => (await world.assetData()).questItemImage).toBe(publicUrl);
  });

  test("the picker lists only my uploads and lets me delete them", async ({ page, world }) => {
    const mine = `userUploads/e2e-public-key/${world.profileId}_mine.png`;
    const theirs = `userUploads/e2e-public-key/other-${world.profileId}_theirs.png`;
    for (const key of [mine, theirs]) await page.request.post(`${MOCK_TOPIA_URL}/__mock/s3`, { data: { key, size: 10 } });
    await seedQuest(world, { isAdmin: true });
    await openSettings(page, world);

    await page.getByRole("button", { name: "Change Image" }).click();
    await page.getByRole("button", { name: "Browse" }).click();

    await expect(page.getByRole("heading", { name: "mine" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "theirs" })).toHaveCount(0);

    await page.getByRole("button", { name: "Delete mine.png" }).click();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByRole("heading", { name: "mine" })).toHaveCount(0);
    const keys = (await s3Keys(page)).map((o) => o.key);
    expect(keys).not.toContain(mine);
    expect(keys).toContain(theirs);
  });
});
