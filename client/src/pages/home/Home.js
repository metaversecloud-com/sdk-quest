import React, { useEffect, useState } from "react";
import { Admin, Leaderboard } from "../../components";

// components
import {
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

import { backendAPI } from "@utils";

export function Home() {
  // const [droppedAsset, setDroppedAsset] = useState();
  const [toggle, setToggle] = useState("leaderboard");
  const [eggImage, setEggImage] = useState("");

  // context
  // const globalDispatch = useGlobalDispatch();
  const {
    hasInteractiveParams,
    visitor,
    // selectedWorld
  } = useGlobalState();

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) {
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

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Grid item p={3} paddingBottom={0} paddingTop={0} xs={12}>
        {eggImage ? <img alt="Find me" src={eggImage} /> : <div />}
      </Grid>
      <Grid item p={3} xs={12}>
        <Typography variant="h4">Quest</Typography>
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
            <ToggleButton style={{ padding: 20 }} value="leaderboard">
              Leaderboard
            </ToggleButton>
            <ToggleButton style={{ padding: 20 }} value="admin">
              Admin
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      )}
      {toggle === "admin" ? <Admin /> : <Leaderboard eggImage={eggImage} />}
    </Grid>
  );
}
