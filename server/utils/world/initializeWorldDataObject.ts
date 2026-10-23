import { Credentials } from "../../types/Credentials.js";
import { standardizeError } from "../standardizeError.js";

/**
 * Seed the world's `scenes` map with just the `sceneDropId → keyAssetId`
 * link that the clicked-item flow uses to find its own Quest instance's
 * key asset. All configuration (`numberAllowedToCollect`,
 * `questItemImage`) lives on the key asset's dataObject now; see
 * `getKeyAsset.ts`.
 *
 * Legacy data (worlds seeded with the full config shape before this
 * refactor) is left alone — the read paths still fall back to those
 * fields when the key asset's own values aren't present. We just don't
 * write them for new scenes any more.
 */
export const initializeWorldDataObject = async ({ credentials, world }: { credentials: Credentials; world: any }) => {
  try {
    const { assetId } = credentials;
    const sceneDropId = credentials.sceneDropId || assetId;

    await world.fetchDataObject();
    const dataObject = world.dataObject;

    const lockId = `${sceneDropId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;

    if (!dataObject || !dataObject?.scenes) {
      await world.setDataObject(
        { scenes: { [sceneDropId]: { keyAssetId: assetId } } },
        { lock: { lockId, releaseLock: true } },
      );
    } else if (!dataObject.scenes[sceneDropId]) {
      await world.updateDataObject(
        { [`scenes.${sceneDropId}`]: { keyAssetId: assetId } },
        { lock: { lockId, releaseLock: true } },
      );
    } else if (!dataObject.scenes[sceneDropId].keyAssetId) {
      // Pre-this-change scenes may not have `keyAssetId` on the entry
      // yet. Backfill without touching any legacy config fields.
      await world.updateDataObject(
        { [`scenes.${sceneDropId}.keyAssetId`]: assetId },
        { lock: { lockId, releaseLock: true } },
      );
    }

    await world.fetchDataObject();
    return;
  } catch (error) {
    standardizeError(error);
    return await world.fetchDataObject();
  }
};
