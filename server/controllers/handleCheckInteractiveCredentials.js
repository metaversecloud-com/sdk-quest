import { errorHandler, getCredentials, User } from "../utils/index.js";

export const handleCheckInteractiveCredentials = async (req, res) => {
  try {
    const credentials = getCredentials(req.query);

    if (process.env.INTERACTIVE_KEY !== credentials.interactivePublicKey) throw "Provided public key does not match";

    const user = User.create({ credentials });
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
