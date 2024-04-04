import express from "express";
import {
  handleDropQuestItem,
  handleGetLeaderboard,
  handleMoveVisitor,
  handleGetQuestDetails,
  handleGetQuestItems,
  handleQuestItemClicked,
  handleGetVisitor,
  handleRemoveDroppedAsset,
  handleRemoveQuestFromWorld,
  handleRemoveQuestItems,
  handleUpdateAdminSettings,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";

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

router.get("/quest", handleGetQuestDetails);
router.delete("/quest", handleRemoveQuestFromWorld);

router.get("/leaderboard", handleGetLeaderboard);
router.post("/admin-settings", handleUpdateAdminSettings);

// Dropped Asset
router.get("/quest-items", handleGetQuestItems);
router.post("/dropped-asset/remove-all-with-unique-name", handleRemoveQuestItems);
router.delete("/dropped-asset/:droppedAssetId", handleRemoveDroppedAsset);
router.post("/drop-quest-item", handleDropQuestItem);
router.post("/quest-item-clicked", handleQuestItemClicked);

// Visitor
router.get("/visitor", handleGetVisitor);
router.put("/visitor/move", handleMoveVisitor);

export default router;
