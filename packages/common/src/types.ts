import { z } from "zod";
import type { Request } from "express";

export const CreateUserSchema = z.object({
  email: z.string(),
  name: z.string().min(3).max(20),
  password: z.string(),
  photo: z.string(),
});

export const SignInSchema = z.object({
  email: z.string(),

  password: z.string(),
});

export const createRoomSchema = z.object({
  roomId: z.string().min(3).max(20),
});

export type userType = Omit<z.infer<typeof CreateUserSchema>, "password"> & {
  id: string;
};
export interface newReq extends Request {
  user?: userType;
}
