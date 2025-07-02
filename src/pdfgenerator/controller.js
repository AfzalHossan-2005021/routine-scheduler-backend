import pdf from "pdf-creator-node";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import admin from "firebase-admin";
import { serviceAccount } from "../../pvtkey.js";
import {
	routineForLvl,
	routineForTeacher,
	routineForRoom,
	getInitials,
	getRooms,
	getLevelTerms,
} from "./repository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dayOrder = {
	Saturday: 0,
	Sunday: 1,
	Monday: 2,
	Tuesday: 3,
	Wednesday: 4,
	Thursday: 5,
	Friday: 6,
};

var options = {
	format: "A3",
	orientation: "landscape",
	border: "10mm",
	header: {
		height: "45mm",
		contents: '<div style="text-align: center;">Author: AA Fahad</div>',
	},
	footer: {
		height: "28mm",
		contents: {
			first: "Cover page",
			2: "Second page", // Any page number is working. 1-based index
			default:
				'<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
			last: "Last Page",
		},
	},
};

function sortedData(datas) {
	//sort by day
	var sortedDatas = [];
	var keys = Object.keys(datas);
	var len = keys.length;

	keys.sort(function (a, b) {
		return dayOrder[a] - dayOrder[b];
	});

	for (var i = 0; i < len; i++) {
		var k = keys[i];
		sortedDatas[k] = datas[k];
	}
	return sortedDatas;
}

async function generateData(rows, mergeSection) {
	const data = rows.reduce((acc, curr) => {
		const { day, time, initial, room, course_id, section, type } = curr;
		const onlySec = mergeSection ? "merged" : section.substr(0, 1);
		if (!acc[onlySec])
			acc[onlySec] = {
				Saturday: {},
				Sunday: {},
				Monday: {},
				Tuesday: {},
				Wednesday: {},
			};
		if (!acc[onlySec][day][time]) acc[onlySec][day][time] = {};
		if (initial !== acc[onlySec][day][time].initial && initial)
			acc[onlySec][day][time].initial = acc[onlySec][day][time].initial
				? acc[onlySec][day][time].initial + "/" + initial
				: initial;
		if (room !== acc[onlySec][day][time].room && room)
			acc[onlySec][day][time].room = acc[onlySec][day][time].room
				? acc[onlySec][day][time].room + "/" + room
				: room;
		if (course_id !== acc[onlySec][day][time].course_id && course_id)
			acc[onlySec][day][time].course_id = acc[onlySec][day][time]
				.course_id
				? acc[onlySec][day][time].course_id + "/" + course_id
				: course_id;
		if (section !== acc[onlySec][day][time].section && section)
			acc[onlySec][day][time].section = acc[onlySec][day][time].section
				? acc[onlySec][day][time].section + "/" + section
				: section;
		acc[onlySec][day][time].colspan = type === 0 ? 1 : 3;
		// acc[onlySec][day].sort((a, b) => (a.time+4)%12 - (b.time+4)%12);
		return acc;
	}, {});

	const appointments = {};
	const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
	const time = [8, 9, 10, 11, 12, 1, 2, 3, 4];
	for (const section in data) {
		console.log(section, mergeSection);
		if (!appointments[section]) appointments[section] = [];
		for (let j = 0; j < days.length; j++) {
			const day = days[j];
			appointments[section][j] = [];
			for (let i = 0; i < time.length; ) {
				const t = time[i];
				if (data[section][day][t]) {
					appointments[section][j].push(data[section][day][t]);
					i += data[section][day][t].colspan;
					console.log(data[section][day][t]);
				} else {
					appointments[section][j].push({
						colspan: 1,
						initial: "",
						room: "",
						course_id: "",
						section: "",
					});
					i++;
				}
			}
			appointments[section][j] = {
				day: day,
				appointments: appointments[section][j],
			};
		}
	}

	return appointments;
}
async function createPDFStd(datas, filename) {
	//fetch template
	var html = fs.readFileSync(
		path.resolve(__dirname, "templateStudent.html"),
		"utf8"
	);
	//create output directory
	var outputDir = path.resolve(__dirname, filename + ".pdf");

	var document = {
		html: html,
		data: {
			datas: datas,
		},
		path: outputDir,
		type: "",
	};
	return (await pdf.create(document, options)).filename;
}

