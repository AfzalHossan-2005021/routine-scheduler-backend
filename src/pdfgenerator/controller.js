import pdf from "pdf-creator-node";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import path from "path";
import {
	routineForLvl,
	routineForTeacher,
	routineForRoom,
	getInitials,
	getRooms,
	getLevelTerms,
	getCurrentSession,
	getSectionsByLevelTerm,
} from "./repository.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper function to format level-term properly
function formatLevelTerm(levelTerm, section = "") {
	// Parse the level-term string (e.g., "L-1 T-2" or "1-2")
	let level, term;
	
	// Try different possible formats
	if (levelTerm.includes("L-") && levelTerm.includes("T-")) {
		// Format: L-1 T-2
		[level, term] = levelTerm.split("T-");
		level = level.replace("L-", "").trim();
		term = term.trim();
	} else if (levelTerm.includes("-")) {
		// Format: 1-2
		[level, term] = levelTerm.split("-");
	} else {
		// If format doesn't match, return original
		return section ? `${levelTerm} (Section ${section})` : levelTerm;
	}

	// Convert term numbers to Roman numerals
	const romanNumerals = {
		"1": "I", "2": "II", "3": "III", "4": "IV", 
		"5": "V", "6": "VI", "7": "VII", "8": "VIII"
	};

	const termRoman = romanNumerals[term] || term;
	
	// Format the result
	if (section) {
		return `Level ${level}, Term ${termRoman} (Section ${section})`;
	} else {
		return `Level ${level}, Term ${termRoman}`;
	}
}

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
	format: "A4",
	orientation: "landscape",
	border: "8mm",
	header: {
		height: "15mm",
		contents: '',
	},
	footer: {
		height: "15mm",
		contents: {
			default:
				'<span style="color: #444;">{{page}}</span>/<span>{{pages}}</span>', // fallback value
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
		if (initial) {
			if (!acc[onlySec][day][time].teachers) {
				acc[onlySec][day][time].teachers = [];
			}
			
			// Store teacher with seniority rank for later sorting
			acc[onlySec][day][time].teachers.push({
				initial: initial,
				seniority_rank: curr.seniority_rank || 9999 // Default high rank for sorting
			});
		}
		// Create an array of courses for multiple courses in one slot
		if (!acc[onlySec][day][time].courses) {
			acc[onlySec][day][time].courses = [];
		}
		
		// Check if this is a new course to add
		const existingCourseIndex = acc[onlySec][day][time].courses.findIndex(
			c => c.course_id === course_id && c.section === section
		);
		
		if (existingCourseIndex === -1) {
			// This is a new course, add it to the array
			acc[onlySec][day][time].courses.push({
				course_id: course_id,
				room: room,
				section: section,
				teachers: acc[onlySec][day][time].teachers ? [...acc[onlySec][day][time].teachers] : [],
				showSection: null // Will be set below
			});
		} else {
			// Update existing course with new teacher
			const existingCourse = acc[onlySec][day][time].courses[existingCourseIndex];
			if (room) existingCourse.room = room;
			// Teachers are added above to the time slot's teachers array
		}
		
		// Keep the legacy fields for backward compatibility
		if (room) acc[onlySec][day][time].room = room;
		if (course_id) acc[onlySec][day][time].course_id = course_id;
		if (section) acc[onlySec][day][time].section = section;
		acc[onlySec][day][time].colspan = type === 0 ? 1 : 3;
		
		// Add a flag to determine whether to show section in the PDF
		// In case of room schedules or teacher schedules, always show section
		// In case of level-term schedules:
		// - Don't show if section exactly matches the current section (e.g., "A" in "Section A")
		// - Do show if it's a subsection (e.g., "A1" or "A2" in "Section A")
		// - Do show if it's a different section (e.g., "B" in "Section A")
		
		let showSection = true; // Default to showing
		
		if (!mergeSection) {  // Only perform this logic for level-term schedules
			// If the section matches exactly what's in the title, don't show it
			if (section === onlySec) {
				showSection = false;
			} 
			// If it's like A1 or A2 in section A, show it
			else if (section.length > 1 && section.charAt(0) === onlySec) {
				showSection = true;
			}
			// For completely different sections, show them
		}
		
		// Set showSection for both the legacy property and on the last added course
		acc[onlySec][day][time].showSection = showSection;
		
		// Set showSection on the latest added course
		if (acc[onlySec][day][time].courses && acc[onlySec][day][time].courses.length > 0) {
			const lastCourseIndex = acc[onlySec][day][time].courses.length - 1;
			acc[onlySec][day][time].courses[lastCourseIndex].showSection = showSection;
		}
		
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
					// Sort teachers by seniority_rank if available
					if (data[section][day][t].teachers && data[section][day][t].teachers.length > 0) {
						// Sort by seniority_rank (lower ranks first)
						data[section][day][t].teachers.sort((a, b) => 
							(a.seniority_rank || 9999) - (b.seniority_rank || 9999)
						);
						
						// Join initials with commas
						data[section][day][t].initial = data[section][day][t].teachers
							.map(teacher => teacher.initial)
							.join(", ");
					}
					
					// Process multiple courses if they exist
					if (data[section][day][t].courses && data[section][day][t].courses.length > 1) {
						// Mark this cell as having multiple courses
						data[section][day][t].hasMultipleCourses = true;
						
						// For each course, make sure it has the right teacher initials
						data[section][day][t].courses.forEach(course => {
							// For now, all courses share the same teachers
							// In a more advanced implementation, you could match teachers to specific courses
							course.initial = data[section][day][t].initial;
							
							// Pass the level_term to the course if it exists
							if (data[section][day][t].level_term) {
								course.level_term = data[section][day][t].level_term;
							}
						});
					} else if (data[section][day][t].courses && data[section][day][t].courses.length === 1) {
						// Single course case - keep the course data but no special handling needed
						data[section][day][t].courses[0].initial = data[section][day][t].initial;
						data[section][day][t].hasMultipleCourses = false;
					} else {
						// No courses defined (legacy data) - create a default course
						data[section][day][t].courses = [{
							course_id: data[section][day][t].course_id,
							room: data[section][day][t].room,
							section: data[section][day][t].section,
							initial: data[section][day][t].initial,
							showSection: data[section][day][t].showSection
						}];
						data[section][day][t].hasMultipleCourses = false;
					}
					
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
async function createPDFStd(datas, filename, session) {
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
			currentSession: session || "January 2025"
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
		const currentSession = await getCurrentSession();
		
		if (rows.length === 0) {
			res.status(404).json({ message: "No data found" });
		} else {
			const appointments = await generateData(rows);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({
					title: formatLevelTerm(lvlTerm, section),
					schedule: appointment,
				});
			}
			const filename = await createPDFStd(pdfData, lvlTerm, currentSession);

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
		const currentSession = await getCurrentSession();
		
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
			const filename = await createPDFStd(pdfData, initial, currentSession);

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
		const currentSession = await getCurrentSession();
		
		if (rows.length === 0) {
			res.status(404).json({ message: "No data found" });
		} else {
			const appointments = await generateData(rows);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({ 
					title: `Room: ${room}`, 
					schedule: appointment 
				});
			}
			const filename = await createPDFStd(pdfData, room, currentSession);

			console.log(filename);

			res.status(200).json({ message: "PDF generated" });
		}
	} catch (err) {
		handlePdfError(err, null, next);
	}
}

