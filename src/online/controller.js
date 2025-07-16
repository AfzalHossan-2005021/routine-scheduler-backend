import { getAll } from "./repository.js";


export async function getAllTeacher(req, res, next) {
    try {
        const teachers = await getAll();
        res.status(200).json(teachers);
    } catch(err) {
        next(err)
    }
}