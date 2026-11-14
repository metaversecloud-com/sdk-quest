import { APIRequestContext, test as base, expect } from "@playwright/test";
import { INTERACTIVE_KEY, MOCK_TOPIA_URL } from "./constants";

export const KEY_ASSET_ID = "key-asset";
export const SCENE_DROP_ID = "scene-1";
export const VISITOR_ID = 42;

// ---- Quest ----
export const QUEST_ITEM_UNIQUE_NAME = `questItem_${SCENE_DROP_ID}`;
export const DEFAULT_QUEST_IMAGE = "https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png";
export const CUSTOM_QUEST_IMAGE = "https://example.invalid/quest/gem.png";

/** World data object linking this Quest instance's scene to its key asset. */
export const questScene = (scene: Record<string, unknown> = {}) => ({
  scenes: { [SCENE_DROP_ID]: { keyAssetId: KEY_ASSET_ID, ...scene } },
});

/** A quest item the admin hid in the world (a web image asset in the key asset's scene). */
export const questItem = (id: string, overrides: Record<string, unknown> = {}) => ({
  id,
  assetName: "webImageAsset",
  uniqueName: QUEST_ITEM_UNIQUE_NAME,
  sceneDropId: SCENE_DROP_ID,
  layer1: CUSTOM_QUEST_IMAGE,
  position: { x: 120, y: -80 },
  clickableLink: `https://localhost/quest-item-clicked/?lastMoved=${Date.now()}`,
  ...overrides,
});

export type Progress = {
  currentStreak: number;
  lastCollectedDate: string | null;
  longestStreak: number;
  totalCollected: number;
  totalCollectedToday: number;
};

/** Midnight (UTC, the server's TZ in tests) `daysAgo` days before today, as the server stores lastCollectedDate. */
export const day = (daysAgo = 0) => {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo)).toISOString();
};

export const progress = (overrides: Partial<Progress> = {}): Progress => ({
  currentStreak: 0,
  lastCollectedDate: null,
  longestStreak: 0,
  totalCollected: 0,
  totalCollectedToday: 0,
  ...overrides,
});

export type SeedOptions = {
  isAdmin?: boolean;
  /** Visitor is standing inside the asset's zone. */
  inZone?: boolean;
  /** false = the dropped asset the app was opened from doesn't exist in the world. */
  withAsset?: boolean;
  /** Extra dropped-asset fields (assetName, topLayerURL, uniqueName, ...). */
  asset?: Record<string, unknown>;
  /** The dropped asset's data object. */
  assetData?: Record<string, unknown>;
  /** The world's data object. */
  worldData?: Record<string, unknown>;
  /** The visitor's data object. */
  visitorData?: Record<string, unknown>;
  /** Badges the visitor already owns. */
  badges?: string[];
  /** Further dropped assets in the world, keyed by id. */
  extraAssets?: Record<string, Record<string, unknown>>;
  /** Expressions (emotes) the visitor already owns, by name. */
  expressions?: string[];
  /** World details (width/height bound where quest items are hidden). */
  details?: Record<string, unknown>;
};

/** One isolated Topia world in mock-topia, plus helpers to open the app inside it. */
export class TopiaWorld {
  readonly displayName = "E2E Player";

  constructor(
    readonly urlSlug: string,
    readonly profileId: string,
    private request: APIRequestContext,
  ) {}

  async seed({
    isAdmin = false,
    inZone = true,
    withAsset = true,
    asset = {},
    assetData = {},
    worldData = {},
    visitorData = {},
    badges = [],
    extraAssets = {},
    expressions = [],
    details = { width: 2000, height: 1500 },
  }: SeedOptions = {}) {
    const assets: Record<string, any> = { ...extraAssets };
    if (withAsset) {
      assets[KEY_ASSET_ID] = {
        id: KEY_ASSET_ID,
        assetName: "E2E Asset",
        position: { x: 500, y: 500 },
        uniqueName: "e2e-asset",
        sceneDropId: SCENE_DROP_ID,
        topLayerURL: "https://example.invalid/e2e-asset.png",
        ...asset,
        dataObject: assetData,
      };
    }

    const response = await this.request.post(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`, {
      data: {
        details,
        dataObject: worldData,
        assets,
        visitors: {
          [VISITOR_ID]: {
            isAdmin,
            profileId: this.profileId,
            displayName: this.displayName,
            landmarkZonesString: inZone ? Object.keys(assets).join(",") : "",
            privateZoneId: "",
            dataObject: visitorData,
            expressions,
            inventory: badges.map((name) => ({
              id: `owned-${name}`,
              item_id: `owned-${name}`,
              status: "ACTIVE",
              item: { name, type: "BADGE", image_url: "" },
            })),
          },
        },
      },
    });
    if (!response.ok()) throw new Error(`Seeding mock world failed: ${response.status()}`);
  }

  async state() {
    const response = await this.request.get(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`);
    return (await response.json()) as {
      dataObject: Record<string, any>;
      assets: Record<string, any>;
      visitors: Record<string, any>;
      events: Array<Record<string, any>>;
      unhandled: string[];
    };
  }

