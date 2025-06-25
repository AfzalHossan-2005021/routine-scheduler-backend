import {
  getAll,
  saveCourse,
  updateCourse,
  removeCourse,
  getAllLab,
  getNonDeptLabs,
  getNonDeptTheories,
  getSessionalCoursesByDeptLevelTerm,
  getTheoryCoursesByDeptLevelTerm
} from "./repository.js";

export async function getAllCourse(req, res, next) {
  try {
    const Courses = await getAll();
    res.status(200).json(Courses);
  } catch (err) {
    next(err);
  }
}

export async function addCourse(req, res, next) {
  const course_id = req.body.course_id;
  const name = req.body.name;
  const type = req.body.type;
  const session = req.body.session;
  const class_per_week = req.body.class_per_week;
  const batch = req.body.batch;
  const sections = req.body.sections;
  const teacher_credit = req.body.teacher_credit;
  const from = req.body.from;
  const to = req.body.to;
  const level_term = req.body.level_term;

  const Course = {
    course_id: course_id,
    name: name,
    type: type,
    session: session,
    class_per_week: class_per_week,
    batch: batch,
    sections: sections,
    teacher_credit: teacher_credit,
    from: from,
    to: to,
    level_term: level_term
  };

  try {
    const rowCount = await saveCourse(Course);
    res.status(200).json({ message: "Successfully Saved" });
  } catch (err) {
    next(err);
  }
}

export async function editCourse(req, res, next) {
  const course_id_old = req.params["course_id"];

  const course_id = req.body.course_id;
  const name = req.body.name;
  const type = req.body.type;
  const session = req.body.session;
  const class_per_week = req.body.class_per_week;
  const batch = req.body.batch;
  const sections = req.body.sections;
  const teacher_credit = req.body.teacher_credit;
  const from = req.body.from;
  const to = req.body.to;
  const level_term = req.body.level_term;

  const Course = {
    course_id_old: course_id_old,
    course_id: course_id,
    name: name,
    type: type,
    session: session,
    class_per_week: class_per_week,
    batch: batch,
    sections: sections,
    teacher_credit: teacher_credit,
    from: from,
    to: to,
    level_term: level_term
  };

  try {
    const rowCount = await updateCourse(Course);
    res.status(200).json({ Course: Course });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req, res, next) {
  const course_id = req.params["course_id"];
  try {
    const rowCount = await removeCourse(course_id);
    res.status(200).json({ row: rowCount });
  } catch (err) {
    next(err);
  }
}

export async function getLabCourses(req, res, next) {
  try {
    const Courses = await getAllLab();
    res.status(200).json(Courses);
  } catch (err) {
    next(err);
  }
}

export async function getNonDeptLabCourses(req, res, next) {
  try {
    const Courses = await getNonDeptLabs();
    res.status(200).json(Courses);
  } catch (err) {
    next(err);
  }
}

export async function getNonDeptTheoryCourses(req, res, next) {
  try {
    const Courses = await getNonDeptTheories();
    res.status(200).json(Courses);
  } catch (err) {
    next(err);
  }
}

export async function getSessionalCoursesByDeptLevelTermAPI(req, res, next) {
  const department = req.params["department"];
  const level_term = req.params["level_term"];

  try {
    const Courses = await getSessionalCoursesByDeptLevelTerm(department, level_term);
    res.status(200).json({ message: "Sessional courses successfully Fetched", data: Courses });
  } catch (err) {
    next(err);
  }
}

export async function getTheoryCoursesByDeptLevelTermAPI(req, res, next) {
  const department = req.params["department"];
  const level_term = req.params["level_term"];

  try {
    const Courses = await getTheoryCoursesByDeptLevelTerm(department, level_term);
    res.status(200).json({ message: "Theory courses successfully Fetched", data: Courses });
  } catch (err) {
    next(err);
  }
} 