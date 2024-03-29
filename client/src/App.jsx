import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Route, Routes, useNavigate, useSearchParams } from "react-router-dom";

// pages
import { Home } from "@pages/Home";
import { Error } from "@pages/Error";
import { QuestItemClicked } from "@pages/QuestItemClicked";

// components
import { Loading } from "@components/Loading";

// context
import { GlobalDispatchContext } from "@context/GlobalContext";
import { SET_INTERACTIVE_PARAMS, SET_VISITOR_INFO } from "@context/types";

// utils
import { backendAPI, setupBackendAPI } from "@utils/backendAPI";

const App = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasInitBackendAPI, setHasInitBackendAPI] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const dispatch = useContext(GlobalDispatchContext);

  const interactiveParams = useMemo(() => {
    return {
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
    }) => {
      const isInteractiveIframe = visitorId && interactiveNonce && interactivePublicKey && assetId;
      dispatch({
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

  const setupBackend = async () => {
    const setupResult = await setupBackendAPI(interactiveParams);
    if (!setupResult.success) navigate("*");
    else setHasInitBackendAPI(true);
  };

  const getVisitor = async () => {
    const result = await backendAPI.get("/visitor");
    if (result.data.success) {
      dispatch({
        type: SET_VISITOR_INFO,
        payload: result.data.visitor,
      });
      setIsLoading(false)
    } else {
      console.error("Error getting visitor");
    }
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
    else getVisitor();
  }, [hasInitBackendAPI, interactiveParams]);

  if (isLoading || !setHasInitBackendAPI) return <Loading />;

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route element={<QuestItemClicked />} path="/quest-item-clicked" />
      <Route path="*" element={<Error />} />
    </Routes>
  );
};

export default App;
