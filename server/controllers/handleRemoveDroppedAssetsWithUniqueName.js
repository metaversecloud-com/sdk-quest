import { errorHandler, getCredentials, removeDroppedAssetsWithUniqueName } from "../utils/index.js";

export const handleRemoveDroppedAssetsWithUniqueName = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);

    await removeDroppedAssetsWithUniqueName(credentials)

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveDroppedAssetsWithUniqueName",
      message: "Error removing dropped asset by uniqueName",
      req,
      res,
    });
  }
};
