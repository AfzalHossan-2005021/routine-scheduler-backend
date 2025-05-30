import express from "express";

const router = express.Router();

import {
  sendTheoryPrefMail,
  getCurrStatus,
  finalizeTheoryPreference,
  getLabRoomAssignment,
  setLabRoomAssignemnt,
  getTeacherAssignment,
  sendSessionalPrefMail,
  getSessionalCurrStatus,
  finalizeSessionalPreference,
  setTeacherAssignment,
  setTeacherSessionalAssignment,
  saveReorderedTeacherPreference,
  resendTheoryPrefMail,
  resendSessionalPrefMail
} from "./controller.js";

router.get("/theory/initiate", sendTheoryPrefMail);
router.get("/theory/status", getCurrStatus);
router.get("/theory/resend/:initial", resendTheoryPrefMail);
router.get("/theory/finalize", finalizeTheoryPreference);
router.put("/theory/set", setTeacherAssignment);
router.post("/theory/save-preference", saveReorderedTeacherPreference);

router.get("/sessional/initiate", sendSessionalPrefMail);
router.get("/sessional/status", getSessionalCurrStatus);
router.get("/sessional/resend/:initial", resendSessionalPrefMail);
router.get("/sessional/finalize", finalizeSessionalPreference);
router.put("/sessional/set", setTeacherSessionalAssignment);

router.get("/theory/all", getTeacherAssignment);

router.get("/room/status", getLabRoomAssignment);
router.post("/room/assign", setLabRoomAssignemnt);

export default router;
