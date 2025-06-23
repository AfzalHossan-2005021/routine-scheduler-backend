import {
    getAll,
    updateLevelTerms,
    initiateDB,
    getAllActiveDepartments,
    getDepartmentalLevelTermBatches
} from "./repository.js"

export async function getAllLevelTerms(req, res, next){
    const level_terms = await getAll();
    res.json({message: "Level Terms retrieved successfully", data: level_terms});
}

export async function setLevelTerms(req, res, next) {
    try {
        const levelTerms = req.body;
        await updateLevelTerms(levelTerms);
        await initiateDB(levelTerms);
        res.json({ message: "Initiated successfully" });
    } catch (error) {
        next(error);
    }
}

export async function getAllActiveDepartmentsAPI(req, res, next) {
    try {
        const departments = await getAllActiveDepartments();
        res.json({ message: "Active departments retrieved successfully", data: departments });
    } catch (error) {
        next(error);
    }
}

export async function getDepartmentalLevelTermBatchesAPI(req, res, next) {
    try {
        const department = req.params["department"];
        if (!department) {
            return res.status(400).json({ message: "Department is required" });
        }
        const levelTerms = await getDepartmentalLevelTermBatches(department);
        res.json({ message: "Departmental level term batches retrieved successfully", data: levelTerms });
    } catch (error) {
        next(error);
    }
}