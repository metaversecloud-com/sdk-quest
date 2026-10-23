import { DroppedAsset } from "../topiaInit.js";
import { Credentials } from "../../types/Credentials.js";
import { KeyAssetDataObjectType } from "../../types/DataObjectTypes.js";
import { standardizeError } from "../standardizeError.js";

/** The defaults mirror what `initializeWorldDataObject` used to seed. */
const DEFAULT_QUEST_ITEM_IMAGE = "https://topiaimages.s3.us-west-1.amazonaws.com/Ruby.png";
const DEFAULT_NUMBER_ALLOWED_TO_COLLECT = 5;

/**
 * Fetch the key asset and ensure its dataObject has the fields the rest
 * of the app relies on. Config now lives here instead of on the world
 * dataObject — see `types/DataObjectTypes.ts` for the schema note.
 *
 * `legacyWorldConfig` carries the world's scene entry (if available) so
 * on first access we can seed the key asset's config from whatever
 * values the pre-this-change deployment had been using. Omit it on
 * paths that don't have the world dataObject in hand; defaults will be
 * used instead.
 */
export const getKeyAsset = async (
  credentials: Credentials,
  keyAssetId: string,
  legacyWorldConfig?: { numberAllowedToCollect?: number; questItemImage?: string },
) => {
  try {
    const keyAsset = await DroppedAsset.get(keyAssetId, credentials.urlSlug, {
      credentials: { ...credentials, assetId: keyAssetId },
    });

    if (!keyAsset) throw "Key asset not found";

    await keyAsset.fetchDataObject();

    const dataObject = (keyAsset.dataObject as KeyAssetDataObjectType) || ({} as KeyAssetDataObjectType);

    // Figure out which fields need seeding. On first open after the
    // config-migration this fills in `numberAllowedToCollect` +
    // `questItemImage` from the legacy world dataObject (or defaults if
    // nothing is passed in), and tops up `leaderboard` so writes don't
    // hit a missing field.
    const patch: Partial<KeyAssetDataObjectType> = {};
    if (dataObject.numberAllowedToCollect === undefined) {
      patch.numberAllowedToCollect =
        legacyWorldConfig?.numberAllowedToCollect ?? DEFAULT_NUMBER_ALLOWED_TO_COLLECT;
    }
    if (!dataObject.questItemImage) {
      patch.questItemImage = legacyWorldConfig?.questItemImage ?? DEFAULT_QUEST_ITEM_IMAGE;
    }
    if (!dataObject.leaderboard) {
      patch.leaderboard = {};
    }

    if (Object.keys(patch).length > 0) {
      const lockId = `${keyAssetId}-init-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await keyAsset
        .updateDataObject(patch, { lock: { lockId, releaseLock: true } })
        .catch(() => console.warn("getKeyAsset: lock contention seeding key-asset config"));
      await keyAsset.fetchDataObject();
    }

    return keyAsset;
  } catch (error) {
    throw standardizeError(error);
  }
};
