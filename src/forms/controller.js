import { sendTheorySchedNextMail } from "../schedule/controller.js";
import {
  getPreferenceForm,
  updatePreferenceForm,
  getTheoryScheduleForm,
  saveTheoryScheduleForm,
} from "./repository.js";

export async function getTheoryPreferenceFormAPI(req, res, next) {
  const initial = req.params["initial"];
  try {
    console.log("Fetching theory preference form for initial:", initial);
    const form = await getPreferenceForm(initial, "theory-pref");
    res.status(200).json({ data: form });
  } catch (err) {
    next(err);
  }
}

export async function updateTheoryPreferenceFormAPI(req, res, next) {
  const initial = req.params["initial"];
  let response = JSON.stringify(req.body.preferences);

  try {
    const form = await updatePreferenceForm(initial, response, "theory-pref");
    res.status(200).json({ msg: "Successfully Updated" });
  } catch (err) {
    next(err);
  }
}

export async function getTheoryScheduleFormAPI(req, res, next) {
  const initial = req.params["initial"];
  try {
    const form = await getTheoryScheduleForm(initial);
    res.status(200).json(form);
  } catch (err) {
    next(err);
  }
}

export async function updateTheoryScheduleFormAPI(req, res, next) {
  try {
    const initial = req.params["initial"];
    const response = JSON.stringify(req.body);
    await updatePreferenceForm(initial, response, "theory-sched");
    const batch = await saveTheoryScheduleForm(initial, response);
    await sendTheorySchedNextMail(batch);
    res.status(200).json({ msg: "Successfully Updated" });
  } catch (err) {
    next(err);
  }
}

export async function getSessionalPreferenceFormAPI(req, res, next) {
  const initial = req.params["initial"];

  try {
    const form = await getPreferenceForm(initial, "sessional-pref");
    res.status(200).json({ data: form });
  } catch (err) {
    next(err);
  }
}

export async function updateSessionalPreferenceFormAPI(req, res, next) {
  try {
    const initial = req.params["initial"];
    const response = JSON.stringify(req.body);
    await updatePreferenceForm(initial, response, "sessional-pref");
    res.status(200).json({ msg: "Successfully Updated" });
  } catch (err) {
    next(err);
  }
}