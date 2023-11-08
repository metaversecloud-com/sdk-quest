import React, { useEffect, useState } from "react";

// components
import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { RemoveCircleOutline } from "@mui/icons-material";
import { WalkIcon } from "./SVGs.js";

// context
import { useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

// Formatting
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const keyItemUniqueName = "sdk-quest-item";

export function Admin() {
  const [droppedItems, setQuestItems] = useState([]);
  const [keyAssetImage, setKeyAssetImage] = useState("");
  const [isDropping, setIsDropping] = useState(false);
  const { hasInteractiveParams } = useGlobalState();

  useEffect(() => {
    if (hasInteractiveParams) {
      getQuestItems();
      getKeyAssetImage();
    }
  }, [hasInteractiveParams]);

  const getKeyAssetImage = async () => {
    try {
      const result = await backendAPI.get("/key-asset-image");
      if (result.data.success) {
        setKeyAssetImage(result.data.keyAssetImage);
      } else return console.log("ERROR getting key asset image");
    } catch (error) {
      console.log(error);
    }
  };

  const getQuestItems = async () => {
    try {
      const result = await backendAPI.post("/dropped-asset/uniqueNameSearch", {
        uniqueName: keyItemUniqueName,
      });
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
        uniqueName: keyItemUniqueName,
      });
      if (result.data.success) {
        getQuestItems();
      } else return console.log("ERROR getting data object");
      setIsDropping(false);
    } catch (error) {
      setIsDropping(false);
      console.log(error);
    }
  };

  const removeAllQuestItems = async () => {
    try {
      const result = await backendAPI.post("/dropped-asset/removeAllWithUniqueName", {
        uniqueName: keyItemUniqueName,
      });
      if (result.data.success) {
        setQuestItems([]);
      } else return console.log("ERROR getting data object");
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
      const result = await backendAPI.put(`/visitor/move`, { moveTo: position });
      if (result.data.success) console.log("Moved successfully");
      else return console.log("ERROR moving visitor");
    } catch (error) {
      console.log(error);
    }
  };

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={3} paddingTop={1}>
        <Grid alignItems="center" container direction="column" p={1} paddingTop={0}>
          <Grid item>
            {keyAssetImage ? (
              <Button disabled={isDropping} onClick={dropItem} variant="contained">
                <Typography color="white">Hide </Typography>
                <img
                  alt="Drop in world"
                  className={isDropping ? "isDropping" : ""}
                  height={20}
                  src={keyAssetImage}
                  style={{ paddingLeft: 4, paddingRight: 4 }}
                />{" "}
                <Typography color="white"> in the world</Typography>
              </Button>
            ) : (
              <div />
            )}
          </Grid>
        </Grid>

        {droppedItems.length ? (
          <Grid alignItems="center" container direction="column">
            <Grid item p={1}>
              <Typography>
                {droppedItems.length} {droppedItems.length === 1 ? "" : ""} hidden in this world
              </Typography>
            </Grid>
            <Grid item>
              <Button onClick={removeAllQuestItems} variant="contained">
                Remove all
              </Button>
            </Grid>
            <Grid item pt={3}>
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
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </>
  );
}
