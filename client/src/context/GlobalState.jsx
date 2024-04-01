import { GlobalDispatchContext, GlobalStateContext } from "./GlobalContext";

const GlobalState = (props) => {
  const { dispatch, initialState } = props;
  return (
    <GlobalStateContext.Provider value={initialState}>
      <GlobalDispatchContext.Provider value={dispatch}>{props.children}</GlobalDispatchContext.Provider>
    </GlobalStateContext.Provider>
  );
};

export default GlobalState;
