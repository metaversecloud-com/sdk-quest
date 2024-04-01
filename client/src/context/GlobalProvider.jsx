import { useReducer } from "react";
import { reducer } from "./reducer";
import GlobalState from "./GlobalState";

const initialState = {
  hasInteractiveParams: false,
  hasSetupBackend: false,
  keyAssetImage: "",
  visitor: {},
};

const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <GlobalState initialState={state} dispatch={dispatch}>
      {children}
    </GlobalState>
  );
};

export default GlobalProvider;
