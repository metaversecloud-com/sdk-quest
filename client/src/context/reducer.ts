import { ActionType, InitialState, SET_INTERACTIVE_PARAMS, SET_QUEST_DETAILS, SET_VISITOR_INFO } from "./types";

const globalReducer = (state: InitialState, action: ActionType) => {
  const { type, payload } = action;
  switch (type) {
    case SET_INTERACTIVE_PARAMS:
      return {
        ...state,
        ...payload,
        hasInteractiveParams: true,
      };
    case SET_QUEST_DETAILS:
      return {
        ...state,
        questDetails: payload,
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
