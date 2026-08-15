<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Quest

## Introduction / Summary

Quest is a daily hide-and-seek collection game. An admin drops a key asset in a Topia world; from its drawer they scatter "quest items" at random coordinates across the world (`world.width` / `world.height`). Visitors walk the world, click quest items to collect them, and race to complete a daily quota (default: 5). Each collection immediately re-hides the same item at a fresh random location — the world is never fully cleared.

Progression is tracked per-visitor per-scene (`${urlSlug}-${sceneDropId}`): `currentStreak`, `longestStreak`, `totalCollected`, `totalCollectedToday`, `lastCollectedDate`. Streaks, cumulative totals, and hitting the daily limit each unlock ecosystem `BADGE` rewards. Every 50 items collected also grants the visitor the emote defined by `EMOTE_NAME` (default `quest_1`) via `visitor.grantExpression`, with a 🔎 toast on unlock.

## Key Features

### Canvas elements & interactions

- **Key asset** — the initial drop the admin/creator places in the world. Clicking it opens the drawer to the leaderboard (or, for admins, the settings cog). Its `assetId` also serves as the `sceneDropId` fallback and hosts the per-scene leaderboard data object.
- **Quest items** — `webImageAsset` (or `WEB_IMAGE_ASSET_ID`) instances dropped with `uniqueName: questItem_${sceneDropId}` and `clickableLink: /quest-item-clicked?lastMoved=...`. Clicking one opens the drawer, credits the collection, teleports the item to a new random position, and fires a `lightBlueSmoke_puff` particle at its old position.

### Drawer content

- **Home / QuestItemClicked** — `PageContainer` renders the quest item image, a Leaderboard / Badges tab switcher, and (for admins only, client-side) the settings cog.
- **Leaderboard tab** — "My Stats" (position, streak, collected) + top 100 rows sorted by `collected` desc.
- **Badges tab** — every ecosystem `BADGE` (type `BADGE`, status `ACTIVE`) is rendered; badges the visitor owns are full-color, unowned are `filter: grayscale(1)`.
- **QuestItemClicked page** — reached via a quest item's `clickableLink`. Fires `POST /quest-item-clicked`, shows a 🎉 congratulations message plus `${collectedToday}/${allowedPerDay} collected today`, and re-renders the leaderboard.

### Admin features

Admin UI is gated **client-side only** via `visitor.isAdmin` — no server route enforces admin status. Any authenticated visitor calling `/admin-settings`, `/drop-quest-item`, `/dropped-asset/*`, `/visitor/move`, or `DELETE /quest` will succeed.

- Update **Number Allowed To Collect Per Day** and **Quest Item Image URL** (rewrites `layer1` on every existing quest item in the scene).
- **Hide in world** — drops a new quest item at random coordinates.
- **Remove all** — deletes every dropped asset in the scene whose `uniqueName` includes `questItem`.
- **Placed items table** — per-item "walk to" (uses `PUT /visitor/move` with `shouldTeleportVisitor: false`) and "remove item" buttons; each row shows days since last relocation.
- **Remove Quest from world** — deletes all quest items, tombstones the scene data (`scenes.${sceneDropId} = "Removed from world on ${date}"`), fires a confirmation toast, and deletes the key asset itself.

## Required Assets with Unique Names

| Unique Name Pattern       | Description                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `questItem_{sceneDropId}` | Applied to every quest item dropped by `/drop-quest-item`. `getQuestItems` filters by `uniqueName?.includes("questItem")` — substring match, not exact. |

The key asset itself does not need a `uniqueName` — the app uses the `assetId` provided in the credentials as both the key-asset id and the `sceneDropId` fallback when `credentials.sceneDropId` is absent.

## Technical Architecture

### Data Objects

Every data-object read goes through `initializeWorldDataObject`, `getKeyAsset`, or `getVisitor`, which each seed defaults before any `updateDataObject` call.

#### World (`scenes.${sceneDropId}`)

Initialized on first `getWorldDetails`. `initializeWorldDataObject` also strips legacy fields (`itemsCollectedByUser`, `lastInteractionDate`, `sceneDropId`, `totalItemsCollected`) from any pre-existing scene.

