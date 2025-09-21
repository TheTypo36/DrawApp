import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { verifyJwt } from "./middleware/verifyJwt";
import { JWT_SECRET } from "@repo/backend-common/config";
import { CreateUserSchema, newReq } from "@repo/common/types";
import { client } from "@repo/db/client";
const app = express();

app.use(express.json());

app.get("/", async (req, res) => {
  res.send("<h1>hello for https server</h1>");
});

app.get("/login", async (req, res) => {
  const { email, password } = req.body;

  const existingUser = await client.user.findFirst({
    where: {
      email: email,
    },
  });
  if (!existingUser) {
    return res.json({ success: "false", message: "no user found" });
  }
  const matchPass = bcrypt.compare(existingUser.password, password);

  if (!matchPass) {
    return res.json({ success: "false", message: "password doesn't match" });
  }

  const token = jwt.sign(
    {
      id: existingUser.id,
      email: existingUser.email,
    },
    JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );

  return res.json({
    success: false,
    message: "successfully signed In",
    data: token,
  });
});
app.post("/register", async (req, res) => {
  const { email, password, name, photo } = req.body;
  const data = CreateUserSchema.safeParse(req.body);
  if (!data.success) {
    return res.json({
      success: false,
      message: "incorrect inputs",
    });
  }

  const existingUser = await client.user.findFirst({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    return res.json({
      success: "false",
      message: "user with this email already exists",
    });
  }

  const newUser = await client.user.create({
    data: {
      name: name,
      email: email,
      password: password,
      photo: photo,
    },
  });

  return res.json({ success: "true", message: "user created", data: newUser });
});
app.post("/room", verifyJwt, async (req: newReq, res) => {
  const { roomId } = req.body;
  if (!req.user || !req.user.id) {
    return res.json({ success: false, message: "unauthorized access" });
  }
  const existingRoom = await client.room.findFirst({
    where: {
      roomId: roomId,
    },
  });
  if (existingRoom) {
    return res.json({ success: "false", message: "room already exits" });
  }

  const newRoom = await client.room.create({
    data: {
      roomId: roomId,
      admin: {
        connect: { id: req.user.id },
      },
    },
  });
  return res.json({
    success: "true",
    room: newRoom,
  });
});
const PORT = 8080;
app.listen(PORT, () => {
  console.log("server is running", PORT);
});
