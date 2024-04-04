import { Request, Response } from "express";
import { errorHandler, getVisitor, getCredentials } from "../../utils/index.js"

export const handleGetVisitor = async (req: Request, res: Response): Promise<Record<string, any> | void> => {
  try {
    const credentials = getCredentials(req.query);
    const visitor = await getVisitor(credentials);

    return res.json({ visitor });
  } catch (error) {
    return errorHandler({ error, functionName: "handleGetVisitor", message: "Error getting visitor", req, res });
  }
};