// Firebase functionality removed

// Firebase upload functionality removed

export async function serveLvlTermPDF(req, res, next) {
	const lvlTerm = req.params.lvlTerm;
	var outputDir = path.resolve(__dirname, lvlTerm + ".pdf");

	if (!fs.existsSync(outputDir)) {
		try {
			const rows = await routineForLvl(lvlTerm);
			const currentSession = await getCurrentSession();
			
			if (rows.length === 0) {
				res.status(404).json({ message: "No data found" });
			} else {
				const appointments = await generateData(rows);
				const sections = Object.keys(appointments).sort();

				const pdfData = [];
				for (const section of sections) {
					const appointment = appointments[section];
					pdfData.push({
						title: formatLevelTerm(lvlTerm, section),
						schedule: appointment,
					});
				}
				const filename = await createPDFStd(pdfData, lvlTerm, currentSession);

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
			const currentSession = await getCurrentSession();
			
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
				const filename = await createPDFStd(pdfData, initial, currentSession);

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
			const currentSession = await getCurrentSession();
			
			// if (rows.length === 0) {
			//   res.status(404).json({ message: "No data found" });
			//   return;
			// } else {
			const appointments = await generateData(rows);
			const sections = Object.keys(appointments).sort();

			const pdfData = [];
			for (const section of sections) {
				const appointment = appointments[section];
				pdfData.push({ 
					title: `Room: ${room}`, 
					schedule: appointment 
				});
			}
			const filename = await createPDFStd(pdfData, room, currentSession);

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

// Generate consolidated PDF for all level terms
export async function generateAllLevelTermPDFs(req, res, next) {
	try {
		const levelTerms = await getLevelTerms();
		const allPdfData = [];
		const currentSession = await getCurrentSession();
		const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
		
		// Sort level terms like dictionary (alphabetical order)
		const sortedLevelTerms = levelTerms.sort((a, b) => 
			a.level_term.localeCompare(b.level_term)
		);
		
		for (const levelTerm of sortedLevelTerms) {
			try {
				const lvlTerm = levelTerm.level_term;
				const rows = await routineForLvl(lvlTerm);
				
				// Get all sections for this level term
				const allLevelTermSections = await getSectionsByLevelTerm(lvlTerm);
				
				if (rows.length > 0) {
					// Level term has data - process normally
					const appointments = await generateData(rows);
					const sections = Object.keys(appointments).sort();
					const existingSections = new Set(sections);
					
					// Add schedules for sections that have data
					for (const section of sections) {
						const appointment = appointments[section];
						allPdfData.push({
							title: formatLevelTerm(lvlTerm, section),
							schedule: appointment,
						});
					}
					
					// Add empty schedules for sections that don't have data
					for (const sectionObj of allLevelTermSections) {
						const section = sectionObj.section;
						if (!existingSections.has(section)) {
							const emptySchedule = [];
							for (let j = 0; j < days.length; j++) {
								const day = days[j];
								const emptyAppointments = [];
								for (let i = 0; i < 9; i++) {
									emptyAppointments.push({
										colspan: 1,
										initial: "",
										room: "",
										course_id: "",
										section: "",
									});
								}
								emptySchedule.push({
									day: day,
									appointments: emptyAppointments,
								});
							}
							
							allPdfData.push({
								title: formatLevelTerm(lvlTerm, section),
								schedule: emptySchedule,
								isEmpty: true
							});
						}
					}
				} else if (allLevelTermSections.length > 0) {
					// No data for this level term but sections exist
					// Add empty schedules for each section
					for (const sectionObj of allLevelTermSections) {
						const section = sectionObj.section;
						const emptySchedule = [];
						for (let j = 0; j < days.length; j++) {
							const day = days[j];
							const emptyAppointments = [];
							for (let i = 0; i < 9; i++) {
								emptyAppointments.push({
									colspan: 1,
									initial: "",
									room: "",
									course_id: "",
									section: "",
								});
							}
							emptySchedule.push({
								day: day,
								appointments: emptyAppointments,
							});
						}
						
						allPdfData.push({
							title: formatLevelTerm(lvlTerm, section),
							schedule: emptySchedule,
							isEmpty: true
						});
					}
				} else {
					// No sections found, just add one empty schedule for the level term
					const emptySchedule = [];
					for (let j = 0; j < days.length; j++) {
						const day = days[j];
						const emptyAppointments = [];
						for (let i = 0; i < 9; i++) {
							emptyAppointments.push({
								colspan: 1,
								initial: "",
								room: "",
								course_id: "",
								section: "",
							});
						}
						emptySchedule.push({
							day: day,
							appointments: emptyAppointments,
						});
					}
					
					allPdfData.push({
						title: formatLevelTerm(lvlTerm, ""),
						schedule: emptySchedule,
						isEmpty: true
					});
				}
			} catch (error) {
				console.error(`Error processing level term ${levelTerm.level_term}:`, error);
			}
		}
		
		// Create PDF even if all schedules are empty
		const filename = await createPDFStd(allPdfData, "All_Level_Terms", currentSession);
		res.status(200).json({ 
			message: "Consolidated PDF generated successfully for all level terms",
			filename: filename,
			totalCount: allPdfData.length
		});
	} catch (err) {
		next(err);
	}
}

// Generate consolidated PDF for all teachers
export async function generateAllTeacherPDFs(req, res, next) {
	try {
		const teachers = await getInitials();
		const allPdfData = [];
		const currentSession = await getCurrentSession();
		const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
		
		// Sort teachers by seniority_rank (ascending order - lower rank = more senior)
		const sortedTeachers = teachers.sort((a, b) => {
			// Handle null/undefined seniority_rank by putting them at the end
			if (a.seniority_rank == null && b.seniority_rank == null) return 0;
			if (a.seniority_rank == null) return 1;
			if (b.seniority_rank == null) return -1;
			return a.seniority_rank - b.seniority_rank;
		});
		
		for (const teacher of sortedTeachers) {
			try {
				const initial = teacher.initial;
				const rows = await routineForTeacher(initial);
				
				if (rows.length > 0) {
					// Teacher has data - process normally
					const appointments = await generateData(rows, true);
					const sections = Object.keys(appointments).sort();

					for (const section of sections) {
						const appointment = appointments[section];
						allPdfData.push({
							title: `Teacher: ${initial}`,
							schedule: appointment,
						});
					}
				} else {
					// Create empty schedule structure for this teacher
					const emptySchedule = [];
					for (let j = 0; j < days.length; j++) {
						const day = days[j];
						const emptyAppointments = [];
						for (let i = 0; i < 9; i++) {
							emptyAppointments.push({
								colspan: 1,
								initial: "",
								room: "",
								course_id: "",
								section: "",
							});
						}
						emptySchedule.push({
							day: day,
							appointments: emptyAppointments,
						});
					}
					
					// Add the empty schedule
					allPdfData.push({
						title: `Teacher: ${initial}`,
						schedule: emptySchedule,
						isEmpty: true
					});
				}
			} catch (error) {
				console.error(`Error processing teacher ${teacher.initial}:`, error);
			}
		}
		
		// Create PDF even if all schedules are empty
		const filename = await createPDFStd(allPdfData, "All_Teachers", currentSession);
		res.status(200).json({ 
			message: "Consolidated PDF generated successfully for all teachers",
			filename: filename,
			totalCount: allPdfData.length
		});
	} catch (err) {
		next(err);
	}
}

// Generate consolidated PDF for all rooms
export async function generateAllRoomPDFs(req, res, next) {
	try {
		const rooms = await getRooms();
		const allPdfData = [];
		const currentSession = await getCurrentSession();
		const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday"];
		
		// Sort rooms alphabetically (dictionary order)
		const sortedRooms = rooms.sort((a, b) => 
			a.room.localeCompare(b.room)
		);
		
		for (const roomData of sortedRooms) {
			try {
				const room = roomData.room;
				const rows = await routineForRoom(room);
				
				if (rows.length > 0) {
					// Room has data - process normally
					const appointments = await generateData(rows);
					const sections = Object.keys(appointments).sort();

					for (const section of sections) {
						const appointment = appointments[section];
						allPdfData.push({
							title: `Room: ${room}`,
							schedule: appointment,
						});
					}
				} else {
					// Create empty schedule structure for this room
					const emptySchedule = [];
					for (let j = 0; j < days.length; j++) {
						const day = days[j];
						const emptyAppointments = [];
						for (let i = 0; i < 9; i++) {
							emptyAppointments.push({
								colspan: 1,
								initial: "",
								room: "",
								course_id: "",
								section: "",
							});
						}
						emptySchedule.push({
							day: day,
							appointments: emptyAppointments,
						});
					}
					
					// Add the empty schedule
					allPdfData.push({
						title: `Room: ${room}`,
						schedule: emptySchedule,
						isEmpty: true
					});
				}
			} catch (error) {
				console.error(`Error processing room ${roomData.room}:`, error);
			}
		}
		
		// Create PDF even if all schedules are empty
		const filename = await createPDFStd(allPdfData, "All_Rooms", currentSession);
		res.status(200).json({ 
			message: "Consolidated PDF generated successfully for all rooms",
			filename: filename,
			totalCount: allPdfData.length
		});
	} catch (err) {
		next(err);
	}
}

// Serve consolidated PDFs
export async function serveAllLevelTermsPDF(req, res, next) {
	try {
		const filePath = path.join(__dirname, "All_Level_Terms.pdf");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'inline; filename="All_Level_Terms.pdf"');
			const fileStream = fs.createReadStream(filePath);
			fileStream.pipe(res);
		} else {
			res.status(404).json({ message: "PDF not found. Please generate it first." });
		}
	} catch (err) {
		next(err);
	}
}

export async function serveAllTeachersPDF(req, res, next) {
	try {
		const filePath = path.join(__dirname, "All_Teachers.pdf");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'inline; filename="All_Teachers.pdf"');
			const fileStream = fs.createReadStream(filePath);
			fileStream.pipe(res);
		} else {
			res.status(404).json({ message: "PDF not found. Please generate it first." });
		}
	} catch (err) {
		next(err);
	}
}

export async function serveAllRoomsPDF(req, res, next) {
	try {
		const filePath = path.join(__dirname, "All_Rooms.pdf");
		if (fs.existsSync(filePath)) {
			res.setHeader('Content-Type', 'application/pdf');
			res.setHeader('Content-Disposition', 'inline; filename="All_Rooms.pdf"');
			const fileStream = fs.createReadStream(filePath);
			fileStream.pipe(res);
		} else {
			res.status(404).json({ message: "PDF not found. Please generate it first." });
		}
	} catch (err) {
		next(err);
	}
}
