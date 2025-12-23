import { NextFunction, Request, Response } from "express";
import { decode, verify } from "jsonwebtoken";
import { isDev, sendErrorResponse } from "../utility";

export function checkAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers?.authorization?.replace("Bearer ", "");
  try {
    if (isDev()) {
      console.log("TOKEN ===> ", token);
    }
    const payload = verify(token ?? "", process.env.SECRET ?? "");
    if (payload) {
      (req as any).user = decode(token ?? "");
      return next();
    }
  } catch (error) {
    return sendErrorResponse(res, "Authentication error");
  }
}

export function checkAuthAndReturn(token: string): any {
  try {
    if (isDev()) {
      console.log("TOKEN ===> ", token);
    }
    const payload = verify(token ?? "", process.env.SECRET ?? "");
    if (payload) {
      return decode(token ?? "");
    }
    return null;
  } catch (error) {
    return null;
  }
}
