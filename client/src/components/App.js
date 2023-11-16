import React, { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";

// components
import { CircularProgress, Grid } from "@mui/material";

// pages
import { Error, Home, QuestItemClicked } from "@pages";

// utils
import { backendAPI, setupBackendAPI } from "@utils";

// context
import { setInteractiveParams, setVisitorInfo, useGlobalDispatch } from "@context";

export function App() {
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // context
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    if (!hasInitBackendAPI) {
      setupAPI();
    } else {
      getVisitor();
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [hasInitBackendAPI, searchParams]);

  const setupAPI = async () => {
    const interactiveParams = {
      assetId: searchParams.get("assetId"),
      displayName: searchParams.get("displayName"),
      interactiveNonce: searchParams.get("interactiveNonce"),
      interactivePublicKey: searchParams.get("interactivePublicKey"),
      profileId: searchParams.get("profileId"),
      sceneDropId: searchParams.get("sceneDropId"),
      uniqueName: searchParams.get("uniqueName"),
      urlSlug: searchParams.get("urlSlug"),
      username: searchParams.get("username"),
      visitorId: searchParams.get("visitorId"),
    };

    if (interactiveParams.assetId) {
      setInteractiveParams({
        dispatch: globalDispatch,
        ...interactiveParams,
      });
    }

    await setupBackendAPI(interactiveParams);
    setHasInitBackendAPI(true);
  };

  const getVisitor = async () => {
    const result = await backendAPI.get("/visitor");
    if (result.data.success) {
      setVisitorInfo({
        dispatch: globalDispatch,
        visitor: result.data.visitor,
      });
    } else {
      console.log("Error getting visitor");
    }
  };

  if (!hasInitBackendAPI || isLoading) {
    return (
      <Grid container justifyContent="center" mt={4}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Routes>
      <Route element={<Home />} exact path="/" />
      <Route element={<QuestItemClicked />} path="/quest-item-clicked" />
      <Route element={<Error />} path="*" />
    </Routes>
  );
}

export default App;
