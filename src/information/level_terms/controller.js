import {
    getAll,
    updateLevelTerms,
    initiateDB,
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