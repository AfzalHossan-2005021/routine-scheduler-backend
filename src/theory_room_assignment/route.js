import express from 'express'

const router = express.Router();

import {
    getAllTheoryRoomAssignmentAPI,
    updateTheoryRoomAssignmentAPI,
    getAllSectionRoomAllocationAPI,
    updateSectionRoomAllocationAPI
} from './controller.js';

router.get("/get/all", getAllTheoryRoomAssignmentAPI);
router.post("/update", updateTheoryRoomAssignmentAPI);

router.get("/section/get/all", getAllSectionRoomAllocationAPI);
router.put("/section/update", updateSectionRoomAllocationAPI);




export default router;