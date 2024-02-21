import React, { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";

// components
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

// pages
import { Error, Home, QuestItemClicked } from "@pages";

// utils
import { backendAPI, setupBackendAPI } from "@utils";

// context
import { setInteractiveParams, setVisitorInfo, useGlobalDispatch, useGlobalState } from "@context";

export const App = () => {
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // context
  const globalDispatch = useGlobalDispatch();
  const { hasInteractiveParams } = useGlobalState();

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

  if (!hasInteractiveParams) {
    return <h5>You can only access this application from within a Topia world embed.</h5>;
  }

  return (
    <Routes>
      <Route element={<Home />} exact path="/" />
      <Route element={<QuestItemClicked />} path="/quest-item-clicked" />
      <Route element={<Error />} path="*" />
    </Routes>
  );
};

export default App;
