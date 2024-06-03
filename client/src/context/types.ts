export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_QUEST_DETAILS = "SET_QUEST_DETAILS";
export const SET_VISITOR_INFO = "SET_VISITOR_INFO";

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
  hasInteractiveParams: boolean;
  questDetails: {
    itemsCollectedByUser: {
      [key: string]: {
        currentStreak: number;
        lastCollectedDate: Date;
        longestStreak: number;
        total: number;
        totalCollectedToday: number;
        username: string;
      };
    };
    keyAssetId: string;
    lastInteractionDate: Date;
    numberAllowedToCollect: number;
    sceneDropId: string;
    totalItemsCollected: number;
    questItemImage: string;
  };
  visitor: {
    isAdmin: boolean;
    profileId: string;
  };
}

export type ActionType = {
  type: string;
  payload?: {
    assetId?: string;
    displayName?: string;
    identityId?: string;
    interactiveNonce?: string;
    interactivePublicKey?: string;
    isInteractiveIframe?: string;
    numberAllowedToCollect?: number;
    profileId?: string;
    questItemImage?: string;
    sceneDropId?: string;
    uniqueName?: string;
    urlSlug?: string;
    username?: string;
    visitorId?: string;
  };
};
