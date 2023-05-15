import React, { useEffect, useState } from "react";

// components
import {
  Button,
  Grid,
  // TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

// context
import {
  // fetchWorld, useGlobalDispatch,
  useGlobalState,
} from "@context";

// utils
import { backendAPI } from "@utils";

const eggUniqueName = "sdk-egg-hunter_egg";

export function Home() {
  // const [droppedAsset, setDroppedAsset] = useState();
  const [toggle, setToggle] = useState("leaderboard");
  const [droppedEggs, setDroppedEggs] = useState([]);

  // context
  // const globalDispatch = useGlobalDispatch();
  const {
    hasInteractiveParams,
    visitor,
    // selectedWorld
  } = useGlobalState();

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) getDroppedEggs();
  }, [hasInteractiveParams]);

  // const { name } = selectedWorld;

  // const handleSelectWorld = async () => {
  //   await fetchWorld({ apiKey, dispatch: globalDispatch, urlSlug })
  //     .then(() => {
  //       console.log("Success!");
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });
  // };

  // const handleGetDroppedAsset = async () => {
  //   try {
  //     const result = await backendAPI.get("/dropped-asset");
  //     if (result.data.success) {
  //       setDroppedAsset(result.data.droppedAsset);
  //     } else return console.log("ERROR getting data object");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

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
      const result = await backendAPI.post("/dropped-asset/webimage", {
        isInteractive: true,
        layers: {
          // TODO: Change to image stored in world data object
          top: imageUrl,
        },
        uniqueName: eggUniqueName,
        position: { x: 100, y: 100 },
      });
      console.log(result);
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
      console.log(result);
      if (result.data.success) {
        setDroppedEggs([]);
      } else return console.log("ERROR getting data object");
    } catch (error) {
      console.log(error);
    }
  };

  const removeEgg = async ({ id }) => {
    try {
      const result = await backendAPI.delete(`/dropped-asset/${id}`);

      if (result.data.success) {
        getDroppedEggs();
      } else return console.log("ERROR deleting egg");
    } catch (error) {
      console.log(error);
    }
  };

  console.log(visitor);
  console.log(droppedEggs);

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={3}>
        <Grid item>
          <Grid alignItems="center" container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">Egg Hunter</Typography>
            </Grid>
            {visitor && visitor.isAdmin && (
              <Grid item xs={12}>
                <ToggleButtonGroup
                  aria-label="Admin vs Leaderboard"
                  color="primary"
                  exclusive
                  onChange={(e) => setToggle(e.target.value)}
                  value={toggle}
                >
                  <ToggleButton value="leaderboard">Leaderboard</ToggleButton>
                  <ToggleButton value="admin">Admin</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            )}

            <Grid item>
              Click to Hide an Egg in the world
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

            <Grid item>
              <Button onClick={removeAllEggs} variant="contained">
                Remove all dropped eggs
              </Button>
            </Grid>
            {droppedEggs && (
              <>
                <Grid item pt={4} xs={12}>
                  <Typography>There are currently {droppedEggs.length} eggs hidden in this world</Typography>
                </Grid>
                <Grid item pt={4} xs={12}>
                  {droppedEggs.map((egg, index) => {
                    return (
                      <Grid alignItems="center" container direction="row" key={egg.id} spacing={0}>
                        <Grid item m={1} xs={2}>
                          <Typography>Egg {index + 1}</Typography>
                        </Grid>
                        <Grid item m={1} xs={4}>
                          <Button>Walk to</Button>
                        </Grid>
                        <Grid item m={1} xs={2}>
                          <Button onClick={() => removeEgg(egg.id)}>Remove</Button>
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
