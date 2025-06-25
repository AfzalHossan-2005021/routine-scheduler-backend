import express from "express";
import {
  getAllSchedule,
  getCurrStatus,
  getSessionalScheduleAPI,
  getTheoryScheduleAPI,
  initiate,
  roomContradiction,
  setSessionalScheduleAPI,
  setTheoryScheduleAPI,
  teacherContradiction,
  getCourseAllScheduleAPI,
  getCourseSectionalScheduleAPI,
  getDepartmentalSessionalScheduleAPI
} from "./controller.js";

const router = express.Router();

router.get("/theory/:batch/:section", getTheoryScheduleAPI);
router.post("/theory/:batch/:section/:course", setTheoryScheduleAPI);

router.get("/sessional/:batch/:section", getSessionalScheduleAPI);
router.get("/sessional/departmental", getDepartmentalSessionalScheduleAPI);
router.post("/sessional/:batch/:section/:department", setSessionalScheduleAPI);

router.get("/all", getAllSchedule)
router.get("/contradiction/room/:batch/:section/:course_id", roomContradiction)
router.get("/contradiction/teacher/:batch/:section/:course_id", teacherContradiction)

router.get("/theory/initiate", initiate);
router.get("/theory/status", getCurrStatus);
router.get("/:course_id", getCourseAllScheduleAPI);
router.get("/:course_id/:section", getCourseSectionalScheduleAPI);
// router.get("/theory/finalize", null);

export default router;
