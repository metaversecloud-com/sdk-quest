import express from "express";
import {
  handleDropQuestItem,
  handleGetLeaderboard,
  handleMoveVisitor,
  handleGetQuestDetails,
  handleGetQuestItems,
  handleQuestItemClicked,
  handleRemoveDroppedAsset,
  handleRemoveQuestFromWorld,
  handleRemoveQuestItems,
  handleUpdateAdminSettings,
} from "./controllers/index.js";
import { getVersion } from "./utils/getVersion.js";

const router = express.Router();

const SERVER_START_DATE = new Date();
router.get("/system/health", (req, res) => {
  return res.json({
    appVersion: getVersion(),
    status: "OK",
    serverStartDate: SERVER_START_DATE,
    envs: {
      COMMIT_HASH: process.env.COMMIT_HASH,
      NODE_ENV: process.env.NODE_ENV,
      INSTANCE_DOMAIN: process.env.INSTANCE_DOMAIN,
      INTERACTIVE_KEY: process.env.INTERACTIVE_KEY,
      S3_BUCKET: process.env.S3_BUCKET,
      GOOGLESHEETS_CLIENT_EMAIL: process.env.CLIENT_EMAIL ? "SET" : "UNSET",
      GOOGLESHEETS_SHEET_ID: process.env.SHEET_ID ? "SET" : "UNSET",
      GOOGLESHEETS_PRIVATE_KEY: process.env.PRIVATE_KEY ? "SET" : "UNSET",
      GOOGLESHEETS_SHEET_RANGE: process.env.GOOGLESHEETS_SHEET_RANGE ? "SET" : "UNSET",
    },
  });
});

router.get("/quest", handleGetQuestDetails);
router.get("/leaderboard", handleGetLeaderboard);

// Dropped Asset
router.get("/quest-items", handleGetQuestItems);
router.post("/dropped-asset/remove-all-with-unique-name", handleRemoveQuestItems);
router.delete("/dropped-asset/:droppedAssetId", handleRemoveDroppedAsset);
router.post("/drop-quest-item", handleDropQuestItem);
router.post("/quest-item-clicked", handleQuestItemClicked);

// Admins
router.put("/visitor/move", handleMoveVisitor);
router.post("/admin-settings", handleUpdateAdminSettings);
router.delete("/quest", handleRemoveQuestFromWorld);

export default router;
