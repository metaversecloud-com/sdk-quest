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

const eggUniqueName = "sdk-egg-hunter_egg";

export function Admin() {
  // const [droppedAsset, setDroppedAsset] = useState();

  const [droppedEggs, setDroppedEggs] = useState([]);
  const [eggImage, setEggImage] = useState("");
  const [dropping, setDropping] = useState(false);
  const { hasInteractiveParams } = useGlobalState();

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) {
      getDroppedEggs();
      getEggImage();
    }
  }, [hasInteractiveParams]);

  const getEggImage = async () => {
    try {
      const result = await backendAPI.get("/egg-image");
      if (result.data.success) {
        setEggImage(result.data.eggImage);
      } else return console.log("ERROR getting egg image");
    } catch (error) {
      console.log(error);
    }
  };

  const getDroppedEggs = async () => {
    try {
      const result = await backendAPI.post("/dropped-asset/uniqueNameSearch", {
        uniqueName: eggUniqueName,
      });
      if (result.data.success) {
        setDroppedEggs(result.data.droppedAssets);
        // TODO Get dropped asset details and include data object so can display 'lastMoved'
        // const requests = result.data.droppedAssets.map(async (egg) => {
        //   const response = await backendAPI.post(`/dropped-asset/get/${egg.id}`, {
        //     includeDataObject: true,
        //   });
        //   return response.data.droppedAsset;
        // });

        // const droppedAssets = await Promise.all(requests);
        // setDroppedEggs(droppedAssets);
        // console.log(droppedAssets);
        // .then(droppedEggs => setDroppedEggs(droppedEggs);)
        // .catch(error => console.error(error));

        // setDroppedEggs(result.data.droppedAssets);
      } else return console.log("ERROR getting dropped eggs");
    } catch (error) {
      console.log(error);
    }
  };

  const dropEgg = async () => {
    try {
      setDropping(true);
      const result = await backendAPI.post("/create-egg", {
        uniqueName: eggUniqueName,
      });
      if (result.data.success) {
        getDroppedEggs();
        // setDroppedEggs({ ...droppedEggs, ...result.data.droppedAsset });
      } else return console.log("ERROR getting data object");
      setDropping(false);
    } catch (error) {
      setDropping(false);
      console.log(error);
    }
  };

  const removeAllEggs = async () => {
    try {
      const result = await backendAPI.post("/dropped-asset/removeAllWithUniqueName", {
        uniqueName: eggUniqueName,
      });
      if (result.data.success) {
        setDroppedEggs([]);
      } else return console.log("ERROR getting data object");
    } catch (error) {
      console.log(error);
    }
  };

  const removeEgg = async (id) => {
    try {
      const result = await backendAPI.delete(`/dropped-asset/${id}`);

      if (result.data.success) {
        getDroppedEggs();
      } else return console.log("ERROR deleting egg");
    } catch (error) {
      console.log(error);
    }
  };

  const moveVisitor = async (position) => {
    try {
      const result = await backendAPI.put(`/visitor/move`, { moveTo: position });

      if (result.data.success) {
        console.log("Moved successfully");
      } else return console.log("ERROR deleting egg");
    } catch (error) {
      console.log(error);
    }
  };

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={3}>
        <Grid alignItems="center" container direction="column" p={1}>
          <Grid item>
            {eggImage ? (
              <Button disabled={dropping} onClick={dropEgg} variant="contained">
                <Typography color="white">Hide </Typography>
                <img
                  alt="Drop in world"
                  className={dropping ? "dropping" : ""}
                  height={20}
                  src={eggImage}
                  style={{ paddingLeft: 4, paddingRight: 4 }}
                />{" "}
                <Typography color="white"> in the world</Typography>
              </Button>
            ) : (
              <div />
            )}
          </Grid>
        </Grid>

        {droppedEggs.length ? (
          <Grid alignItems="center" container direction="column">
            <Grid item p={1}>
              <Typography>
                {droppedEggs.length} {droppedEggs.length === 1 ? "" : ""} hidden in this world
              </Typography>
            </Grid>
            <Grid item>
              <Button onClick={removeAllEggs} variant="contained">
                Remove all
              </Button>
            </Grid>
            <Grid item pt={4}>
              {droppedEggs.map((egg, index) => {
                if (!egg) return <div />;
                let lastMovedFormatted = "-";
                if (egg.clickableLink) {
                  const clickableLink = new URL(egg.clickableLink);
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
                    key={egg.id}
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
                          onClick={() => moveVisitor(egg.position)}
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
                          onClick={() => removeEgg(egg.id)}
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
