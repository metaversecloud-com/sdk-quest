import { ActionType, InitialState, SET_HAS_SETUP_BACKEND, SET_INTERACTIVE_PARAMS, SET_KEY_ASSET_IMAGE, SET_VISITOR_INFO } from "./types";

const globalReducer = (state: InitialState, action: ActionType) => {
  const { type, payload } = action;
  switch (type) {
    case SET_INTERACTIVE_PARAMS:
      return {
        ...state,
        ...payload,
        hasInteractiveParams: true,
      };
    case SET_HAS_SETUP_BACKEND:
      return {
        ...state,
        ...payload,
        hasSetupBackend: true,
      };
    case SET_KEY_ASSET_IMAGE:
      return {
        ...state,
        keyAssetImage: payload,
      };
    case SET_VISITOR_INFO:
      return {
        ...state,
        visitor: payload,
      };
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
};

export { globalReducer };
