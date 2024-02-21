import {
  dropQuestItem,
  getLeaderboard,
  moveVisitor,
  handleGetDroppedAssetDataObject,
  handleGetQuestItems,
  handleGetKeyAssetImage,
  handleQuestItemClicked,
  handleGetVisitor,
  removeDroppedAsset,
  removeDroppedAssetsWithUniqueName,
  updateAdminSettings,
} from "./controllers/index.js";

import { getVersion } from "./utils/getVersion.js";
import express from "express";
const router = express.Router();

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
  });
});

// Admin
router.get("/leaderboard", getLeaderboard);
router.get("/key-asset-image", handleGetKeyAssetImage);
router.post("/admin-settings", updateAdminSettings);

// Dropped Asset
router.get("/dropped-asset/data-object", handleGetDroppedAssetDataObject);
router.get("/quest-items", handleGetQuestItems);
router.post("/dropped-asset/remove-all-with-unique-name", removeDroppedAssetsWithUniqueName);
router.delete("/dropped-asset/:droppedAssetId", removeDroppedAsset);
router.post("/drop-quest-item", dropQuestItem);
router.post("/quest-item-clicked", handleQuestItemClicked);

// Visitor
// visitorId comes from interactive nonce
router.get("/visitor", handleGetVisitor);
router.put("/visitor/move", moveVisitor);

export default router;
