export const getCredentials = (query) => {
  const requiredFields = ["interactiveNonce", "interactivePublicKey", "urlSlug", "visitorId"];
  const missingFields = requiredFields.filter((variable) => !query[variable]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required parameters: ${missingFields.join(", ")}`);
  }

  return {
    assetId: query.assetId,
    interactiveNonce: query.interactiveNonce,
    interactivePublicKey: query.interactivePublicKey,
    profileId: query.profileId,
    urlSlug: query.urlSlug,
    username: query.username,
    visitorId: Number(query.visitorId),
  };
};
