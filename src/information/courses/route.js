
import express from 'express'

const router = express.Router();

import {  getAllCourse , addCourse , editCourse, deleteCourse, getLabCourses, getNonDeptLabCourses, getSessionalCoursesByDeptLevelTermAPI } from './controller.js';
import validate from "../../config/validation.js";
import {body} from 'express-validator'

router.get("/", getAllCourse)
// router.get("/:initial", getCourse)

router.post("/",addCourse)
router.put("/:course_id",editCourse)
router.delete("/:course_id",deleteCourse)

router.get("/labs",getLabCourses)
router.get("/labs/non_dept", getNonDeptLabCourses)
router.get("/labs/:department/:level_term", getSessionalCoursesByDeptLevelTermAPI)


export default router;