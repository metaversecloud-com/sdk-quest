import {
  // DROPPEDASSET CLASS
  dropAsset,
  fetchDroppedAssetsUniqueName,
  getDroppedAssetDetails,
  removeDroppedAssetsUniqueName,
  removeDroppedAsset,
  // USER CLASS
  getUser,
  updateUserDataObject,
  // VISITOR CLASS
  getVisitor,
  updateLastVisited,
  updateVisitorDataObject,
  // WORLD CLASS
  getWorldDetails,
  getWorldDataObject,
  updateWorldDataObject,
} from "./utils/index.js";

import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Dropped Asset
// assetId comes from interactive nonce
router.get("/dropped-asset", getDroppedAssetDetails); // { includeDataObject: boolean }
router.get("/dropped-asset/fetchWithUniqueName", fetchDroppedAssetsUniqueName); // { isPartial: boolean, uniqueName: string }
router.post("/dropped-asset", dropAsset); // { id: string, isInteractive: boolean, position: {x: number, y: number }, uniqueName: string }
router.post("/dropped-asset/removeAllWithUniqueName", removeDroppedAssetsUniqueName); // { isPartial: boolean, uniqueName: string }
router.delete("/dropped-asset/:instanceId", removeDroppedAsset);

// User
router.get("/user/:profileId", getUser);
router.put("/user/:profileId/data", updateUserDataObject); // { dataObject: object }

// Visitor
// visitorId comes from interactive nonce
router.get("/visitor", getVisitor); // { includeDataObject: boolean }
router.put("/visitor/last-visited", updateLastVisited);
router.put("/visitor/data", updateVisitorDataObject); // { dataObject: object }

// World
// urlSlug comes from interactive nonce
router.get("/world/", getWorldDetails); // { includeDataObject: boolean }
router.get("/world/data-object", getWorldDataObject); // Does not include world details
router.put("/world/data-object", updateWorldDataObject); // { dataObject: object }

export default router;
