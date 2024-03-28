import React, { useCallback, useEffect, useState } from "react";

// components
import { Leaderboard } from "@components/Leaderboard";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

// context
import { useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export const QuestItemClicked = () => {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { keyAssetImage, hasInteractiveParams } = useGlobalState();

  useEffect(() => {
    if (hasInteractiveParams) handleItemAssetClicked();
    // eslint-disable-next-line
  }, [hasInteractiveParams]);

  const handleItemAssetClicked = useCallback(async () => {
    try {
      const result = await backendAPI.post("/quest-item-clicked");
      const { addedClick, numberAllowedToCollect, totalCollectedToday, success } = result.data;

      if (addedClick) {
        setCollectedText(`${totalCollectedToday}/${numberAllowedToCollect} collected today`);
        setMessage(`🎉 Congratulations! You are one step closer to completing your daily quest!`);
      } else if (success) {
        setMessage(`🎉 You have already completed your daily quest! Come back tomorrow!`);
        setCollectedText(`${numberAllowedToCollect}/${numberAllowedToCollect} collected today`);
      } else {
        console.error("ERROR getting data object");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, []);

  if (isLoading) {
    return (
      <Grid container justifyContent="center" mt={4}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Grid item p={3} paddingBottom={0} paddingTop={0} xs={12}>
        {keyAssetImage ? <img alt="Find me" src={keyAssetImage} /> : <div />}
      </Grid>
      <Grid item p={3} xs={12}>
        <h1>Quest</h1>
      </Grid>
      <Grid container direction="column">
        {message && (
          <Grid item p={1} paddingTop={0}>
            <p>{message}</p>
          </Grid>
        )}
        {collectedText && (
          <Grid item p={1} paddingBottom={2} paddingTop={0}>
            <p>{collectedText}</p>
          </Grid>
        )}
      </Grid>
      <Leaderboard isKeyAsset={false} keyAssetImage={keyAssetImage} />
    </Grid>
  );
};
