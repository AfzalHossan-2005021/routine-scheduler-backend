import { resend } from "../config/mail.js";
import { v4 as uuidv4 } from "uuid";
import {
  getTemplate,
  getAllTeacherMail,
  createForm,
  getTheoryPreferencesStatus,
  finalize,
  isFinalized,
  getTheoryAssignment,
  getLabRoomAssignmentDB,
  setLabRoomAssignemntDB,
  getTeacherAssignmentDB,
  getTeacherTheoryAssigments,
  getSessionalPreferencesStatus,
  finalizeSessional,
  isSessionalFinalized,
  getSessionalAssignment,
  getTeacherSessionalAssignment,
  getSessionalTeachers,
  getAllSessionalAssignment,
  setTeacherAssignmentDB,
  setTeacherSessionalAssignmentDB,
  getTeacherMailByInitial,
  saveReorderedTeacherPreferenceDB
} from "./repository.js";
import { HttpError } from "../config/error-handle.js";

async function sendMail(initial, email, template) {
  var url = process.env.URL || "http://localhost:3000";
  url = url + "/form/theory-pref/" + initial;
  const msg =
    "<p>" + template + "</p>" +
    "<h2> For " + initial + ":</h2><br>" + " <h1>Please fill up this form</h1>  <a href=' " +
    url +
    " ' > " +
    url +
    "</a>";
  const info = await resend.emails.send({
    from: 'Routine_Scheduler <onboarding@resend.dev>',
    to: email,
    subject: "Theory Preferences Form",
    html: msg,
  });
  return info;
}

export async function sendTheoryPrefMail(req, res, next) {
  try {
    const msgBody = await getTemplate("THEORY_EMAIL");

    if (msgBody[0].key !== null && msgBody[0].key !== undefined) {
      //get all mail and initial
      const data = await getAllTeacherMail();
      // for (var i = 0; i <= 2; i++) {
      for (var i = 0; i < data.length; i++) {
        const id = uuidv4();
        const row = await createForm(id, data[i].initial, "theory-pref");
        var info = await sendMail(data[i].initial, data[i].email, msgBody[0].value, id);
        console.log(info.messageId);
        await delay(600); // Wait 600ms between requests to avoid rate limit
      }
      res.status(200).json({ msg: "successfully send" });
    } else {
      next(new HttpError(400, "Template not found"));
    }
  } catch (err) {
    next(err);
  }
}

export async function getCurrStatus(req, res, next) {
  try {
    const result = await getTheoryPreferencesStatus();
    if (result.length === 0) {
      res.status(200).json({ status: 0 });
    } else {
      const nullResponse = result.filter((row) => row.response === null);
      const otherResponse = result.filter((row) => row.response !== null);
      if (await isFinalized())
        res.status(200).json({
          status: 3,
          values: nullResponse,
          submitted: otherResponse,
          assignment: await getTheoryAssignment(),
        });
      else
        res.status(200).json({
          status: nullResponse.length === 0 ? 2 : 1,
          values: nullResponse,
          submitted: otherResponse,
        });
    }
  } catch (err) {
    next(err);
  }
}

export async function finalizeTheoryPreference(req, res, next) {
  try {
    const commited = await finalize();
    if (!commited) {
      throw new HttpError(400, "Finalizing Failed");
    }
    res.status(200).json({ msg: "Finilizing Done" });
  } catch (err) {
    next(err);
  }
}

