import React, { useEffect, useState } from "react";

// components
import { CircularProgress, Grid } from "@mui/material";
import { RemoveCircleOutline } from "@mui/icons-material";
import { WalkIcon } from "./SVGs.js";

// context
import { setKeyAssetImage, useGlobalDispatch, useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

// Formatting
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

export function Admin({ keyAssetImage }) {
  const [numberAllowedToCollect, setNumberAllowedToCollect] = useState();
  const [questItemImage, setQuestItemImage] = useState("");
  const [droppedItems, setQuestItems] = useState([]);
  const [isDropping, setIsDropping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { hasInteractiveParams, keyAssetId } = useGlobalState();
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    if (hasInteractiveParams) {
      getWorldDataObject();
      getQuestItems();
      setIsLoading(false);
    }
  }, [hasInteractiveParams]);

  const getWorldDataObject = async () => {
    try {
      const result = await backendAPI.get("/world-data-object");
      const { dataObject } = result.data.world;
      if (keyAssetId && dataObject.keyAssets[keyAssetId]?.numberAllowedToCollect)
        setNumberAllowedToCollect(dataObject.keyAssets[keyAssetId].numberAllowedToCollect);
      if (keyAssetId && dataObject.keyAssets[keyAssetId]?.questItemImage)
        setQuestItemImage(dataObject.keyAssets[keyAssetId].questItemImage);
    } catch (error) {
      console.log(error);
    }
  };

  const getQuestItems = async () => {
    try {
      const result = await backendAPI.get("/quest-items");
      if (result.data.success) {
        setQuestItems(result.data.droppedAssets);
      } else return console.log("ERROR getting quest items");
    } catch (error) {
      console.log(error);
    }
  };

  const dropItem = async () => {
    try {
      setIsDropping(true);
      const result = await backendAPI.post("/drop-quest-item");
      if (result.data.success) {
        getQuestItems();
      } else return console.log("ERROR dropping quest item");
      setIsDropping(false);
    } catch (error) {
      setIsDropping(false);
      console.log(error);
    }
  };

  const removeAllQuestItems = async () => {
    try {
      const result = await backendAPI.post("/dropped-asset/remove-all-with-unique-name");
      if (result.data.success) {
        setQuestItems([]);
      } else return console.log("ERROR removing all quest items");
    } catch (error) {
      console.log(error);
    }
  };

  const removeQuestItem = async (id) => {
    try {
      const result = await backendAPI.delete(`/dropped-asset/${id}`);
      if (result.data.success) getQuestItems();
      else return console.log("ERROR deleting quest item");
    } catch (error) {
      console.log(error);
    }
  };

  const moveVisitor = async (position) => {
    try {
      await backendAPI.put("/visitor/move", { moveTo: position });
    } catch (error) {
      console.log(error);
    }
  };

  const saveAdminUpdates = async () => {
    setIsSaving(true);
    try {
      await backendAPI.post("/admin-settings", { numberAllowedToCollect, questItemImage });
      setKeyAssetImage({
        dispatch: globalDispatch,
        keyAssetImage: questItemImage,
      });
      setIsSaving(false);
    } catch (error) {
      console.log(error);
      setIsSaving(false);
    }
  };

  if (isLoading) return <CircularProgress />;

  if (!hasInteractiveParams) {
    return <h4>You can only access this application from within a Topia world embed.</h4>;
  }

  return (
    <>
      <Grid container direction="column" gap={2}>
        <hr style={{ margin: 1 }} />
        <div>
          <label htmlFor="numberAllowedToCollect">Number Allowed To Collect Per Day:</label>
          <input
            id="numberAllowedToCollect"
            onChange={(e) => setNumberAllowedToCollect(e.target.value)}
            type="text"
            value={numberAllowedToCollect}
          />
        </div>

        <div>
          <label htmlFor="questItemImage">Quest Item Image URL:</label>
          <input
            id="questItemImage"
            onChange={(e) => setQuestItemImage(e.target.value)}
            type="text"
            value={questItemImage}
          />
          <p className="p3">Update image for all Quest Items in world. This will not change the Key Asset image.</p>
        </div>

        <button disabled={isSaving} onClick={saveAdminUpdates}>
          Save
        </button>
        <hr style={{ margin: 1 }} />
      </Grid>

      <Grid container direction="row" gap={2} justifyContent="center" mt={2}>
        <Grid item xs={12}>
          <h5 style={{ textAlign: "center" }}>
            {droppedItems.length}{" "}
            {keyAssetImage && (
              <img
                alt="Drop in world"
                className={isDropping ? "isDropping" : ""}
                height={20}
                src={keyAssetImage}
                style={{ paddingLeft: 4, paddingRight: 4 }}
              />
            )}{" "}
            hidden in this world
          </h5>
        </Grid>
        <Grid item>
          <button disabled={isDropping} onClick={dropItem}>
            Hide
            {keyAssetImage && (
              <img
                alt="Drop in world"
                className={isDropping ? "isDropping" : ""}
                height={20}
                src={keyAssetImage}
                style={{ paddingLeft: 4, paddingRight: 4 }}
              />
            )}{" "}
            in world
          </button>
        </Grid>
        <Grid item mb={2}>
          <button className="btn-outline" disabled={droppedItems.length === 0} onClick={removeAllQuestItems}>
            Remove all
          </button>
        </Grid>
      </Grid>

      {droppedItems.length > 0 && (
        <Grid container direction="column" mt={1}>
          <h4>Placed Items</h4>
          <table>
            <tbody>
              {droppedItems.map((item, index) => {
                if (!item) return <div />;
                let lastMovedFormatted = "-";
                if (item.clickableLink) {
                  const clickableLink = new URL(item.clickableLink);
                  let params = new URLSearchParams(clickableLink.search);
                  const lastMoved = new Date(parseInt(params.get("lastMoved")));
                  dayjs.extend(relativeTime);
                  lastMovedFormatted = dayjs(lastMoved).fromNow(); // Adding true to fromNow gets rid of 'ago' to save space
                }
                return (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="tooltip">
                        <span className="tooltip-content">Last Moved</span>
                        {lastMovedFormatted}
                      </div>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="tooltip">
                        <span className="tooltip-content">Walk to Item</span>
                        <button className="btn-icon" onClick={() => moveVisitor(item.position)}>
                          <WalkIcon />
                        </button>
                      </div>
                      <div className="tooltip">
                        <span className="tooltip-content">Remove Item</span>
                        <button className="btn-icon" onClick={() => removeQuestItem(item.id)}>
                          <RemoveCircleOutline />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Grid>
      )}
    </>
  );
}
