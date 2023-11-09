import {
  dropQuestItem,
  getLeaderboard,
  moveVisitor,
  handleGetDroppedAssetsWithUniqueName,
  handleGetKeyAssetImage,
  handleQuestItemClicked,
  handleGetVisitor,
  removeDroppedAsset,
  removeDroppedAssetsWithUniqueName,
} from "./controllers/index.js";

import express from "express";
const router = express.Router();

// Quest Backend
router.post("/drop-quest-item", dropQuestItem);
router.post("/egg-clicked", handleQuestItemClicked);
router.post("/quest-item-clicked", handleQuestItemClicked);
router.get("/leaderboard", getLeaderboard);
router.get("/key-asset-image", handleGetKeyAssetImage);

// Dropped Asset
// Gets all dropped assets with unique name
router.post("/dropped-asset/uniqueNameSearch", handleGetDroppedAssetsWithUniqueName); // { isPartial: boolean, uniqueName: string }
router.post("/dropped-asset/removeAllWithUniqueName", removeDroppedAssetsWithUniqueName); // { isPartial: boolean, uniqueName: string }
router.delete("/dropped-asset/:droppedAssetId", removeDroppedAsset);

// Visitor
// visitorId comes from interactive nonce
router.get("/visitor", handleGetVisitor); // { includeDataObject: boolean }
router.put("/visitor/move", moveVisitor);

export default router;
