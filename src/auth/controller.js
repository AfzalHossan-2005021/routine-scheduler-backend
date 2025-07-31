import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  adminExistsEmail,
  findAdminDB as findAdminUsingUsername,
  registerAdminDB,
  updateEmailDB,
} from "./repository.js";
import { HttpError } from "../config/error-handle.js";

const secret = process.env.SECRET || "default-secret";
const saltRounds = 10;

export async function authenticate(req, res, next) {
  try {
    const admin = await findAdminUsingUsername(req.body.username);
    const result = await bcrypt.compare(req.body.password, admin.password);

    if (result) {
      const token = jwt.sign({ username: admin.username }, secret, {
        expiresIn: "2 days",
      });

      const { password, ...user } = admin;

      res.status(200).json({ message: "Logged in!", user, token });
    } else {
      throw new HttpError(401, "username or password is incorrect!");
    }
  } catch (error) {
    next(error);
  }
}

export async function forgetPassReq(req, res, next) {
  const email = req.body.email;
  if (await adminExistsEmail(email)) {
    // TODO: send email with reset link
    res.status(200).json({ message: "Check your email for the reset link!" });
  } else {
    throw new HttpError(404, "Email not found!");
  }
}

export async function register(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;

  try {
    const hash = await bcrypt.hash(password, saltRounds);
    if (await adminExistsEmail(email)) {
      throw new HttpError(400, "Email already exists!");
    }
    const result = await registerAdminDB(username, hash, email);
    if (result) {
      const token = jwt.sign({ username }, secret, {
        expiresIn: "2 days",
      });
      res.status(201).json({
        success: true,
        user: { username, email },
        token: token
      });
    }
  } catch (error) {
    next(error);
  }
}

export async function updateEmail(req, res, next) {
  var username = req.username;
  var email = req.body.email;
  try {
    await updateEmailDB(email, username);
    res
      .status(200)
      .json({ message: "update successfull!", username: username });
  } catch (error) {
    next(error);
  }
}
