// What the server must enforce no matter what the client sends: admin-only routes, which assets count
// as quest items, values taken from the request, uploads.
import { MOCK_TOPIA_URL, INTERACTIVE_SECRET } from "../../constants";
import {
  CUSTOM_QUEST_IMAGE,
  KEY_ASSET_ID,
  QUEST_ITEM_ID,
  SCENE_DROP_ID,
  day,
  expect,
  progress,
  questItem,
  seedQuest,
  test,
} from "../../fixtures";

const PNG = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

// Known bug: no route checks visitor.isAdmin; the admin UI is only hidden in the client. Any player
// can call these directly (and GET /quest-items hands out every hidden item's position).
const NO_ADMIN_CHECK = "EXP-435: admin routes don't check isAdmin";

test.describe("admin endpoints reject players", () => {
  const calls = [
    { name: "list hidden items (positions)", method: "get", path: "/quest-items" },
    { name: "hide an item", method: "post", path: "/drop-quest-item" },
    { name: "remove all items", method: "post", path: "/dropped-asset/remove-all-with-unique-name" },
    { name: "remove one item", method: "delete", path: `/dropped-asset/${QUEST_ITEM_ID}` },
    { name: "change settings", method: "post", path: "/admin-settings", data: { numberAllowedToCollect: 999, questItemImage: "https://example.invalid/x.png" } },
    { name: "walk to an item", method: "put", path: "/visitor/move", data: { moveTo: { x: 120, y: -80 } } },
    { name: "remove the Quest", method: "delete", path: "/quest" },
    { name: "upload an image", method: "post", path: "/uploads", data: { filename: "x.png", contentType: "image/png", data: PNG } },
  ] as const;

  for (const call of calls) {
    test(call.name, async ({ page, world }) => {
      test.fail(true, NO_ADMIN_CHECK);
      await seedQuest(world, { isAdmin: false });
      const before = await world.state();

      const response = await page.request[call.method](world.api(call.path), { data: "data" in call ? call.data : undefined });

      expect(response.status()).toBe(403);
      const after = await world.state();
      expect(after.assets).toEqual(before.assets);
      expect(after.dataObject).toEqual(before.dataObject);
      expect(after.events).toEqual([]);
      const uploads = (await (await page.request.get(`${MOCK_TOPIA_URL}/__mock/s3`)).json()) as { key: string }[];
      expect(uploads.filter((o) => o.key.includes(world.profileId))).toEqual([]);
    });
  }
});

test("a player can't count a non-quest asset as a find", async ({ page, world }) => {
  // Known bug: /quest-item-clicked never checks that the clicked asset is one of this Quest's items,
  // so posting it with the key asset's id counts a find and teleports the key asset (and turns it
  // into a quest-item link) for everyone.
  test.fail(true, "EXP-435: quest-item-clicked accepts any asset");
  await seedQuest(world);

  await page.request.post(world.api("/quest-item-clicked", { assetId: KEY_ASSET_ID, uniqueName: "e2e-asset" }));

  expect(await world.progress()).toMatchObject({ totalCollected: 0 });
  expect(await world.events("set-position")).toEqual([]);
  expect(await world.events("change-click-type")).toEqual([]);
});

test("clicking the same item twice in a row counts once", async ({ page, world }) => {
  // Known bug: the duplicate-click guard reads lastProcessedAt from questItem.dataObject, but
  // DroppedAsset.get doesn't load the data object, so the 3 s window never applies.
  test.fail(true, "EXP-435: duplicate-click guard never sees lastProcessedAt");
  await seedQuest(world, { badges: ["First Find"] });

  for (let i = 0; i < 2; i++) {
    expect((await page.request.post(world.api("/quest-item-clicked", { assetId: QUEST_ITEM_ID }))).ok()).toBe(true);
  }

  expect(await world.progress()).toMatchObject({ totalCollected: 1, totalCollectedToday: 1 });
});

test("a display name can't rewrite the player's leaderboard score", async ({ page, world }) => {
  // Known bug: leaderboard entries are stored as "name|collected|streak" with the display name taken
  // from the request, so a name containing "|" sets any score the player likes.
  test.fail(true, "EXP-435: display name with | forges the leaderboard");
  await seedQuest(world);

  await page.request.post(world.api("/quest-item-clicked", { assetId: QUEST_ITEM_ID, displayName: "Mallory|9999|365" }));
  const { leaderboard } = await (await page.request.get(world.api("/leaderboard", { assetId: QUEST_ITEM_ID }))).json();

  expect(leaderboard).toEqual([expect.objectContaining({ profileId: world.profileId, collected: 1 })]);
});

test("the daily limit can't be set to something that isn't a positive number", async ({ page, world }) => {
  // Known bug: /admin-settings stores numberAllowedToCollect unvalidated. "abc" parses to NaN, and
  // `totalCollectedToday >= NaN` is never true, so the daily cap disappears.
  test.fail(true, "EXP-435: admin-settings doesn't validate the daily limit");
  await seedQuest(world, { isAdmin: true });

  const response = await page.request.post(world.api("/admin-settings"), {
    data: { numberAllowedToCollect: "abc", questItemImage: CUSTOM_QUEST_IMAGE },
  });

  expect(response.status()).toBe(400);
  expect((await world.assetData()).numberAllowedToCollect).toBe(5);
});

