import express from 'express'
const roomRouter = express.Router();

import {getAllRoom,addRoom,editRoom,deleteRoom,getLabRooms,getNonDeptLabRooms} from "./controller.js"
import validate from "../../config/validation.js";
import {body} from 'express-validator'

roomRouter.get("/",getAllRoom)

roomRouter.post("/",validate([
    body('room').notEmpty(),
    body('type').isNumeric().notEmpty(),
]),addRoom)
roomRouter.put("/:room",body('type').isNumeric().notEmpty(),editRoom)


roomRouter.delete("/:room",deleteRoom)


roomRouter.get("/labs",getLabRooms)
roomRouter.get("/labs/non_dept", getNonDeptLabRooms)


export default roomRouter;