  async assetData(assetId = KEY_ASSET_ID) {
    return (await this.state()).assets[assetId]?.dataObject;
  }

  async visitorData() {
    return (await this.state()).visitors[VISITOR_ID].dataObject;
  }

  /** The visitor's Quest progress for this scene (`${urlSlug}-${sceneDropId}`). */
  async progress(): Promise<Progress | undefined> {
    return (await this.visitorData())?.[this.progressKey];
  }

  get progressKey() {
    return `${this.urlSlug}-${SCENE_DROP_ID}`;
  }

  async events(type?: string) {
    const { events } = await this.state();
    return type ? events.filter((e) => e.type === type) : events;
  }

  /** Session credentials Topia appends to the app's iframe URL. */
  credentials(overrides: Record<string, string> = {}) {
    return new URLSearchParams({
      assetId: KEY_ASSET_ID,
      displayName: this.displayName,
      identityId: "identity-1",
      interactiveNonce: "e2e-nonce",
      interactivePublicKey: INTERACTIVE_KEY,
      profileId: this.profileId,
      sceneDropId: SCENE_DROP_ID,
      uniqueName: "e2e-asset",
      urlSlug: this.urlSlug,
      username: "e2e-player",
      visitorId: String(VISITOR_ID),
      ...overrides,
    });
  }

  /** App page URL as Topia opens it in the iframe. */
  url(path = "/", overrides: Record<string, string> = {}) {
    return `${path}?${this.credentials(overrides)}`;
  }

  /** Drawer URL Topia opens when the visitor clicks the quest item `assetId`. */
  questItemUrl(assetId: string, overrides: Record<string, string> = {}) {
    return this.url("/quest-item-clicked", { assetId, uniqueName: QUEST_ITEM_UNIQUE_NAME, ...overrides });
  }

  /** App API path carrying the session credentials, as the client's backendAPI sends them. */
  api(path: string, overrides: Record<string, string> = {}) {
    return `/api${path}?${this.credentials(overrides)}`;
  }
}

export const QUEST_ITEM_ID = "quest-item-1";
export const QUEST_ITEM_POSITION = { x: 120, y: -80 };

/** A running Quest: scene linked to the key asset (configured with a daily limit of 5) and one hidden item. */
export const seedQuest = (world: TopiaWorld, options: SeedOptions = {}) =>
  world.seed({
    worldData: questScene(),
    assetData: { numberAllowedToCollect: 5, questItemImage: CUSTOM_QUEST_IMAGE, leaderboard: {} },
    extraAssets: { [QUEST_ITEM_ID]: questItem(QUEST_ITEM_ID, { position: QUEST_ITEM_POSITION }) },
    ...options,
  });

export const test = base.extend<{ world: TopiaWorld }>({
  world: async ({ request }, use, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`.replace(/[^a-zA-Z0-9-]/g, "");
    const world = new TopiaWorld(`world-${id}`, `profile-${id}`, request);
    await use(world);

    // Fail the test if the app called a public-API endpoint the mock doesn't implement (e.g. after an
    // @rtsdk/topia upgrade): it would otherwise pass against a 501 the real API never returns.
    expect((await world.state()).unhandled, "public-API calls mock-topia doesn't implement").toEqual([]);
    const outside = await (await request.get(`${MOCK_TOPIA_URL}/__mock/unhandled`)).json();
    expect(outside, "public-API calls mock-topia doesn't implement").toEqual([]);
  },
});

export { expect } from "@playwright/test";
