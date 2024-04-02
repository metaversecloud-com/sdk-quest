import {
  Asset,
  DroppedAsset,
  errorHandler,
  getBaseURL,
  getDroppedAssetDetails,
  getDefaultKeyAssetImage,
  getRandomCoordinates,
  getWorldDetails,
  getCredentials,
} from "../utils/index.js";

export const handleDropQuestItem = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, interactivePublicKey, urlSlug } = credentials;

    const [keyAsset, world] = await Promise.all([
      getDroppedAssetDetails({
        credentials,
        droppedAssetId: assetId,
        shouldInitDataObject: true,
      }),
      getWorldDetails(credentials),
    ]);
    const uniqueName = keyAsset.uniqueName || "Quest"

    // Randomly place the quest item asset
    const position = getRandomCoordinates(world.width, world.height);

    // Use questItemImage from key asset data object or fallback to default
    const questItemImage = keyAsset.dataObject?.questItemImage || getDefaultKeyAssetImage({ urlSlug });

    const asset = Asset.create(process.env.WEB_IMAGE_ASSET_ID || "webImageAsset", {
      credentials,
    });

    const droppedAsset = await DroppedAsset.drop(asset, {
      interactivePublicKey,
      isInteractive: true,
      layer0: "",
      layer1: questItemImage,
      position,
      sceneDropId: `${assetId}_${uniqueName}`,
      uniqueName: `questItem_${uniqueName}`,
      urlSlug,
    });

    await Promise.all([
      droppedAsset.updateClickType({
        clickType: "link",
        clickableLinkTitle: "Quest",
        isOpenLinkInDrawer: true,
        clickableLink: getBaseURL(req) + "/quest-item-clicked/" + `?lastMoved=${new Date().valueOf()}`,
      }),
      droppedAsset.setDataObject({
        keyAssetId: keyAsset.id,
        keyAssetUniqueName: uniqueName,
        questItemImage: keyAsset.dataObject?.questItemImage,
      }),
    ]);

    return res.json({ droppedAsset, success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleDropQuestItem",
      message: "Error dropping asset",
      req,
      res,
    });
  }
};
