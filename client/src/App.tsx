import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

// pages
import Home from "@pages/Home";
import Error from "@pages/Error";
import QuestItemClicked from "@pages/QuestItemClicked";

// components
import { Loading } from "./components";

// context
import { GlobalDispatchContext } from "./context/GlobalContext";
import { InteractiveParams, SET_INTERACTIVE_PARAMS, SET_QUEST_DETAILS, SET_VISITOR_INFO } from "./context/types";

// utils
import { backendAPI, setupBackendAPI } from "./utils/backendAPI";

const App = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useContext(GlobalDispatchContext);

  const interactiveParams: InteractiveParams = useMemo(() => {
    return {
      assetId: searchParams.get("assetId") || "",
      displayName: searchParams.get("displayName") || "",
      interactiveNonce: searchParams.get("interactiveNonce") || "",
      interactivePublicKey: searchParams.get("interactivePublicKey") || "",
      profileId: searchParams.get("profileId") || "",
      sceneDropId: searchParams.get("sceneDropId") || "",
      uniqueName: searchParams.get("uniqueName") || "",
      urlSlug: searchParams.get("urlSlug") || "",
      username: searchParams.get("username") || "",
      visitorId: searchParams.get("visitorId") || "",
    };
  }, [searchParams]);

  const setInteractiveParams = useCallback(
    ({
      assetId,
      displayName,
      interactiveNonce,
      interactivePublicKey,
      profileId,
      sceneDropId,
      uniqueName,
      urlSlug,
      username,
      visitorId,
    }: InteractiveParams) => {
      const isInteractiveIframe = visitorId && interactiveNonce && interactivePublicKey && assetId;
      dispatch!({
        type: SET_INTERACTIVE_PARAMS,
        payload: {
          assetId,
          displayName,
          interactiveNonce,
          interactivePublicKey,
          isInteractiveIframe,
          profileId,
          sceneDropId,
          uniqueName,
          urlSlug,
          username,
          visitorId,
        },
      });
    },
    [dispatch],
  );

  const setupBackend = () => {
    setupBackendAPI(interactiveParams)
      .catch((error) => {
        console.error(error?.response?.data?.message);
        navigate("*");
      })
      .finally(() => setHasInitBackendAPI(true))
  };

  const getVisitor = () => {
    backendAPI.get("/visitor")
      .then((result) => {
        dispatch!({
          type: SET_VISITOR_INFO,
          payload: result.data.visitor,
        });
      })
      .catch((error) => {
        console.error(error?.response?.data?.message);
        navigate("*");
      })
      .finally(() => setIsLoading(false))
  };

  const getQuestDetails = () => {
    backendAPI.get("/quest")
      .then((result) => {
        dispatch!({
          type: SET_QUEST_DETAILS,
          payload: result.data,
        });
      })
      .catch((error) => {
        console.error(error?.response?.data?.message);
        navigate("*");
      })
      .finally(() => setIsLoading(false))
  };

  useEffect(() => {
    if (interactiveParams.assetId) {
      setInteractiveParams({
        ...interactiveParams,
      });
    }
  }, [interactiveParams, setInteractiveParams]);

  useEffect(() => {
    if (!hasInitBackendAPI) setupBackend();
    else {
      getVisitor();
      getQuestDetails();
    }
  }, [hasInitBackendAPI, interactiveParams]);

  if (isLoading || !hasInitBackendAPI) return <Loading />;

  return (
    <Routes>
      <Route element={<Home />} path="/" />
      <Route element={<QuestItemClicked />} path="/quest-item-clicked" />
      <Route element={<Error />} path="*" />
    </Routes>
  );
};

export default App;
