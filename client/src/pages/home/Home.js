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

export function Home() {
  const [droppedAsset, setDroppedAsset] = useState();
  const [toggle, setToggle] = useState("leaderboard");
  const [droppedEggs, setDroppedEggs] = useState();

  // Get Visitor info
  useEffect(() => {
    const getDroppedEggs = async () => {
      const result = await backendAPI.post("/dropped-asset/uniqueNameSearch", {
        isPartial: true,
        uniqueName: "sdk-egg-hunter_egg",
      });
      if (result.data.success) {
        setDroppedEggs(result.data.droppedAssets);
      } else {
        console.log("Error getting visitor");
      }
    };
    getDroppedEggs();
  }, []);

  // context
  // const globalDispatch = useGlobalDispatch();
  const {
    hasInteractiveParams,
    visitor,
    // selectedWorld
  } = useGlobalState();
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

  const handleGetDroppedAsset = async () => {
    try {
      const result = await backendAPI.get("/dropped-asset");
      if (result.data.success) {
        setDroppedAsset(result.data.droppedAsset);
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
        uniqueName: "sdk-egg-hunter_egg",
        position: { x: 100, y: 100 },
      });
      if (result.data.success) {
        setDroppedEggs({ ...droppedEggs, ...result.data.droppedAsset });
      } else return console.log("ERROR getting data object");
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
            )}

            <Grid item>
              <Button onClick={handleGetDroppedAsset} variant="contained">
                Remove all dropped eggs
              </Button>
              <Button
                onClick={() =>
                  dropEgg({
                    imageUrl:
                      "https://www.shutterstock.com/image-vector/colorful-illustration-test-word-260nw-1438324490.jpg",
                  })
                }
                variant="contained"
              >
                <img
                  alt="Drop egg in world"
                  src="https://www.shutterstock.com/image-vector/colorful-illustration-test-word-260nw-1438324490.jpg"
                />
              </Button>
            </Grid>

            <Grid item>
              <Button onClick={handleGetDroppedAsset} variant="contained">
                Remove all dropped eggs
              </Button>
            </Grid>
            {droppedEggs && (
              <>
                <Grid item pt={4} xs={12}>
                  <Typography>
                    You have successfully retrieved the dropped asset details for {droppedAsset.assetName}!
                  </Typography>
                </Grid>
                <Grid item m={4} xs={12}>
                  <img alt="preview" src={droppedAsset.topLayerURL || droppedAsset.bottomLayerURL} />
                </Grid>
              </>
            )}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
