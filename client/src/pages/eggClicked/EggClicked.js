import React, { useEffect, useState } from "react";
import { Leaderboard } from "../../components";

// components
import { Grid, Typography } from "@mui/material";

// context
import {
  // fetchWorld, useGlobalDispatch,
  useGlobalState,
} from "@context";

import { backendAPI } from "@utils";

export function EggClicked() {
  const [message, setMessage] = useState("");
  const {
    hasInteractiveParams,
    // selectedWorld
  } = useGlobalState();

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) handleEggClicked();
  }, [hasInteractiveParams]);

  const handleEggClicked = async () => {
    try {
      const result = await backendAPI.post("/egg-clicked");
      const { addedClick, success } = result.data;
      if (addedClick) {
        setMessage("Congrats! You found an egg.");
      } else if (success) {
        setMessage("You already found an egg today.");
      } else return console.log("ERROR getting data object");
    } catch (error) {
      console.log(error);
    }
  };

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Grid item p={3} xs={12}>
        <Typography variant="h4">Egg Hunter</Typography>
      </Grid>
      <Grid container direction="column">
        {message && (
          <Grid item p={1}>
            <Typography>{message} Come back tomorrow to find another!</Typography>
          </Grid>
        )}
        {message && <Leaderboard />}
      </Grid>
    </Grid>
  );
}
