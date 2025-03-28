import express from 'express'

const router = express.Router();

import { getAllLevelTerms, setLevelTerms } from './controller.js';

router.get("/", getAllLevelTerms);
router.put("/set", setLevelTerms)

export default router;

