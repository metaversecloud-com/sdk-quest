import React, { useCallback, useEffect, useState } from "react";

// components
import { Layout } from "@components";
import { Grid, Typography } from "@mui/material";

// context
import { useGlobalDispatch, useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export function QuestItemFound() {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const globalDispatch = useGlobalDispatch();
  const { hasInteractiveParams } = useGlobalState();

  useEffect(() => {
    if (hasInteractiveParams) handleItemAssetClicked();
    if (isLoading) setIsLoading(false);
    // eslint-disable-next-line
  }, [hasInteractiveParams]);

  const handleItemAssetClicked = useCallback(async () => {
    try {
      const result = await backendAPI.post("/quest-item-clicked");
      const { addedClick, numberAllowedToCollect, numberCollected, success } = result.data;

      if (addedClick) {
        setCollectedText(`${numberCollected}/${numberAllowedToCollect} collected today`);
        setMessage(`🎉 Congratulations! You are one step closer to completing your daily quest!`);
      } else if (success) {
        setMessage(`🎉 You have already completed your daily quest! Come back tomorrow!`);
        setCollectedText(`${numberAllowedToCollect}/${numberAllowedToCollect} collected today`);
      } else {
        return console.log("ERROR getting data object");
      }
    } catch (error) {
      console.log(error);
    }
  }, [globalDispatch]);

  if (isLoading) return <div />;

  if (!hasInteractiveParams) {
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;
  }

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Layout>
        <Grid container direction="column">
          {message && (
            <Grid item p={1} paddingTop={0}>
              <Typography>{message}</Typography>
            </Grid>
          )}
          {collectedText && (
            <Grid item p={1} paddingBottom={2} paddingTop={0}>
              <Typography>{collectedText}</Typography>
            </Grid>
          )}
        </Grid>
      </Layout>
    </Grid>
  );
}