// PDF diagnostic and error handling utility
async function handlePdfError(err, outputDir, next) {
	console.error("PDF Generation Error:", err);

	// Check for common errors
	if (err.code === "ENOENT" && err.syscall?.includes("phantomjs")) {
		console.error("[PDF ERROR] PhantomJS executable not found");
		console.error("Expected path:", err.path);
		console.error("Make sure PhantomJS is installed and available in PATH");

		// Try to provide helpful information about available executables
		try {
			const { execSync } = require("child_process");
			const findResult = execSync(
				"find / -name phantomjs -type f 2>/dev/null || echo 'Not found'"
			).toString();
			console.error("PhantomJS executables found on system:", findResult || "None");
		} catch (e) {
			console.error("Could not search for PhantomJS executables");
		}
	} else if (err.code === "ENOENT" && err.syscall?.includes("access")) {
		console.error("[PDF ERROR] PDF file not found:", err.path);

		// Check if directory exists
		try {
			const fs = require("fs");
			const path = require("path");
			const dirPath = path.dirname(err.path);
			const dirExists = fs.existsSync(dirPath);
			console.error("Directory exists:", dirExists);
			if (dirExists) {
				const files = fs.readdirSync(dirPath);
				console.error("Files in directory:", files);
			}
		} catch (e) {
			console.error("Could not check directory:", e.message);
		}
	}

	// Check if we need to create the directory
	if (outputDir) {
		try {
			const fs = require("fs");
			const path = require("path");
			const dirPath = path.dirname(outputDir);
			if (!fs.existsSync(dirPath)) {
				fs.mkdirSync(dirPath, { recursive: true });
				console.log("Created missing directory:", dirPath);
			}
		} catch (e) {
			console.error("Failed to create directory:", e.message);
		}
	}

	// Pass error to express error handler
	next(err);
}

export async function generatePDF(req, res, next) {
	const lvlTerm = req.params.lvlTerm;

	try {
		const rows = await routineForLvl(lvlTerm);
		if (rows.length === 0) {
			res.status(404).json({ message: "No data found" });
		} else {
			const appointments = await generateData(rows);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({
					title: `${lvlTerm} ${section}`,
					schedule: appointment,
				});
			}
			const filename = await createPDFStd(pdfData, lvlTerm);

			console.log(filename);

			res.status(200).json({ message: "PDF generated" });
		}
	} catch (err) {
		handlePdfError(err, null, next);
	}
}

export async function teacherPDF(req, res, next) {
	const initial = req.params.initial;

	try {
		const rows = await routineForTeacher(initial);
		if (rows.length === 0) {
			res.status(404).json({ message: "No data found" });
		} else {
			const appointments = await generateData(rows, true);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({
					title: `Teacher: ${initial}`,
					schedule: appointment,
				});
			}
			const filename = await createPDFStd(pdfData, initial);

			console.log(filename);

			res.status(200).json({ message: "PDF generated" });
		}
	} catch (err) {
		handlePdfError(err, null, next);
	}
}

export async function roomPDF(req, res, next) {
	const room = req.params.room;

	try {
		const rows = await routineForRoom(room);
		if (rows.length === 0) {
			res.status(404).json({ message: "No data found" });
		} else {
			const appointments = await generateData(rows);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({ title: `Room: ${room}`, schedule: appointment });
			}
			const filename = await createPDFStd(pdfData, room);

			console.log(filename);

			res.status(200).json({ message: "PDF generated" });
		}
	} catch (err) {
		handlePdfError(err, null, next);
	}
}

//initialize the app
try {
	admin.initializeApp({
		credential: admin.credential.cert(
			JSON.parse(JSON.stringify(serviceAccount))
		),
		storageBucket: "gs://buet-cse-routine-scheduler.appspot.com", //you can find in storage.
	});
	console.log("Firebase Admin initialized successfully.");
} catch (err) {
	console.log(err);
}

//get bucket
var bucket = admin.storage().bucket();

//function to upload file
async function uploadFile(filepath, filename) {
	await bucket.upload(filepath, {
		gzip: true,
		destination: filename,
		metadata: {
			cacheControl: "public, max-age=31536000",
		},
	});

	console.log(`${filename} uploaded to bucket.`);
}

//function to get url