export async function getTeacherAssignment(req, res, next) {
  try {
    const result = await getTeacherAssignmentDB();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getTeacherTheoryAssigmentsAPI(req, res, next) {
  try {
    const initial = req.params["initial"];
    const result = await getTeacherTheoryAssigments(initial);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getSessionalTeachersAPI(req, res, next) {
  const course_id = req.params["course_id"];
  const section = req.params["section"];
  try {
    const result = await getSessionalTeachers(course_id, section);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getAllSessionalAssignmentAPI(req, res, next) {
  try {
    const result = await getAllSessionalAssignment();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getLabRoomAssignment(req, res, next) {
  try {
    const result = await getLabRoomAssignmentDB();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


export async function setLabRoomAssignemnt(req, res, next) {
  try {
    await setLabRoomAssignemntDB(req.body);
    res.status(200).json({msg:"Successfully Assigned"});
  } catch (err) {
    next(err);
  }
}

async function sendSessionalMail(initial, email, template) {
  var url = process.env.URL || "http://localhost:3000";
  url = url + "/form/sessional-pref/" + initial;
  const msg =
    "<p>" + template + "</p>" +
    "<h2> For " + initial + ":</h2><br>" + " <h1>Please fill up this form</h1>  <a href=' " +
    url +
    " ' > " +
    url +
    "</a>";
  const info = await resend.emails.send({
    from: 'Routine_Scheduler <onboarding@resend.dev>',
    to: email,
    subject: "Sessional Preferences Form",
    html: msg,
  });
  return info;
}

export async function sendSessionalPrefMail(req, res, next) {
  try {
    const msgBody = await getTemplate("SESSIONAL_EMAIL");

    if (msgBody[0].key !== null && msgBody[0].key !== undefined) {
      //get all mail and initial
      const data = await getAllTeacherMail();
      // for (var i = 0; i <= 3; i++) {
      for (var i = 0; i < data.length; i++) {
        const id = uuidv4();
        const row = await createForm(id, data[i].initial, "sessional-pref");
        var info = sendSessionalMail(data[i].initial, data[i].email, msgBody[0].value, id);
        console.log(info.messageId);
        await delay(600); // Wait 600ms between requests to avoid rate limit
      }
      res.status(200).json({ msg: "successfully send" });
    } else {
      next(new HttpError(400, "Template not found"));
    }
  } catch (err) {
    next(err);
  }
}

export async function getSessionalCurrStatus(req, res, next) {
  console.log("Fetching sessional preferences status...");
  try {
    const result = await getSessionalPreferencesStatus();
    if (result.length === 0) {
      res.status(200).json({ status: 0 });
    } else {
      const nullResponse = result.filter((row) => row.response === null);
      const otherResponse = result.filter((row) => row.response !== null);
      if (await isSessionalFinalized())
        res.status(200).json({
          status: 3,
          values: nullResponse,
          submitted: otherResponse,
          assignment: await getSessionalAssignment(),
        });
      else
        res.status(200).json({
          status: nullResponse.length === 0 ? 2 : 1,
          values: nullResponse,
          submitted: otherResponse,
        });
    }
  } catch (err) {
    next(err);
  }
}

export async function getTeacherSessionalAssignmentAPI(req, res, next) {
  try {
    const initial = req.params["initial"];
    const result = await getTeacherSessionalAssignment(initial);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function finalizeSessionalPreference(req, res, next) {
  try {
    // TODO : finalize sessional
    const commited = await finalizeSessional();
    if (!commited) {
      throw new HttpError(400, "Finalizing Failed");
    }
    res.status(200).json({ msg: "Finilizing Done" });
  } catch (err) {
    next(err);
  }
}

export async function setTeacherAssignment(req, res, next){
  const assignment = req.body;
  try {
    await setTeacherAssignmentDB(assignment);
    res.status(200).json({message: "Assignment Successful"});
  } catch (error) {
    res.status(500).json({message: "An error occurred in server"});
  }
}

export async function saveReorderedTeacherPreference(req, res, next) {
  try {
    const { initial, response } = req.body;
    const success = await saveReorderedTeacherPreferenceDB(initial, response);
    if (!success) {
      throw new HttpError(404, "Teacher preference not found");
    }
    res.status(200).json({ 
      success: true, 
      message: "Preferences updated successfully" 
    });
  } catch (error) {
    next(error);
  }
}

export async function setTeacherSessionalAssignment(req, res, next){
  const assignment = req.body;
  try {
    await setTeacherSessionalAssignmentDB(assignment);
    res.status(200).json({message: "Assignment Successful"});
  } catch (error) {
    res.status(500).json({message: "An error occurred in server"});
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function resendFormMailHandler({ initial, email, type }) {
  try {
    // Use sendMail for theory-pref, sendSessionalMail for sessional-pref
    if (type === 'theory-pref') {
      return await sendMail(initial, email, (await getTemplate('THEORY_EMAIL'))[0].value);
    } else if (type === 'sessional-pref') {
      return await sendSessionalMail(initial, email, (await getTemplate('SESSIONAL_EMAIL'))[0].value);
    } else {
      throw new HttpError(400, 'Invalid form type');
    }
  } catch (err) {
    throw err;
  }
}

export async function resendTheoryPrefMail(req, res, next) {
  try {
    const initial = req.params["initial"];
    const email = await getTeacherMailByInitial(initial);
    await resendFormMailHandler({ initial, email, type: 'theory-pref' });
    res.status(200).json({ msg: 'Theory preference mail resent successfully' });
  } catch (err) {
    next(err);
  }
}

export async function resendSessionalPrefMail(req, res, next) {
  try {
    const initial = req.params["initial"];
    const email = await getTeacherMailByInitial(initial);
    await resendFormMailHandler({ initial, email, type: 'sessional-pref' });
    res.status(200).json({ msg: 'Sessional preference mail resent successfully' });
  } catch (err) {
    next(err);
  }
}