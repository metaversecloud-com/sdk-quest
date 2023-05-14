import { getDroppedAssetDetails } from "../getDetails.js";

/*
{
  "clickType": "portal",
  "clickableLink": "https://topia.io",
  "clickableLinkTitle": "My awesome link!",
  "clickableDisplayTextDescription": "Description",
  "clickableDisplayTextHeadline": "Title",
  "position": {
    "x": 0,
    "y": 0
  },
  "portalName": "community"
}
*/
export const updateClickType = async (req, res) => {
  try {
    const droppedAsset = await getDroppedAssetDetails(req);
    if (!droppedAsset) throw "No dropped asset found";
    if (droppedAsset.error) throw droppedAsset.error;
    await droppedAsset.updateClickType(req.body);
    if (res) res.json({ droppedAsset, success: true });
  } catch (e) {
    error("Updating dropped asset click type", e, res);
  }
};