```ts
{
  keyAssetId: string;
  numberAllowedToCollect: number; // default 5
  questItemImage: string; // default: https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png
}
```

On `DELETE /quest` the scene entry is overwritten with the string `"Removed from world on ${new Date()}"` (tombstone; not deleted).

#### Key Asset (DroppedAsset — the initial drop)

Attached to `credentials.assetId`. Hosts the per-scene leaderboard.

```ts
{
  questItemImage?: string;   // optional; used as fallback default at scene init
  leaderboard: {
    // Pipe-delimited string, parsed by handleGetLeaderboard
    [profileId: string]: `${displayName}|${totalCollected}|${longestStreak}`;
  };
}
```

#### Visitor (`${urlSlug}-${sceneDropId}`)

One entry per scene per visitor, so a visitor's streaks and totals in one quest instance don't leak into another instance in the same world.

```ts
{
  currentStreak: number;
  lastCollectedDate: Date | null;
  longestStreak: number;
  totalCollected: number;
  totalCollectedToday: number;
}
```

Badges are read directly from `visitor.inventoryItems` (filtered to `type === "BADGE"` and `status === "ACTIVE"`), not from the data object.

### Reward system (Ecosystem badges)

Badges are ecosystem inventory items awarded via `visitor.grantInventoryItem`. `awardBadge` short-circuits if the visitor already owns the badge. The ecosystem-inventory catalog is cached in-memory for 6 hours (`inventoryCache.ts`), with `?forceRefreshInventory=true` on `/quest` busting it.

| Badge                     | Trigger                                                                                  |
| ------------------------- | ---------------------------------------------------------------------------------------- |
| `First Find`              | `totalCollected === 0` before this collection, or the visitor doesn't yet own the badge. |
| `3-Day Streak`            | `currentStreak === 3` (after increment).                                                 |
| `5-Day Streak`            | `currentStreak === 5` (after increment).                                                 |
| `Quest Veteran - Bronze`  | `totalCollected === 25` (after increment; exact match).                                  |
| `Quest Veteran - Silver`  | `totalCollected === 50`.                                                                 |
| `Quest Veteran - Gold`    | `totalCollected === 75`.                                                                 |
| `Quest Veteran - Diamond` | `totalCollected === 100`.                                                                |
| `Inventory Pro`           | `totalCollectedToday === numberAllowedToCollect` (daily quota hit).                      |

Every 50 items collected (`totalCollected % 50 === 0`) also triggers `visitor.grantExpression({ name: EMOTE_NAME })`. On HTTP 200 the app fires `firework2_gold` and a "🔎 New Emote Unlocked" toast; on 409 (already owned) it swaps in a "Congrats! You collected {N} quest items" toast.

### Real-time transport

None. All updates are HTTP request/response; the client re-fetches `/quest` on mount and after mutations. No SSE, no websockets, no polling loop.

## API Endpoints

All routes mount under `/api`. Credentials (`assetId`, `interactiveNonce`, `interactivePublicKey`, `urlSlug`, `visitorId`, plus optional `sceneDropId`, `displayName`, `identityId`, `profileId`) are injected onto every request by the client-side axios interceptor and validated by `getCredentials`.

