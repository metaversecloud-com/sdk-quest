import {
  dropQuestItem,
  getLeaderboard,
  moveVisitor,
  handleGetDroppedAssetsWithUniqueName,
  handleGetKeyAssetImage,
  handleGetWorldDataObject,
  handleQuestItemClicked,
  handleGetVisitor,
  removeDroppedAsset,
  removeDroppedAssetsWithUniqueName,
  updateAdminSettings,
} from "./controllers/index.js";

import express from "express";
const router = express.Router();

// Admin
router.get("/leaderboard", getLeaderboard);
router.get("/key-asset-image", handleGetKeyAssetImage);
router.post("/admin-settings", updateAdminSettings);
router.get("/world-data-object", handleGetWorldDataObject);

// Dropped Asset
router.get("/quest-items", handleGetDroppedAssetsWithUniqueName); // { isPartial: boolean, uniqueName: string }
router.post("/dropped-asset/remove-all-with-unique-name", removeDroppedAssetsWithUniqueName); // { isPartial: boolean, uniqueName: string }
router.delete("/dropped-asset/:droppedAssetId", removeDroppedAsset);
router.post("/drop-quest-item", dropQuestItem);
router.post("/quest-item-clicked", handleQuestItemClicked);

// Visitor
// visitorId comes from interactive nonce
router.get("/visitor", handleGetVisitor);
router.put("/visitor/move", moveVisitor);

export default router;
