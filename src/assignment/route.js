import express from "express";

const router = express.Router();

import {
  sendTheoryPrefMail,
  getCurrStatus,
  setCurrStatus,
  finalizeTheoryPreference,
  getLabRoomAssignment,
  setLabRoomAssignemnt,
  getTeacherAssignment,
  getTeacherTheoryAssigmentsAPI,
  sendSessionalPrefMail,
  getSessionalCurrStatus,
  getTeacherSessionalAssignmentAPI,
  getSessionalTeachersAPI,
  getAllSessionalAssignmentAPI,
  finalizeSessionalPreference,
  setTeacherAssignment,
  setTeacherSessionalAssignment,
  saveReorderedTeacherPreference,
  resendTheoryPrefMail,
  resendSessionalPrefMail
} from "./controller.js";

router.get("/theory/initiate", sendTheoryPrefMail);
router.get("/theory/status", getCurrStatus);
router.put("/theory/status", setCurrStatus);
router.get("/theory/resend/:initial", resendTheoryPrefMail);
router.get("/theory/finalize", finalizeTheoryPreference);
router.put("/theory/set", setTeacherAssignment);
router.post("/theory/save-preference", saveReorderedTeacherPreference);

router.get("/sessional/initiate", sendSessionalPrefMail);
router.get("/sessional/status", getSessionalCurrStatus);
router.get("/sessional/all", getAllSessionalAssignmentAPI);
router.get("/sessional/teachers/:course_id/:section", getSessionalTeachersAPI);
router.get("/sessional/resend/:initial", resendSessionalPrefMail);
router.get("/sessional/finalize", finalizeSessionalPreference);
router.get("/sessional/:initial", getTeacherSessionalAssignmentAPI);
router.put("/sessional/set", setTeacherSessionalAssignment);

router.get("/theory/all", getTeacherAssignment);
router.get("/theory/:initial", getTeacherTheoryAssigmentsAPI);

router.get("/room/status", getLabRoomAssignment);
router.post("/room/assign", setLabRoomAssignemnt);

export default router;
