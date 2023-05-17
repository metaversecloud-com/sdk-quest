import React, { useCallback, useEffect, useState } from "react";
import { Leaderboard } from "../../components";

// components
import { Grid, Typography } from "@mui/material";

// context
import {
  // fetchWorld,
  setLeaderboardData,
  useGlobalDispatch,
  useGlobalState,
} from "@context";

import { getLeaderboardData } from "@utils/leaderboard";

import { backendAPI } from "@utils";

export function EggClicked() {
  const [message, setMessage] = useState("");
  const {
    hasInteractiveParams,
    // selectedWorld
  } = useGlobalState();

  // context
  const globalDispatch = useGlobalDispatch();

  const handleEggClicked = useCallback(async () => {
    try {
      const result = await backendAPI.post("/egg-clicked");
      const { addedClick, numberAllowedToCollect, numberCollected, success } = result.data;
      if (addedClick) {
        let numString = "";
        switch (numberCollected) {
          case 1:
            numString = "first";
            break;
          case 2:
            numString = "second";
            break;
          case 3:
            numString = "third";
            break;
          default:
            numString = "";
        }
        setMessage(
          `You just found a ${numString} egg. ${
            numberCollected === numberAllowedToCollect
              ? "Help your friends find theirs and come find more tomorrow!"
              : `Go find ${numberAllowedToCollect - numberCollected} more!`
          }`,
        );
        // Refresh the leaderboard
        getLeaderboardData({ setLeaderboardData, globalDispatch });
      } else if (success) {
        setMessage(
          `You already found ${numberAllowedToCollect} ${
            numberAllowedToCollect === 1 ? "egg" : "eggs"
          } today. Help your friends find theirs and come find more tomorrow!`,
        );
      } else return console.log("ERROR getting data object");
    } catch (error) {
      console.log(error);
    }
  }, [globalDispatch]);

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) handleEggClicked();
  }, [hasInteractiveParams, handleEggClicked]);

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
            <Typography>{message}</Typography>
          </Grid>
        )}
        {message && <Leaderboard />}
      </Grid>
    </Grid>
  );
}
