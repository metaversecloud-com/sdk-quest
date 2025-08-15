import {
  ActionType,
  InitialState,
  SET_ERROR,
  SET_HAS_INTERACTIVE_PARAMS,
  SET_QUEST_DETAILS,
  SET_VISITOR_INFO,
} from "./types";

const globalReducer = (state: InitialState, action: ActionType) => {
  const { type, payload } = action;
  switch (type) {
    case SET_HAS_INTERACTIVE_PARAMS:
      return {
        ...state,
        hasInteractiveParams: payload.hasInteractiveParams,
      };
    case SET_QUEST_DETAILS:
      return {
        ...state,
        questDetails: payload.questDetails,
      };
    case SET_VISITOR_INFO:
      return {
        ...state,
        visitor: payload.visitor,
      };
    case SET_ERROR:
      return {
        ...state,
        error: payload?.error,
      };
    default: {
      throw new Error(`Unhandled action type: ${type}`);
    }
  }
};

export { globalReducer };
