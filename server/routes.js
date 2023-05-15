import {
  // DROPPEDASSET CLASS
  dropAsset,
  fetchDroppedAssetsUniqueName,
  getDroppedAssetDetails,
  getEmbeddedAssetDetails,
  removeDroppedAssetsUniqueName,
  removeDroppedAsset,
  updateClickType,
  updatePosition,
  // USER CLASS
  getUser,
  updateUserDataObject,
  // VISITOR CLASS
  getVisitor,
  updateLastVisited,
  updateVisitorDataObject,
  // WORLD CLASS
  getWorldDataObject,
  getWorldDetails,
  updateWorldDataObject,
  updateWorldDetails,
} from "./utils/index.js";

import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Hello from server!" });
});

// Dropped Asset
// Get details of droppedAsset that opened iFrame or fired webhook. assetId comes from interactive nonce.
router.get("/dropped-asset", getEmbeddedAssetDetails); // { includeDataObject: boolean }
// Gets all dropped assets with unique name
router.post("/dropped-asset/uniqueNameSearch", fetchDroppedAssetsUniqueName); // { isPartial: boolean, uniqueName: string }
router.post("/dropped-asset", dropAsset); // { id: string, isInteractive: boolean, position: {x: number, y: number }, uniqueName: string }
router.post("/dropped-asset/removeAllWithUniqueName", removeDroppedAssetsUniqueName); // { isPartial: boolean, uniqueName: string }

// Dropped Asset Instance
router.get("/dropped-asset/:instanceId", getDroppedAssetDetails); // { includeDataObject: boolean }
router.delete("/dropped-asset/:instanceId", removeDroppedAsset);
router.put("/dropped-asset/:instanceId/updateClickType", updateClickType); // See file for inputs
router.put("/dropped-asset/:instanceId/updatePosition", updatePosition); // { position: {x, y} }

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
router.get("/world", getWorldDetails); // { includeDataObject: boolean }
router.put("/world", updateWorldDetails); // See file for inputs
router.get("/world/data-object", getWorldDataObject); // Does not include world details
router.put("/world/data-object", updateWorldDataObject); // { dataObject: object }

export default router;
