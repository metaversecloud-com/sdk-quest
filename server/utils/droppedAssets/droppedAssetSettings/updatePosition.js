import { getDroppedAssetDetails } from "../getDetails.js";

export const updatePosition = async (req, res) => {
  try {
    const { position } = req.body; // {x: number, y: number}
    if (!position || !position.x || !position.y) throw "No position passed";
    const droppedAsset = await getDroppedAssetDetails(req);
    if (!droppedAsset) throw "No dropped asset found";
    if (droppedAsset.error) throw droppedAsset.error;
    await droppedAsset.updatePosition(position.x, position.y);
    if (res) res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Updating dropped asset position", e, res);
  }
};
