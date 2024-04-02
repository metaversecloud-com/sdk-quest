import {
  handleCheckInteractiveCredentials,
  handleDropQuestItem,
  handleGetLeaderboard,
  handleMoveVisitor,
  handleGetDroppedAssetDataObject,
  handleGetQuestItems,
  handleGetKeyAssetImage,
  handleQuestItemClicked,
  handleGetVisitor,
  handleRemoveDroppedAsset,
  handleRemoveQuestItems,
  handleRemoveQuestFromWorld,
  handleUpdateAdminSettings,
} from "./controllers/index.js";

import { getVersion } from "./utils/getVersion.js";
import express from "express";
const router = express.Router();

router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    envs: {
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
    },
  });
});

router.get("/system/interactive-credentials", handleCheckInteractiveCredentials);

// Admin
router.get("/leaderboard", handleGetLeaderboard);
router.get("/key-asset-image", handleGetKeyAssetImage);
router.post("/admin-settings", handleUpdateAdminSettings);
router.delete("/quest", handleRemoveQuestFromWorld);

// Dropped Asset
router.get("/dropped-asset/data-object", handleGetDroppedAssetDataObject);
router.get("/quest-items", handleGetQuestItems);
router.post("/dropped-asset/remove-all-with-unique-name", handleRemoveQuestItems);
router.delete("/dropped-asset/:droppedAssetId", handleRemoveDroppedAsset);
router.post("/drop-quest-item", handleDropQuestItem);
router.post("/quest-item-clicked", handleQuestItemClicked);

// Visitor
router.get("/visitor", handleGetVisitor);
router.put("/visitor/move", handleMoveVisitor);

export default router;
