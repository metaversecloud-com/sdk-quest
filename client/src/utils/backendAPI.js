import axios from 'axios';

let backendAPI = axios;

const setupBackendAPI = async (interactiveParams) => {
  backendAPI = axios.create({
    baseURL: "/api",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (interactiveParams.interactiveNonce) {
    backendAPI.interceptors.request.use((config) => {
      if (!config?.params) config.params = {};
      config.params = { ...config.params };
      config.params["assetId"] = interactiveParams.assetId;
      config.params["displayName"] = interactiveParams.displayName;
      config.params["interactiveNonce"] = interactiveParams.interactiveNonce;
      config.params["interactivePublicKey"] = interactiveParams.interactivePublicKey;
      config.params["profileId"] = interactiveParams.profileId;
      config.params["sceneDropId"] = interactiveParams.sceneDropId;
      config.params["uniqueName"] = interactiveParams.uniqueName;
      config.params["urlSlug"] = interactiveParams.urlSlug;
      config.params["username"] = interactiveParams.username;
      config.params["visitorId"] = interactiveParams.visitorId;
      return config;
    });
  }
};

export { backendAPI, setupBackendAPI };
