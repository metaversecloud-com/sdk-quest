import { Asset, DroppedAsset } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";

export const dropAsset = async ({ assetId, credentials, position, uniqueName, urlSlug }) => {
  try {
    const asset = Asset.create(assetId, {
      credentials,
    });

    const droppedAsset = await DroppedAsset.drop(asset, {
      interactivePublicKey: process.env.INTERACTIVE_KEY,
      isInteractive: true,
      position: {
        x: position.x || 0,
        y: position.y || 0,
      },
      uniqueName,
      urlSlug,
    });

    return droppedAsset;
  } catch (error) {
    errorHandler({ error, functionName: "dropAsset", message: "Error dropping asset" });
  }
};
