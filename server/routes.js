import {
  handleDropQuestItem,
  handleGetLeaderboard,
  handleMoveVisitor,
  handleGetDroppedAssetDataObject,
  handleGetQuestItems,
  handleGetKeyAssetImage,
  handleQuestItemClicked,
  handleGetVisitor,
  handleRemoveDroppedAsset,
  handleRemoveDroppedAssetsWithUniqueName,
  handleUpdateAdminSettings,
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
router.get("/leaderboard", handleGetLeaderboard);
router.get("/key-asset-image", handleGetKeyAssetImage);
router.post("/admin-settings", handleUpdateAdminSettings);

// Dropped Asset
router.get("/dropped-asset/data-object", handleGetDroppedAssetDataObject);
router.get("/quest-items", handleGetQuestItems);
router.post("/dropped-asset/remove-all-with-unique-name", handleRemoveDroppedAssetsWithUniqueName);
router.delete("/dropped-asset/:droppedAssetId", handleRemoveDroppedAsset);
router.post("/drop-quest-item", handleDropQuestItem);
router.post("/quest-item-clicked", handleQuestItemClicked);

// Visitor
// visitorId comes from interactive nonce
router.get("/visitor", handleGetVisitor);
router.put("/visitor/move", handleMoveVisitor);

export default router;
