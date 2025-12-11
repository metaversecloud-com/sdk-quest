import { DroppedAsset } from "../topiaInit.js";
import { Credentials } from "../../types/Credentials.js";
import { KeyAssetDataObjectType } from "../../types/DataObjectTypes.js";
import { standardizedError } from "../standardizedError.js";

export const getKeyAsset = async (credentials: Credentials, keyAssetId: string) => {
  try {
    const keyAsset = await DroppedAsset.get(keyAssetId, credentials.urlSlug, {
      credentials: { ...credentials, assetId: keyAssetId },
    });

    if (!keyAsset) throw "Key asset not found";

    await keyAsset.fetchDataObject();

    const dataObject = keyAsset.dataObject as KeyAssetDataObjectType;

    if (!dataObject?.leaderboard) {
      const lockId = `${keyAssetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`;
      await keyAsset.setDataObject(
        {
          leaderboard: {},
        },
        { lock: { lockId, releaseLock: true } },
      );
    }

    return keyAsset;
  } catch (error) {
    return standardizedError(error);
  }
};
