import React, { useState } from "react";

// components
import { Button, Grid, TextField, Typography } from "@mui/material";

// context
import { fetchWorld, useGlobalDispatch, useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export function Home() {
  const [apiKey, setApiKey] = useState();
  const [urlSlug, setUrlSlug] = useState();
  const [droppedAsset, setDroppedAsset] = useState();

  // context
  const globalDispatch = useGlobalDispatch();
  const { hasInteractiveParams, selectedWorld } = useGlobalState();
  const { name } = selectedWorld;

  const handleSelectWorld = async () => {
    await fetchWorld({ apiKey, dispatch: globalDispatch, urlSlug })
      .then(() => {
        console.log("Success!");
      })
      .catch((error) => {
        console.log(error);
      });
  };

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

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={10}>
        <Grid item pb={10}>
          <Grid alignItems="center" container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">Client side example using API Key</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography>
                Enter your API Key and URL Slug to retrieve the detail of your world. Once retrieved the world will be
                saved to Global Context for easy use throughout your application!
              </Typography>
            </Grid>
            <Grid item>
              <TextField
                id="apiKeyInput"
                label="API Key"
                onChange={(event) => {
                  event.preventDefault();
                  setApiKey(event.target.value);
                }}
                sx={{ width: 320 }}
                value={apiKey}
              />
            </Grid>
            <Grid item>
              <TextField
                disabled={!apiKey}
                id="urlSlugInput"
                label="URL Slug"
                onChange={(event) => {
                  event.preventDefault();
                  setUrlSlug(event.target.value);
                }}
                value={urlSlug}
              />
            </Grid>
            <Grid item>
              <Button onClick={handleSelectWorld} variant="contained">
                Get World Details
              </Button>
            </Grid>
            {name && (
              <Grid item xs={12}>
                <Typography>You have successfully retrieved the world details for {name}!</Typography>
              </Grid>
            )}
          </Grid>
        </Grid>
        <Grid item>
          <Grid alignItems="center" container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">Server side example using interactive parameters</Typography>
            </Grid>
            <Grid item xs={12}>
              {!hasInteractiveParams ? (
                <Typography>
                  Edit an asset in your world and open the Links page in the Modify Asset drawer and add a link to your
                  website or use &quot;http://localhost:3000&quot; for testing locally. You can also add assetId,
                  interactiveNonce, interactivePublicKey, urlSlug, and visitorId directly to the URL as search
                  parameters to use this feature.
                </Typography>
              ) : (
                <Typography>Interactive parameters found, nice work!</Typography>
              )}
            </Grid>
            <Grid item>
              <Button onClick={handleGetDroppedAsset} variant="contained">
                Get Dropped Asset Details
              </Button>
            </Grid>
            {droppedAsset && (
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
