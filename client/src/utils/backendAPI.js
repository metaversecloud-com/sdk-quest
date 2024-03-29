import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || "";
let backendAPI = axios;

const setupBackendAPI = async (interactiveParams) => {
  backendAPI = axios.create({
    baseURL: `${BASE_URL}/api`,
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

  try {
    await backendAPI.get("/system/interactive-credentials");
    return { success: true }
  } catch (error) {
    return { success: false }
  }
};

export { backendAPI, setupBackendAPI };
