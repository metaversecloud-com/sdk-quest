import { SET_INTERACTIVE_PARAMS, SET_KEY_ASSET_IMAGE, SET_VISITOR_INFO } from "./types";

const reducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case SET_INTERACTIVE_PARAMS:
      return {
        ...state,
        ...payload,
        hasInteractiveParams: true,
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

export { reducer };
