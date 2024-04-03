import express from "express";
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
  handleRemoveQuestItems,
  handleUpdateAdminSettings,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";
import { checkInteractiveCredentials } from './middleware/checkInteractiveCredentials.js';

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

// Admin
router.get("/leaderboard", checkInteractiveCredentials, handleGetLeaderboard);
router.get("/key-asset-image", checkInteractiveCredentials, handleGetKeyAssetImage);
router.post("/admin-settings", checkInteractiveCredentials, handleUpdateAdminSettings);

// Dropped Asset
router.get("/dropped-asset/data-object", checkInteractiveCredentials, handleGetDroppedAssetDataObject);
router.get("/quest-items", checkInteractiveCredentials, handleGetQuestItems);
router.post("/dropped-asset/remove-all-with-unique-name", checkInteractiveCredentials, handleRemoveQuestItems);
router.delete("/dropped-asset/:droppedAssetId", checkInteractiveCredentials, handleRemoveDroppedAsset);
router.post("/drop-quest-item", checkInteractiveCredentials, handleDropQuestItem);
router.post("/quest-item-clicked", checkInteractiveCredentials, handleQuestItemClicked);

// Visitor
router.get("/visitor", handleGetVisitor);
router.put("/visitor/move", handleMoveVisitor);

export default router;