async function generateSignedUrl(filename) {
	const options = {
		version: "v2",
		action: "read",
		expires: Date.now() + 1000 * 60 * 60,
	};

	const [url] = await bucket.file(filename).getSignedUrl(options);
	// console.log(url);
	return url;
}

// var filepath = outputDir;
var filename = "test.pdf"; //can be anything, it will be the name with which it will be uploded to the firebase storage.

export async function uploadPDF(req, res) {
	// uploadFile(filepath, filename)
	const url = await generateSignedUrl(filename);
	res.status(200).json({ url: url });
}

async function uploadRoutine(filepath, filename) {
	await bucket.upload(filepath, {
		gzip: true,
		destination: filename,
		metadata: {
			cacheControl: "public, max-age=31536000",
		},
	});
}

export async function serveLvlTermPDF(req, res, next) {
	const lvlTerm = req.params.lvlTerm;
	var outputDir = path.resolve(__dirname, lvlTerm + ".pdf");

	if (!fs.existsSync(outputDir)) {
		try {
			const rows = await routineForLvl(lvlTerm);
			if (rows.length === 0) {
				res.status(404).json({ message: "No data found" });
			} else {
				const appointments = await generateData(rows);
				const sections = Object.keys(appointments).sort();

				const pdfData = [];
				for (const section of sections) {
					const appointment = appointments[section];
					pdfData.push({
						title: `${lvlTerm} ${section}`,
						schedule: appointment,
					});
				}
				const filename = await createPDFStd(pdfData, lvlTerm);

				console.log(filename);

				// res.status(200).json({ message: "PDF generated", appointments });
			}
		} catch (err) {
			next(err);
		}
	}

	fs.access(outputDir, fs.constants.F_OK, (err) => {
		if (err) {
			next(err);
			return;
		}

		res.status(200)
			.set("Content-Disposition", "inline")
			.sendFile(outputDir);
	});
}

export async function serveTeacherPDF(req, res, next) {
	const initial = req.params.initial;
	var outputDir = path.resolve(__dirname, initial + ".pdf");

	if (!fs.existsSync(outputDir)) {
		try {
			const rows = await routineForTeacher(initial);
			if (rows.length === 0) {
				res.status(404).json({ message: "No data found" });
			} else {
				const appointments = await generateData(rows, true);
				const sections = Object.keys(appointments).sort();

				const pdfData = [];
				for (const section of sections) {
					const appointment = appointments[section];
					pdfData.push({
						title: `Teacher: ${initial}`,
						schedule: appointment,
					});
				}
				const filename = await createPDFStd(pdfData, initial);

				console.log(filename);

				// res.status(200).json({ message: "PDF generated" });
			}
		} catch (err) {
			next(err);
		}
	}

	fs.access(outputDir, fs.constants.F_OK, (err) => {
		if (err) {
			next(err);
			return;
		}

		res.status(200)
			.set("Content-Disposition", "inline")
			.sendFile(outputDir);
	});
}

export async function serveRoomPDF(req, res, next) {
	const room = req.params.room;
	var outputDir = path.resolve(__dirname, room + ".pdf");

	if (!fs.existsSync(outputDir)) {
		try {
			const rows = await routineForRoom(room);
			// if (rows.length === 0) {
			//   res.status(404).json({ message: "No data found" });
			//   return;
			// } else {
			const appointments = await generateData(rows);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({ title: `Room: ${room}`, schedule: appointment });
			}
			const filename = await createPDFStd(pdfData, room);

			console.log(filename);

			// res.status(200).json({ message: "PDF generated" });
			// }
		} catch (err) {
			next(err);
		}
	}

	fs.access(outputDir, fs.constants.F_OK, (err) => {
		if (err) {
			next(err);
			return;
		}

		res.status(200)
			.set("Content-Disposition", "inline")
			.sendFile(outputDir);
	});
}

export async function getAllInitial(req, res, next) {
	try {
		const result = await getInitials();
		res.status(200).json({ initials: result });
	} catch (err) {
		next(err);
	}
}

export async function getAllIRooms(req, res, next) {
	try {
		const result = await getRooms();
		res.status(200).json({ rooms: result });
	} catch (err) {
		next(err);
	}
}

export async function getAllLevelTerm(req, res, next) {
	try {
		const result = await getLevelTerms();
		res.status(200).json(result.map((row) => row.level_term).sort());
	} catch (err) {
		next(err);
	}
}
