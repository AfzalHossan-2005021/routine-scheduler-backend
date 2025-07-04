import express from "express";
import { generatePDF, uploadPDF,teacherPDF,roomPDF,serveLvlTermPDF,getAllInitial,serveTeacherPDF,serveRoomPDF,getAllIRooms, getAllLevelTerm, generateAllLevelTermPDFs, generateAllTeacherPDFs, generateAllRoomPDFs, serveAllLevelTermsPDF, serveAllTeachersPDF, serveAllRoomsPDF} from "./controller.js";

const router = express.Router();

router.get("/generate/:lvlTerm", generatePDF);
router.get("/generateTeacher/:initial",teacherPDF);
router.get("/generateRoom/:room", roomPDF);
router.get("/generateAllLevelTerms", generateAllLevelTermPDFs);
router.get("/generateAllTeachers", generateAllTeacherPDFs);
router.get("/generateAllRooms", generateAllRoomPDFs);
router.get("/upload", uploadPDF);


router.get("/showTerm/:lvlTerm/:section",serveLvlTermPDF);
router.get("/showTeacher/:initial",serveTeacherPDF);
router.get("/showRoom/:room",serveRoomPDF);
router.get("/showAllLevelTerms",serveAllLevelTermsPDF);
router.get("/showAllTeachers",serveAllTeachersPDF);
router.get("/showAllRooms",serveAllRoomsPDF);



router.get("/allInitial", getAllInitial);
router.get("/allRooms", getAllIRooms);
router.get("/allLevelTerm", getAllLevelTerm);


export default router;