import express from "express";

const router = express.Router();

import { getAllTeacher } from "./controller.js";

router.get("/get/all", getAllTeacher);

export default router;