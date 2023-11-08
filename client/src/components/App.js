import React, { useEffect, useState } from "react";
import { Route, Routes, useSearchParams } from "react-router-dom";

// pages
import { Error, Home, QuestItemFound } from "@pages";

// utils
import { backendAPI, getLeaderboardData, setupBackendAPI } from "@utils";

// context
import { setInteractiveParams, setLeaderboardData, setVisitorInfo, useGlobalDispatch } from "@context";

export function App() {
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);

  // context
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
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

    const setupAPI = async () => {
      await setupBackendAPI(interactiveParams);
      setHasInitBackendAPI(true);
    };
    if (!hasInitBackendAPI) setupAPI();
    else {
      getVisitor();
      getLeaderboard();
    }
  }, [globalDispatch, hasInitBackendAPI, searchParams]);

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

  const getLeaderboard = async () => {
    await getLeaderboardData({ setLeaderboardData, globalDispatch });
    setTimeout(() => getLeaderboardData({ setLeaderboardData, globalDispatch }), 1000); // Force leaderboard autosizing.  If remove this, doesn't properly size until next poll.
    setInterval(() => getLeaderboardData({ setLeaderboardData, globalDispatch }), 1000 * 10);
  };

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
