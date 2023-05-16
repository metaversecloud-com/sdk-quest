import React, { useEffect, useState } from "react";

// components
import { Button, Grid, Typography } from "@mui/material";

// context
import { useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

const eggUniqueName = "sdk-egg-hunter_egg";

export function Admin() {
  // const [droppedAsset, setDroppedAsset] = useState();

  const [droppedEggs, setDroppedEggs] = useState([]);
  const { hasInteractiveParams } = useGlobalState();

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) getDroppedEggs();
  }, [hasInteractiveParams]);

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

  const dropEgg = async ({ imageUrl }) => {
    try {
      const result = await backendAPI.post("/create-egg", {
        layers: {
          // TODO: Change to image stored in world data object
          top: imageUrl,
        },
        uniqueName: eggUniqueName,
      });
      if (result.data.success) {
        getDroppedEggs();
        // setDroppedEggs({ ...droppedEggs, ...result.data.droppedAsset });
      } else return console.log("ERROR getting data object");
    } catch (error) {
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
          <Grid item>Click to Hide an Egg in the world</Grid>
          <Grid item>
            <Button
              onClick={() =>
                dropEgg({
                  imageUrl: "https://topiaimages.s3.us-west-1.amazonaws.com/easter-egg.png",
                })
              }
            >
              <img alt="Drop egg in world" src="https://topiaimages.s3.us-west-1.amazonaws.com/easter-egg.png" />
            </Button>
          </Grid>
        </Grid>

        {droppedEggs && (
          <Grid alignItems="center" container direction="column" p={0}>
            <Grid item p={2}>
              <Typography>
                {droppedEggs.length} {droppedEggs.length === 1 ? "egg" : "eggs"} hidden in this world
              </Typography>
            </Grid>
            <Grid item>
              <Button onClick={removeAllEggs} variant="contained">
                Remove all eggs
              </Button>
            </Grid>
            <Grid item pt={4} xs={12}>
              {droppedEggs.map((egg, index) => {
                console.log(egg);
                return (
                  <Grid alignItems="center" container direction="row" key={egg.id} spacing={2}>
                    <Grid item>
                      <Typography>Egg {index + 1}</Typography>
                    </Grid>
                    <Grid item>
                      <Button onClick={() => moveVisitor(egg.position)}>Walk to</Button>
                    </Grid>
                    <Grid item>
                      <Button onClick={() => removeEgg(egg.id)}>Remove</Button>
                    </Grid>
                  </Grid>
                );
              })}
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
}
