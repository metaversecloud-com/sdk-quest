export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_HAS_INTERACTIVE_PARAMS = "SET_HAS_INTERACTIVE_PARAMS";
export const SET_QUEST_DETAILS = "SET_QUEST_DETAILS";
export const SET_VISITOR_INFO = "SET_VISITOR_INFO";
export const SET_ERROR = "SET_ERROR";

export type InteractiveParams = {
  assetId: string;
  displayName: string;
  identityId: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  uniqueName: string;
  urlSlug: string;
  username: string;
  visitorId: string;
};

export interface InitialState {
  hasInteractiveParams?: boolean;
  questDetails?: QuestDetailsType;
  visitor?: {
    isAdmin: boolean;
    profileId: string;
  };
  visitorInventory?: { [name: string]: { id: string; icon: string; name: string } };
  badges?: {
    [name: string]: {
      id: string;
      name: string;
      icon: string;
      description: string;
    };
  };
  error?: string;
}

export type ActionType = {
  type: string;
  payload: InitialState;
};

type QuestDetailsType = {
  keyAssetId: string;
  numberAllowedToCollect: number;
  questItemImage: string;
};

export type ErrorType =
  | string
  | {
      message?: string;
      response?: { data?: { error?: { message?: string }; message?: string } };
    };