| Method   | Route                                        | Purpose                                                                                                                                                            |
| -------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`    | `/system/health`                             | Version, server start date, and boolean status of Google-Sheets envs.                                                                                              |
| `GET`    | `/quest`                                     | Returns `{ questDetails, visitor: { isAdmin, profileId }, badges, visitorInventory }`. Supports `?forceRefreshInventory=true` to bust the 6h ecosystem cache.      |
| `GET`    | `/leaderboard`                               | Returns the sorted, parsed leaderboard for the scene. `?isKeyAsset=true` reads directly from the current dropped asset; `false` (default) looks up via world data. |
| `GET`    | `/quest-items`                               | Lists all dropped quest items in the scene (`uniqueName?.includes("questItem")`).                                                                                  |
| `POST`   | `/drop-quest-item`                           | Drops a new `webImageAsset` (or `WEB_IMAGE_ASSET_ID`) at random coords with `uniqueName: questItem_${sceneDropId}` and the quest-item-clicked link.                |
| `POST`   | `/quest-item-clicked`                        | Core game logic. Increments streaks/totals, awards badges, teleports the item to a new random position, fires `lightBlueSmoke_puff`, writes to the leaderboard.    |
| `POST`   | `/dropped-asset/remove-all-with-unique-name` | Deletes every quest item in the scene (calls `World.deleteDroppedAssets` in one batch).                                                                            |
| `DELETE` | `/dropped-asset/:droppedAssetId`             | Deletes a single dropped asset by id.                                                                                                                              |
| `POST`   | `/admin-settings`                            | Body: `{ numberAllowedToCollect, questItemImage }`. Updates the scene config, then rewrites `layer1` and `dataObject.questItemImage` on every existing quest item. |
| `PUT`    | `/visitor/move`                              | Body: `{ moveTo: { x, y }, shouldTeleportVisitor }`. Moves the calling visitor (used by the admin "Walk to Item" button).                                          |
| `DELETE` | `/quest`                                     | Removes all quest items, tombstones `scenes.${sceneDropId}`, closes the drawer, fires a confirmation toast, and deletes the key asset.                             |

Response payloads are stripped of `topia`, `credentials`, `jwt`, and `requestOptions` fields by the `cleanReturnPayload` middleware before send.

## Analytics

All in-world analytics events are emitted via the `analytics: [...]` option on `keyAsset.updateDataObject` inside `handleQuestItemClicked`. `uniqueKey` disambiguates aggregate vs per-profile counters.

| Event                             | Fired when                                                                                           | `uniqueKey`                  |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------- |
| `starts`                          | First collection of the day (`!hasCollectedToday`).                                                  | `profileId`                  |
| `itemsCollected`                  | Every successful collection.                                                                         | _(none)_ — aggregate counter |
| `completions`                     | Daily quota hit (`totalCollectedToday === numberAllowedToCollect`).                                  | `profileId`                  |
| `itemsCollected${totalCollected}` | Every 50-item milestone (`totalCollected % 50 === 0`), e.g. `itemsCollected50`, `itemsCollected100`. | `profileId`                  |
| `${EMOTE_NAME}-emoteUnlocked`     | Emote grant returned HTTP 200 at a 50-item milestone.                                                | `urlSlug`                    |

### Google Sheets analytics

Optional. When `GOOGLESHEETS_SHEET_ID` is set, the `completions` event also appends a row to the configured sheet via `addNewRowToGoogleSheets`:

`[date, time, identityId, displayName, "Quest", event, urlSlug]`

The range defaults to `Sheet1` and can be overridden with `GOOGLESHEETS_SHEET_RANGE`. Failures are swallowed (`console.error` only).

### In-world FX (not analytics, but game feedback)

| Effect                                                                   | Fires when                                         |
| ------------------------------------------------------------------------ | -------------------------------------------------- |
| `lightBlueSmoke_puff` particle at item position                          | Every quest item click.                            |
| `redPinkHeart_float` on visitor (duration 60)                            | Daily quota hit (`Inventory Pro` moment).          |
| `firework2_gold` on visitor                                              | Emote successfully granted at a 50-item milestone. |
| Toast: `Badge Awarded`                                                   | Any `awardBadge` succeeds.                         |
| Toast: 🔎 `New Emote Unlocked` / `Congrats! You collected N quest items` | Emote grant response (200 vs 409).                 |
| Toast: `Quest Successfully Removed`                                      | `DELETE /quest` completes.                         |

## Environment Variables

Create a `.env` at the app root. See `.env-example` for a template.

| Variable                    | Description                                                                                                                                                                       | Required                         |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `INTERACTIVE_KEY`           | Topia interactive app key. Verified against `interactivePublicKey` on every request by `getCredentials`.                                                                          | Yes                              |
| `INTERACTIVE_SECRET`        | Topia interactive app secret. Passed into `World.deleteDroppedAssets`.                                                                                                            | Yes                              |
| `INSTANCE_DOMAIN`           | Topia API domain (`api.topia.io` for production, `api-stage.topia.io` for staging).                                                                                               | No (defaults to `api.topia.io`)  |
| `INSTANCE_PROTOCOL`         | `https` for prod/staging, `http` only for local.                                                                                                                                  | No (defaults to `https`)         |
| `PORT`                      | Server port.                                                                                                                                                                      | No (defaults to `3000`)          |
| `NODE_ENV`                  | `development` enables permissive CORS (localhost:3000, :5173) and uses `DEV_URL` in `getBaseURL`; anything else serves `client/build` and returns full URL from the request host. | No                               |
| `WEB_IMAGE_ASSET_ID`        | Asset id used as the base for every dropped quest item.                                                                                                                           | No (defaults to `webImageAsset`) |
| `EMOTE_NAME`                | Emote granted at every 50-item milestone.                                                                                                                                         | No (defaults to `quest_1`)       |
| `DEV_URL`                   | Base URL used to build quest-item `clickableLink`s when `NODE_ENV=development` (e.g., ngrok URL).                                                                                 | No                               |
| `COMMIT_HASH`, `S3_BUCKET`  | Reported in `/system/health` only.                                                                                                                                                | No                               |
| `GOOGLESHEETS_CLIENT_EMAIL` | Google service account email for the completions log.                                                                                                                             | No                               |
| `GOOGLESHEETS_PRIVATE_KEY`  | Google service account private key (`\n` escapes are un-escaped at boot).                                                                                                         | No                               |
| `GOOGLESHEETS_SHEET_ID`     | Google Sheet id — when unset, `addNewRowToGoogleSheets` is a no-op.                                                                                                               | No                               |
| `GOOGLESHEETS_SHEET_RANGE`  | Sheet range for `values.append`.                                                                                                                                                  | No (defaults to `Sheet1`)        |

`DEFAULT_EGG_IMAGE_URL` and `DEFAULT_KEY_ASSET_IMAGE_URL` are present in `.env-example` but are **not consumed by any code path** at HEAD. The default quest-item image is hardcoded to `https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png` in `initializeWorldDataObject`. `getDefaultKeyAssetImage` is exported from utils but never called.

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Dev Account Dashboard](https://dev.topia.io/t/dashboard/integrations)
- [Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

## Getting Started

```bash
# from the app root
npm install
cd client && npm install && cd ..

