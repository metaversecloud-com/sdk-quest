import { User } from "../topiaInit.js";
import error from "../errors.js";

export const getUser = async (req, res) => {
  const { profileId } = req.params;
  try {
    // Doesn't require interactive nonce
    const user = await User.create({ profileId });
    // This is the primary function of the User class, so always include
    await user.fetchUserDataObject();
    if (res) res.json({ user, success: true });
    return user;
  } catch (e) {
    error("Fetching user", e, res);
  }
};

export const updateUserDataObject = async (req, res) => {
  const { dataObject } = req.body;
  const { profileId } = req.params;
  try {
    // Doesn't require interactive nonce
    const user = await User.create({ profileId });
    await user.updateDataObject(dataObject);
    if (res) res.json({ user, success: true });
  } catch (e) {
    error("Updating user object", e, res);
  }
};
