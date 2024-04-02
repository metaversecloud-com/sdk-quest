import { errorHandler, getCredentials, getVisitor } from "../utils/index.js";

export const handleGetVisitor = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);
    const { urlSlug, visitorId } = credentials;
    const visitor = await getVisitor({
      credentials,
      urlSlug,
      visitorId,
    });
    return res.json({ visitor, success: true });
  } catch (error) {
    return errorHandler({ error, functionName: "handleGetVisitor", message: "Error getting visitor", req, res });
  }
};
