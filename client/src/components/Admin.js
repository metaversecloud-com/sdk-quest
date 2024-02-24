import React, { useEffect, useState } from "react";

// components
import { WalkIcon } from "./SVGs.js";
import { RemoveCircleOutline } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

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
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // context
  const { hasInteractiveParams } = useGlobalState();
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    if (hasInteractiveParams) {
      getDataObject();
      getQuestItems();
      setIsLoading(false);
    }
  }, [hasInteractiveParams]);

  const getDataObject = async () => {
    try {
      const result = await backendAPI.get("/dropped-asset/data-object");
      const dataObject = result.data.droppedAsset.dataObject;
      if (dataObject.numberAllowedToCollect) setNumberAllowedToCollect(dataObject.numberAllowedToCollect);
      if (dataObject.questItemImage) setQuestItemImage(dataObject.questItemImage);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const getQuestItems = async () => {
    try {
      const result = await backendAPI.get("/quest-items");
      setQuestItems(result.data.droppedAssets);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const dropItem = async () => {
    try {
      setAreButtonsDisabled(true);
      await backendAPI.post("/drop-quest-item");
      getQuestItems();
      setAreButtonsDisabled(false);
      setErrorMessage("");
    } catch (error) {
      setAreButtonsDisabled(false);
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const removeAllQuestItems = async () => {
    try {
      setAreButtonsDisabled(true);
      await backendAPI.post("/dropped-asset/remove-all-with-unique-name");
      setQuestItems([]);
      setAreButtonsDisabled(false);
      setErrorMessage("");
    } catch (error) {
      setAreButtonsDisabled(false);
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const removeQuestItem = async (id) => {
    try {
      await backendAPI.delete(`/dropped-asset/${id}`);
      getQuestItems();
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
    }
  };

  const moveVisitor = async (position) => {
    try {
      await backendAPI.put("/visitor/move", { moveTo: position });
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
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
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error.message);
      setIsSaving(false);
    }
  };

  if (isLoading) return <CircularProgress />;

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

        <button disabled={areButtonsDisabled} onClick={saveAdminUpdates}>
          Save
        </button>
        <hr style={{ margin: 1 }} />
      </Grid>

      <Grid container direction="row" gap={2} justifyContent="center" mt={2}>
        <Grid item xs={12}>
          <h5 style={{ textAlign: "center" }}>
            {droppedItems.length}{" "}
            {keyAssetImage && (
              <img alt="Drop in world" height={20} src={keyAssetImage} style={{ paddingLeft: 4, paddingRight: 4 }} />
            )}{" "}
            hidden in this world
          </h5>
        </Grid>
        <Grid item>
          <button disabled={areButtonsDisabled} onClick={dropItem}>
            Hide
            {keyAssetImage && (
              <img alt="Drop in world" height={20} src={keyAssetImage} style={{ paddingLeft: 4, paddingRight: 4 }} />
            )}{" "}
            in world
          </button>
        </Grid>
        <Grid item mb={2}>
          <button
            className="btn-outline"
            disabled={areButtonsDisabled || droppedItems.length === 0}
            onClick={removeAllQuestItems}
          >
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
      {errorMessage && <p className="p3 text-error">{errorMessage}</p>}
    </>
  );
}
