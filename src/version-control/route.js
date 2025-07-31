import express from 'express';
import { body } from 'express-validator';
import * as controller from './controller.js';
// CORRECTED IMPORT PATH
import validate from '../config/validation.js';

const router = express.Router();

// GET /v1/versions/
router.get('/', controller.getVersions);

// POST /v1/versions/save
router.post(
    '/save',
    validate([
        body('versionName')
            .notEmpty().withMessage('Version name cannot be empty.')
            .isString()
            .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('Version name can only contain letters, numbers, underscores, and hyphens.')
    ]),
    controller.saveVersion
);

// POST /v1/versions/load/:filename
router.post('/load/:filename', controller.loadVersion);

// DELETE /v1/versions/:filename
router.delete('/:filename', controller.deleteVersion);

export default router;
