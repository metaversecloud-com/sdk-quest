import React from "react";

const GlobalStateContext = React.createContext();
const GlobalDispatchContext = React.createContext();

function globalReducer(state, action) {
  switch (action.type) {
    case "SET_INTERACTIVE_PARAMS":
      return {
        ...state,
        ...action.payload,
        hasInteractiveParams: true,
      };
    case "SET_VISITOR_INFO":
      return {
        ...state,
        visitor: action.payload.visitor,
      };
    case "SET_LEADERBOARD_DATA":
      return {
        ...state,
        leaderboardData: action.payload.leaderboardData,
      };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function GlobalProvider({ children }) {
  const [state, dispatch] = React.useReducer(globalReducer, {
    hasInteractiveParams: false,
    retrievedVisitor: false,
    urlSlug: "",
  });
  return (
    <GlobalStateContext.Provider value={state}>
      <GlobalDispatchContext.Provider value={dispatch}>{children}</GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
}

function useGlobalState() {
  const context = React.useContext(GlobalStateContext);
  if (context === undefined) {
    throw new Error("useGlobalState must be used within a GlobalProvider");
  }
  return context;
}

function useGlobalDispatch() {
  const context = React.useContext(GlobalDispatchContext);
  if (context === undefined) {
    throw new Error("useGlobalDispatch must be used within a GlobalProvider");
  }
  return context;
}

function setInteractiveParams({
  assetId,
  dispatch,
  displayName,
  interactiveNonce,
  interactivePublicKey,
  profileId,
  sceneDropId,
  uniqueName,
  urlSlug,
  username,
  visitorId,
}) {
  const isInteractiveIframe = visitorId && interactiveNonce && interactivePublicKey && assetId;
  dispatch({
    type: "SET_INTERACTIVE_PARAMS",
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
}

function setVisitorInfo({ dispatch, visitor }) {
  dispatch({
    type: "SET_VISITOR_INFO",
    payload: {
      visitor,
    },
  });
}

function setLeaderboardData({ dispatch, leaderboardData }) {
  dispatch({
    type: "SET_LEADERBOARD_DATA",
    payload: {
      leaderboardData,
    },
  });
}

export { GlobalProvider, setInteractiveParams, setLeaderboardData, setVisitorInfo, useGlobalState, useGlobalDispatch };
