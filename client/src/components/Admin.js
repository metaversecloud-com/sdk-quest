import React, { useEffect, useState } from "react";

// components
import { Button, Grid, IconButton, Tooltip, Typography } from "@mui/material";
import { DirectionsWalk, RemoveCircleOutline } from "@mui/icons-material";

// context
import { useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

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
      } else return console.log("ERROR getting data object");
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
            <Typography>{!dropping ? "Click to Hide an Egg in the world" : "Dropping egg..."}</Typography>
          </Grid>
          <Grid item>
            {eggImage ? (
              <Button disabled={dropping} onClick={dropEgg}>
                <img alt="Drop egg in world" className={dropping ? "dropping" : ""} src={eggImage} />
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
                {droppedEggs.length} {droppedEggs.length === 1 ? "egg" : "eggs"} hidden in this world
              </Typography>
            </Grid>
            <Grid item>
              <Button onClick={removeAllEggs} variant="contained">
                Remove all eggs
              </Button>
            </Grid>
            <Grid item pt={4}>
              {droppedEggs.map((egg, index) => {
                return (
                  <Grid
                    alignItems="center"
                    container
                    direction="row"
                    justifyContent="space-between"
                    key={egg.id}
                    sx={{ width: "50vw" }}
                  >
                    <Grid item xs={5}>
                      <Typography sx={{ color: "rgba(0, 0, 0, 0.54)" }}>Egg {index + 1}</Typography>
                    </Grid>
                    <Grid item xs={4}>
                      <Tooltip placement="left" title="Walk to">
                        <IconButton aria-label="Walk to" onClick={() => moveVisitor(egg.position)}>
                          <DirectionsWalk />
                        </IconButton>
                      </Tooltip>
                    </Grid>
                    <Grid item xs={3}>
                      <Tooltip placement="right" title="Remove">
                        <IconButton aria-label="Remove from world" onClick={() => removeEgg(egg.id)}>
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
