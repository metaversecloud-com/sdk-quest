import { getKeyAssetImage } from "../utils/index.js";

export const handleGetKeyAssetImage = async (req, res) => {
  try {
    const { urlSlug } = req.query;
    const keyAssetImage = getKeyAssetImage(urlSlug);
    res.json({ keyAssetImage, success: true });
  } catch (e) {
    error("Fetching dropped assets with unique name", e, res);
  }
};
