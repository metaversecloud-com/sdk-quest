import { DroppedAsset, errorHandler, getCredentials, getVisitor, getWorldDetails, removeDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleRemoveQuestFromWorld = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { assetId, urlSlug, visitorId } = credentials;

    const promises = []

    // remove all quest items
    const { success } = await removeDroppedAssetsWithUniqueName(credentials);
    if (!success) throw "Error removing quest items."

    // remove key asset
    const droppedAsset = DroppedAsset.create(assetId, urlSlug, { credentials });
    promises.push(droppedAsset.deleteDroppedAsset())

    // remove data from world data object
    const world = await getWorldDetails(credentials);
    promises.push(world.updateDataObject({
      [`keyAssets.${assetId}`]: `Removed from world on ${new Date()}`,
    }, {
      lock: {
        lockId: `${urlSlug}-${assetId}-${new Date(Math.round(new Date().getTime() / 60000) * 60000)}`
      }
    }))

    // close drawer and fire toast
    const visitor = await getVisitor({
      credentials,
      urlSlug,
      visitorId,
    });
    promises.push(
      visitor.closeIframe(assetId),
      visitor.fireToast({
        groupId: "RemoveQuest",
        title: "Quest Successfully Removed",
        text: "You have successfully removed this Quest from your world.",
      })
    )

    await Promise.all(promises)

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveQuestFromWorld",
      message: "Error remove Quest from world.",
      req,
      res,
    });
  }
};
