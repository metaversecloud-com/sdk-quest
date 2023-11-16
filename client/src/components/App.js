import React, { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";

import { CircularProgress } from "@mui/material";

// pages
import { Error, Home, QuestItemFound } from "@pages";

// utils
import { backendAPI, setupBackendAPI } from "@utils";

// context
import { setInteractiveParams, setVisitorInfo, useGlobalDispatch } from "@context";

export function App() {
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);

  // context
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    if (!hasInitBackendAPI) {
      setupAPI();
    } else {
      getVisitor();
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

  if (!hasInitBackendAPI) return <CircularProgress />;

  return (
    <Routes>
      <Route element={<Home />} exact path="/" />
      <Route element={<QuestItemFound />} path="/egg-clicked" />
      <Route element={<QuestItemFound />} path="/quest-item-clicked" />
      <Route element={<Error />} path="*" />
    </Routes>
  );
}

export default App;
