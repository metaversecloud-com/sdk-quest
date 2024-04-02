import { errorHandler, getCredentials, removeQuestItems } from "../utils/index.js";

export const handleRemoveQuestItems = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);

    await removeQuestItems(credentials)

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleRemoveQuestItems",
      message: "Error removing Quest items",
      req,
      res,
    });
  }
};
