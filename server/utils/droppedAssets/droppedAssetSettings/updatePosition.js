import { getDroppedAssetDetails, getEmbeddedAssetDetails } from "../getDetails.js";
import error from "../../errors.js";

export const updatePosition = async (req, res) => {
  try {
    const { dataObjectUpdate, position } = req.body; // {x: number, y: number}
    // If moving the asset with the iFrame embedded, won't have instanceId in the query.
    // Can move another asset other than the one iFrame / webhook embedded inside of by passing instanceId
    const { instanceId } = req.query;
    if (!position || !position.x || !position.y) throw "No position passed";
    const droppedAsset = instanceId ? await getDroppedAssetDetails(req) : await getEmbeddedAssetDetails(req);
    if (!droppedAsset) throw "No dropped asset found";
    if (droppedAsset.error) throw droppedAsset.error;
    await droppedAsset.updatePosition(position.x, position.y);
    if (dataObjectUpdate) await droppedAsset.updateDataObject(dataObjectUpdate);
    if (res) res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Updating dropped asset position", e, res);
  }
};
