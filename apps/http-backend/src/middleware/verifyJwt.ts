import jwt, { JwtPayload } from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import { client } from "@repo/db/client";
import { newReq } from "@repo/common/types";
export const verifyJwt = async (
  req: newReq,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers["authorization"] ?? "";

  const decoded = jwt.verify(token, JWT_SECRET);
  if (typeof decoded === "string") {
    return;
  }

  if (!decoded || !decoded.id) {
    return res.json({ success: "false", message: "authorized request" });
  }
  const user = await client.user.findFirst({
    where: {
      id: decoded.id,
    },
  });
  if (!user) {
    return res.json({ success: false, message: "failed to create user" });
  }

  req.user = user;

  next();
};
