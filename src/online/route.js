import express from "express";

const router = express.Router();

import { getAllTeacher, getTeacher, addTeacher, editTeacher, deleteTeacher } from "./controller.js";

router.get("/get/all", getAllTeacher);
router.get("/get/:initial", getTeacher);
router.post("/add", addTeacher);
router.put("/edit/:initial", editTeacher);
router.delete("/delete/:initial", deleteTeacher);

export default router;