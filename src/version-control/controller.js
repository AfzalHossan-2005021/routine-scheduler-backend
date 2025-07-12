import * as repository from './repository.js';

export const getVersions = async (req, res, next) => {
    try {
        const versions = await repository.listVersions();
        res.json(versions);
    } catch (error) {
        next(error);
    }
};

export const saveVersion = async (req, res, next) => {
    try {
        const { versionName } = req.body;
        await repository.createBackup(versionName);
        res.status(201).json({ message: `Version '${versionName}' saved successfully.` });
    } catch (error) {
        next(error);
    }
};

export const loadVersion = async (req, res, next) => {
    try {
        const { filename } = req.params;
        await repository.restoreBackup(filename);
        res.json({ message: `Version '${filename}' loaded successfully.` });
    } catch (error) {
        next(error);
    }
};

export const deleteVersion = async (req, res, next) => {
    try {
        const { filename } = req.params;
        await repository.deleteBackup(filename);
        res.json({ message: `Version '${filename}' deleted successfully.` });
    } catch (error) {
        next(error);
    }
};
