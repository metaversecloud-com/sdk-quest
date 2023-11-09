import React, { useEffect, useState } from "react";

// components
import { Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { RemoveCircleOutline } from "@mui/icons-material";
import { WalkIcon } from "./SVGs.js";

// context
import { setKeyAssetImage, useGlobalDispatch, useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

// Formatting
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const uniqueName = "sdk-quest-item";

export function Admin({ keyAssetImage }) {
  const [numberAllowedToCollect, setNumberAllowedToCollect] = useState(5);
  const [questItemImage, setQuestItemImage] = useState("");
  const [droppedItems, setQuestItems] = useState([]);
  const [isDropping, setIsDropping] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // context
  const { hasInteractiveParams } = useGlobalState();
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    if (hasInteractiveParams) {
      getWorldDataObject();
      getQuestItems();
    }
  }, [hasInteractiveParams]);

  const getWorldDataObject = async () => {
    try {
      const result = await backendAPI.get("/world-data-object");
      const { dataObject } = result.data.world;
      if (dataObject.numberAllowedToCollect) setNumberAllowedToCollect(dataObject.numberAllowedToCollect);
      if (dataObject.questItemImage) setQuestItemImage(dataObject.questItemImage);
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
      const result = await backendAPI.post("/drop-quest-item", {
        uniqueName,
      });
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
      const result = await backendAPI.post("/dropped-asset/remove-all-with-unique-name", {
        uniqueName,
      });
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
      const result = await backendAPI.put("/visitor/move", { moveTo: position });
      if (result.data.success) console.log("Moved successfully");
      else return console.log("ERROR moving visitor");
    } catch (error) {
      console.log(error);
    }
  };

  const saveAdminUpdates = async () => {
    setIsSaving(true);
    try {
      await backendAPI.post("/number-allowed-to-collect", { numberAllowedToCollect });
      if (droppedItems.length > 0) await backendAPI.post("/quest-item-image", { questItemImage });
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

  if (!hasInteractiveParams) {
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;
  }

  return (
    <Grid container direction="column" gap={2} justifyContent="space-around" p={3} paddingTop={1}>
      <hr style={{ margin: 1 }} />
      <label htmlFor="numberAllowedToCollect">Number Allowed To Collect:</label>
      <input
        id="numberAllowedToCollect"
        onChange={(e) => setNumberAllowedToCollect(e.target.value)}
        type="text"
        value={numberAllowedToCollect}
      />

      <label htmlFor="questItemImage">Quest Item Image URL:</label>
      <input
        id="questItemImage"
        onChange={(e) => setQuestItemImage(e.target.value)}
        type="text"
        value={questItemImage}
      />

      <button disabled={isSaving} onClick={saveAdminUpdates}>
        Save
      </button>

      <hr style={{ margin: 1 }} />

      <Grid container direction="row" gap={2} justifyContent="center">
        <Typography pt={1}>
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
        </Typography>
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
        <Grid item>
          <button className="btn-outline" disabled={droppedItems.length === 0} onClick={removeAllQuestItems}>
            Remove all
          </button>
        </Grid>
        {droppedItems.length > 0 && (
          <Grid item>
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
                <Grid
                  alignItems="center"
                  container
                  direction="row"
                  justifyContent="space-between"
                  key={item.id}
                  sx={{ width: "80vw" }}
                >
                  <Grid item xs={3}>
                    <Typography sx={{ color: "rgba(0, 0, 0, 0.54)" }}>{index + 1}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography sx={{ color: "rgba(0, 0, 0, 0.54)" }}>{lastMovedFormatted}</Typography>
                  </Grid>
                  <Grid item xs={1}>
                    <Tooltip placement="left" title="Walk to">
                      <IconButton
                        aria-label="Walk to"
                        onClick={() => moveVisitor(item.position)}
                        style={{ minWidth: 20 }}
                      >
                        <WalkIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={1}>
                    <Tooltip placement="right" title="Remove">
                      <IconButton
                        aria-label="Remove from world"
                        onClick={() => removeQuestItem(item.id)}
                        style={{ minWidth: 20 }}
                      >
                        <RemoveCircleOutline />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Grid>
    </Grid>
  );
}
