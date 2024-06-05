import { VisitorInterface } from "@rtsdk/topia";
import { Visitor } from "../topiaInit.js";
import { errorHandler } from "../errorHandler.js";
import { Credentials } from "../../types/Credentials.js";

export const getVisitor = async (credentials: Credentials) => {
  try {
    const { profileId, urlSlug, visitorId } = credentials;

    const visitor: VisitorInterface = await Visitor.get(visitorId, urlSlug, { credentials });

    if (!visitor || !visitor.username) throw "Not in world";

    return { isAdmin: visitor.isAdmin, profileId };
  } catch (error) {
    return errorHandler({
      error,
      functionName: "getVisitor",
      message: "Error getting visitor",
    });
  }
};
