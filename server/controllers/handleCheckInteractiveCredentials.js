import { errorHandler, User } from "../utils/index.js";

export const handleCheckInteractiveCredentials = async (req, res) => {
  try {
    const { interactiveNonce, interactivePublicKey, urlSlug, visitorId } = req.query;
    const credentials = {
      interactiveNonce,
      interactivePublicKey,
      urlSlug,
      visitorId,
    };

    if (process.env.INTERACTIVE_KEY !== credentials.interactivePublicKey) throw "Provided public key does not match";

    // if key matches proceed with check using jwt created by topiaInit
    const user = User.create({ credentials: { interactiveNonce, interactivePublicKey, urlSlug, visitorId } });
    await user.checkInteractiveCredentials();

    return res.json({ success: true });
  } catch (error) {
    return errorHandler({
      error,
      functionName: "handleCheckInteractiveCredentials",
      message: "Invalid credentials",
      req,
      res,
    });
  }
};
