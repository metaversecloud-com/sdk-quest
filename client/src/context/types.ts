export const SET_HAS_SETUP_BACKEND = "SET_HAS_SETUP_BACKEND";
export const SET_INTERACTIVE_PARAMS = "SET_INTERACTIVE_PARAMS";
export const SET_KEY_ASSET_IMAGE = "SET_KEY_ASSET_IMAGE";
export const SET_VISITOR_INFO = "SET_VISITOR_INFO";

export type InteractiveParams = {
  assetId: string;
  displayName: string;
  interactiveNonce: string;
  interactivePublicKey: string;
  profileId: string;
  sceneDropId: string;
  uniqueName: string;
  urlSlug: string;
  username: string;
  visitorId: string;
}

export interface InitialState {
  hasInteractiveParams: boolean;
  hasSetupBackend: boolean;
  keyAssetImage: string;
  visitor: {
    isAdmin: boolean;
    profileId: string;
  };
}

export type ActionType = {
  type: string;
  payload?: any;
};