# create a .env at the app root (see Environment Variables above)
cp .env-example .env

# run the dev server (client + server together)
npm run dev
```

## For Developers

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

### App-specific notes

- **No server-side admin gating.** `handleGetQuestDetails` returns `visitor.isAdmin` to the client, which is used only to show/hide the settings cog in `PageContainer`. Every admin route (`/admin-settings`, `/drop-quest-item`, `/dropped-asset/*`, `/visitor/move`, `DELETE /quest`) will succeed for any authenticated visitor. If admin enforcement is intended, it needs to be wired.
- **`sceneDropId` fallback:** everywhere in the server, `credentials.sceneDropId || credentials.assetId` is used. If the iframe launcher omits `sceneDropId`, the key asset id doubles as the scene id — this is why the world data-object shape is `scenes.${sceneDropId}` even for single-drop installs.
- **Leaderboard is stored as a pipe-delimited string** (`${displayName}|${totalCollected}|${longestStreak}`) — cheap to update per profile but parsed on read by `handleGetLeaderboard`.
- **Legacy scene-data cleanup:** `initializeWorldDataObject` strips `itemsCollectedByUser`, `lastInteractionDate`, `sceneDropId`, and `totalItemsCollected` from every scene on load. Safe no-op for new installs.
- **Ecosystem inventory cache** (`inventoryCache.ts`): 6-hour in-memory TTL with stale-fallback on error. `?forceRefreshInventory=true` on `/quest` busts it.
- **`cleanReturnPayload` middleware** strips `topia`, `credentials`, `jwt`, and `requestOptions` from every JSON response before send.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- View it in action: [Dev](https://topia.io/quest-dev), [Prod](https://topia.io/quest-prod)
- [Notion One Pager](https://www.notion.so/topiaio/Quest-b3501950507845f9bccfaa192285ab57?pvs=4)