test("the daily limit can't be bypassed by calling the endpoint again", async ({ page, world }) => {
  const done = progress({ totalCollected: 5, totalCollectedToday: 5, lastCollectedDate: day(0) });
  await seedQuest(world, { badges: ["First Find"], visitorData: { [world.progressKey]: done } });

  for (let i = 0; i < 3; i++) await page.request.post(world.api("/quest-item-clicked", { assetId: QUEST_ITEM_ID }));

  expect(await world.progress()).toEqual(done);
  expect((await world.assetData()).leaderboard).toEqual({});
});

test("a request signed for another app's public key changes nothing", async ({ page, world }) => {
  await seedQuest(world);

  const response = await page.request.post(world.api("/quest-item-clicked", { assetId: QUEST_ITEM_ID, interactivePublicKey: "someone-else" }));

  expect(response.ok()).toBe(false);
  expect(await world.progress()).toBeUndefined();
  expect(await world.events()).toEqual([]);
});

test("the admin item list never carries the interactive secret", async ({ page, world }) => {
  // Same root cause as the platform secrets test (EXP-429): GET /quest-items returns raw DroppedAsset
  // objects, each with topia.interactiveSecret and a signed InteractiveJWT.
  test.fail(true, "EXP-429: cleanReturnPayload is registered after the routes (server/index.ts)");
  await seedQuest(world, { isAdmin: true });

  const body = await (await page.request.get(world.api("/quest-items"))).text();

  expect(body).toContain(QUEST_ITEM_ID);
  for (const marker of [INTERACTIVE_SECRET, "interactiveSecret", "InteractiveJWT"]) expect(body).not.toContain(marker);
});

test.describe("uploads", () => {
  test("only images up to 2 MB are accepted", async ({ page, world }) => {
    await seedQuest(world, { isAdmin: true });
    const upload = (data: Record<string, unknown>) => page.request.post(world.api("/uploads"), { data });

    expect((await upload({ filename: "x.svg", contentType: "image/svg+xml", data: PNG })).status()).toBe(400);
    expect((await upload({ filename: "x.png", contentType: "image/png", data: "" })).status()).toBe(400);
    const tooBig = Buffer.alloc(2 * 1024 * 1024 + 1).toString("base64");
    expect((await upload({ filename: "x.png", contentType: "image/png", data: tooBig })).status()).toBe(413);

    const uploads = (await (await page.request.get(`${MOCK_TOPIA_URL}/__mock/s3`)).json()) as { key: string }[];
    expect(uploads.filter((o) => o.key.includes(world.profileId))).toEqual([]);
  });

  test("a file name can't escape the app's upload folder", async ({ page, world }) => {
    await seedQuest(world, { isAdmin: true });

    const response = await page.request.post(world.api("/uploads"), {
      data: { filename: "../../other-app/evil name.png", contentType: "image/png", data: PNG },
    });

    expect((await response.json()).key).toBe(`userUploads/e2e-public-key/${world.profileId}_evil-name.png`);
  });

  test("an admin can't delete someone else's upload", async ({ page, world }) => {
    const theirs = `userUploads/e2e-public-key/other-${world.profileId}_theirs.png`;
    await page.request.post(`${MOCK_TOPIA_URL}/__mock/s3`, { data: { key: theirs } });
    await seedQuest(world, { isAdmin: true });

    const response = await page.request.delete(world.api("/uploads"), { data: { key: theirs } });

    expect(response.status()).toBe(403);
    const keys = ((await (await page.request.get(`${MOCK_TOPIA_URL}/__mock/s3`)).json()) as { key: string }[]).map((o) => o.key);
    expect(keys).toContain(theirs);
  });
});

test("the scene of another Quest can't be wiped through remove-all", async ({ page, world }) => {
  // remove-all is scoped by the request's sceneDropId; items of another Quest instance stay.
  await seedQuest(world, {
    isAdmin: true,
    extraAssets: {
      [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID),
      "other-quest-item": questItem("other-quest-item", { sceneDropId: "scene-2", uniqueName: "questItem_scene-2" }),
    },
  });

  await page.request.post(world.api("/dropped-asset/remove-all-with-unique-name"));

  expect(Object.keys((await world.state()).assets).sort()).toEqual([KEY_ASSET_ID, "other-quest-item"]);
  expect((await world.state()).dataObject.scenes[SCENE_DROP_ID]).toEqual({ keyAssetId: KEY_ASSET_ID });
});

test("removing a single item only removes quest items", async ({ page, world }) => {
  // Known bug: DELETE /dropped-asset/:id deletes whatever asset id it is given, so it can remove the
  // key asset or any other asset in the world (by any player, see the admin-route tests above).
  test.fail(true, "EXP-435: DELETE /dropped-asset/:id deletes any asset");
  await seedQuest(world, { isAdmin: true, extraAssets: { tree: { id: "tree", sceneDropId: "elsewhere", uniqueName: "tree" } } });

  await page.request.delete(world.api("/dropped-asset/tree"));
  await page.request.delete(world.api(`/dropped-asset/${KEY_ASSET_ID}`));

  expect(Object.keys((await world.state()).assets).sort()).toEqual([KEY_ASSET_ID, "tree"]);
});
