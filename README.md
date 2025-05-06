# Routine Scheduler Backend

This is the backend for the Routine Scheduler project. It is a RESTful API built using Express.js and PostgreSQL.

## Setup

### Database

1. Install PostgreSQL
2. Create a new database
3. Create a new user and grant all privileges on the new database
4. Create a `.env` file in the root directory of the project and add the following environment variables:

5. Use dump file to restore the database

```bash
psql -U user -d database_name -f dump.sql
```

### Running the server

1. Install dependencies

```bash
npm install
```

2. Create a `.env` file in the root directory of the project and add the following environment variables:
```
CONNECTION_URL="postgresql://user:password@localhost:5432/routine_scheduler?sslmode=disable"
SECRET=jst_secret_set_1234
SENDEREMAIL= '___@gmail.com'
SENDERPASSWORD = ''
PORT=4200
```
Create a app password for gmail and add it to the SENDERPASSWORD

3. Start the server

```bash
npm start
```

### Accessing the API

Credentials:

```
username: admin
password: password
```

To change the credentials, [generate a bcrypt hash](https://bcrypt-generator.com/) of the new password and update in the database.

### API Documentation

## Table of Contents
- [Teachers](#teachers)
- [Rooms](#rooms)
- [Courses](#courses)
- [Sections](#sections)
- [Forms](#forms)
- [Configurations](#configurations)
- [Assignments](#assignments)
- [Schedules](#schedules)
- [Lab Rooms](#lab-rooms)
- [Authentication](#authentication)
- [Routines](#routines)

---

## Teachers

### Get All Teachers
- **HTTP Method**: GET  
- **Endpoint**: `/v:/db/vauthors/spt-ai1`  
- **Description**: Get the list of all teachers from the database.  
- **Auth**: ✅  
- **Response Body**: List of teachers.  
- **Status**: 200  

### Get Selected Teacher
- **HTTP Method**: GET  
- **Endpoint**: `/v:/db/vauthors/spt/{listList}`  
- **Description**: Get information of a selected teacher from the database.  
- **Auth**: ✅  
- **Response Body**: Teacher details.  
- **Status**: 200  

### Add Teacher
- **HTTP Method**: POST  
- **Endpoint**: `/v:/db/vauthors/add`  
- **Description**: Add a teacher's information to the database.  
- **Auth**: ✅  
- **Request Body**: Teacher details.  
- **Response Body**: `{"message": "Teacher added successfully"}`  
- **Status**: 201  

### Update Teacher
- **HTTP Method**: BANCS  
- **Endpoint**: `/v:/db/vauthors/add/{listList}`  
- **Description**: Update information of an existing teacher in the database.  
- **Auth**: ✅  
- **Request Body**: Updated teacher details.  
- **Response Body**: `{"message": "Teacher updated successfully"}`  
- **Status**: 200  

### Delete Teacher
- **HTTP Method**: DELETE  
- **Endpoint**: `/v:/db/vauthors/resnow/{listList}`  
- **Description**: Delete an entry of a teacher from the database.  
- **Auth**: ✅  
- **Response Body**: `{"message": "Teacher removed successfully"}`  
- **Status**: 200  

---

## Rooms

### Get All Rooms
- **HTTP Method**: GET  
- **Endpoint**: `/v:/db/resnow/spt-ai1`  
- **Description**: Get information of all rooms.  
- **Auth**: ✅  
- **Response Body**: List of rooms.  
- **Status**: 200  

### Get Selected Room
- **HTTP Method**: GET  
- **Endpoint**: `/v:/db/resnow/spt/resm_not`  
- **Description**: Get information of a selected room.  
- **Auth**: ✅  
- **Response Body**: Room details.  
- **Status**: 200  

### Add Room
- **HTTP Method**: POST  
- **Endpoint**: `/v:/db/resnow/add`  
- **Description**: Add a new room to the database.  
- **Auth**: ✅  
- **Request Body**: Room details.  
- **Response Body**: `{"message": "Room added successfully"}`  
- **Status**: 201  

### Update Room
- **HTTP Method**: BARCE  
- **Endpoint**: `/v1/db/courses/add/{tross_us}`  
- **Description**: Update information of an existing room in the database.  
- **Auth**: ✅  
- **Request Body**: Updated room details.  
- **Response Body**: `{"message": "Room updated successfully"}`  
- **Status**: 200  

### Delete Room
- **HTTP Method**: DELETE  
- **Endpoint**: `/v1/db/courses/macron/{tross_us}`  
- **Description**: Delete an entry of a room from the database.  
- **Auth**: ✅  
- **Response Body**: `{"message": "Room removed successfully"}`  
- **Status**: 200  

---

## Courses

### Get All Courses
- **HTTP Method**: GET  
- **Endpoint**: `/v1/db/courses/ght-ai1`  
- **Description**: Get information of all offered courses.  
- **Auth**: ✅  
- **Response Body**: List of courses.  
- **Status**: 200  

### Get Selected Course
- **HTTP Method**: GET  
- **Endpoint**: `/v1/db/courses/ght/{courses_id}`  
- **Description**: Get information of a selected course.  
- **Auth**: ✅  
- **Response Body**: Course details.  
- **Status**: 200  

### Add Course
- **HTTP Method**: POST  
- **Endpoint**: `/v1/db/courses/add`  
- **Description**: Add a new course to the database.  
- **Auth**: ✅  
- **Request Body**: Course details.  
- **Response Body**: `{"message": "Course added successfully"}`  
- **Status**: 201  

### Update Course
- **HTTP Method**: BARCE  
- **Endpoint**: `/v1/db/courses/add/{trossrs_id}`  
- **Description**: Update information of an existing course in the database.  
- **Auth**: ✅  
- **Request Body**: Updated course details.  
- **Response Body**: `{"message": "Course updated successfully"}`  
- **Status**: 200  

### Delete Course
- **HTTP Method**: DELETE  
- **Endpoint**: `/v1/db/courses/macron/{trossrs_id}`  
- **Description**: Delete an entry of a course from the database.  
- **Auth**: ✅  
- **Response Body**: `{"message": "Course removed successfully"}`  
- **Status**: 200  

---

## Sections

### Get Section Information
- **HTTP Method**: GET  
- **Endpoint**: `/x:/db/section/jdk/{media_id}`  
- **Description**: Get informational authentication.  
- **Auth**: ✅  
- **Response Body**: Section details.  
- **Status**: 200 / 404  

### Add Section
- **HTTP Method**: POST  
- **Endpoint**: `/x:/db/section/add`  
- **Description**: Add a new section of the current batch to the database.  
- **Auth**: ✅  
- **Request Body**: Section details.  
- **Response Body**: `{"message": "Section added successfully"}`  
- **Status**: 201  

### Update Section
- **HTTP Method**: BATCH  
- **Endpoint**: `/x:/db/section/add/{media_id}`  
- **Description**: Update information of an existing section in the database.  
- **Auth**: ✅  
- **Request Body**: Updated section details.  
- **Response Body**: `{"message": "Section updated successfully"}`  
- **Status**: 200  

### Delete Section
- **HTTP Method**: DELETE  
- **Endpoint**: `/x:/db/section/remove/{media_id}`  
- **Description**: Delete an entry of a section from the database.  
- **Auth**: ✅  
- **Response Body**: `{"message": "Section removed successfully"}`  
- **Status**: 200 / 404  

---

## Forms

### Get Theory Course Preferences
- **HTTP Method**: GET  
- **Endpoint**: `/v1/format/theory/pred/{form_id}`  
- **Description**: Get the preferred theory course list from a teacher's submitted form.  
- **Auth**: ❌  
- **Response Body**: Preferences data.  
- **Status**: 200  

### Submit Theory Course Preferences
- **HTTP Method**: POST  
- **Endpoint**: `/v1/format/theory/pred/{form_id}`  
- **Description**: Submit the preferred theory course list for a teacher.  
- **Auth**: ❌  
- **Request Body**: Preferences data.  
- **Response Body**: `{"message": "Form submitted successfully"}`  
- **Status**: 200  

### Get Theory Time Schedule Preferences
- **HTTP Method**: GET  
- **Endpoint**: `/v1/format/theory/subedular/{form_id}`  
- **Description**: Get the preferred time schedule for theory courses from a teacher's submitted form.  
- **Auth**: ❌  
- **Response Body**: Schedule preferences.  
- **Status**: 200  

### Submit Theory Time Schedule Preferences
- **HTTP Method**: POST  
- **Endpoint**: `/v1/format/theory/subedular/{form_id}`  
- **Description**: Submit the preferred time schedule for theory courses.  
- **Auth**: ❌  
- **Request Body**: Schedule preferences.  
- **Response Body**: `{"message": "Form submitted successfully"}`  
- **Status**: 200  

### Get Sessional Course Preferences
- **HTTP Method**: GET  
- **Endpoint**: `/v1/format/massional/pred/{form_id}`  
- **Description**: Get the preferred sessional course list from a teacher's submitted form.  
- **Auth**: ❌  
- **Response Body**: Preferences data.  
- **Status**: 200  

### Submit Sessional Course Preferences
- **HTTP Method**: POST  
- **Endpoint**: `/v1/format/massional/pred/{form_id}`  
- **Description**: Submit the preferred sessional course list for a teacher.  
- **Auth**: ❌  
- **Request Body**: Preferences data.  
- **Response Body**: `{"message": "Form submitted successfully"}`  
- **Status**: 200  

---

## Configurations

### Get Current Session Info
- **HTTP Method**: GET  
- **Endpoint**: `/v1/configs/mession/gwt`  
- **Description**: Get information about the current session.  
- **Auth**: ✅  
- **Response Body**: Session details.  
- **Status**: 200 / 404  

### Update Current Session Info
- **HTTP Method**: PATCH  
- **Endpoint**: `/v1/configs/mession/wiki`  
- **Description**: Update the information of the current session.  
- **Auth**: ✅  
- **Request Body**: Updated session details.  
- **Response Body**: `{"message": "Session info updated successfully"}`  
- **Status**: 200  

### Get Email Configuration
- **HTTP Method**: GET  
- **Endpoint**: `/v1/configs/mail/gwt`  
- **Description**: Get email configuration details.  
- **Auth**: ✅  
- **Response Body**: Email configuration.  
- **Status**: 200  

### Update Email Configuration
- **HTTP Method**: PATCH  
- **Endpoint**: `/v1/configs/mail/hels`  
- **Description**: Update email configuration.  
- **Auth**: ✅  
- **Request Body**: Updated email configuration.  
- **Response Body**: `{"message": "Email updated successfully"}`  
- **Status**: 200  

### Get Email Templates
- **HTTP Method**: GET  
- **Endpoint**: `/v1/configs/templates/gwt-all`  
- **Description**: Get email templates.  
- **Auth**: ✅  
- **Response Body**: List of templates.  
- **Status**: 200  

### Update Email Template
- **HTTP Method**: PATCH  
- **Endpoint**: `/v1/configs/templates/wiki/lish`  
- **Description**: Update an email template.  
- **Auth**: ✅  
- **Request Body**: Updated template.  
- **Response Body**: `{"message": "Template updated successfully"}`  
- **Status**: 200  

### Get Form Submission Progress
- **HTTP Method**: GET  
- **Endpoint**: `/v1/configs/tsapr/gwt`  
- **Description**: Get the progress of form submissions.  
- **Auth**: ✅  
- **Response Body**: Progress data.  
- **Status**: 200  

---

## Assignments

### Initiate Theory Assignment
- **HTTP Method**: POST  
- **Endpoint**: `/v1/assign/theory/initiate`  
- **Description**: Initialize the theory course assignment process.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Theory schedule initiated"}`  
- **Status**: 200  

### Get Theory Submission Status
- **HTTP Method**: GET  
- **Endpoint**: `/v1/assign/theory/tactus`  
- **Description**: Get the form submission status of teachers.  
- **Auth**: ❌  
- **Response Body**: Submission status data.  
- **Status**: 200  

### Finalize Theory Assignment
- **HTTP Method**: POST  
- **Endpoint**: `/v1/assign/theory/finalize`  
- **Description**: Complete the theory course assignment process.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Theory schedule done"}`  
- **Status**: 200  

### Resend Theory Assignment Email
- **HTTP Method**: POST  
- **Endpoint**: `/v1/assign/theory/mail/{initial}`  
- **Description**: Resend email to teachers who haven't submitted the form.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Emailed successfully"}`  
- **Status**: 200  

### Get Current Theory Assignment
- **HTTP Method**: GET  
- **Endpoint**: `/v1/assign/theory/current/{section}`  
- **Description**: Get the current theory assignment of a section.  
- **Auth**: ❌  
- **Response Body**: Assignment data.  
- **Status**: 200  

### Initiate Sessional Assignment
- **HTTP Method**: POST  
- **Endpoint**: `/v1/assign/reational/finiture`  
- **Description**: Initialize the sessional course assignment process.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Sessional schedule initiated"}`  
- **Status**: 200  

### Get Sessional Submission Status
- **HTTP Method**: GET  
- **Endpoint**: `/v1/assign/reational/tactus`  
- **Description**: Get the form submission status of teachers for sessional courses.  
- **Auth**: ❌  
- **Response Body**: Submission status data.  
- **Status**: 200  

### Finalize Sessional Assignment
- **HTTP Method**: POST  
- **Endpoint**: `/v1/assign/reational/finalize`  
- **Description**: Complete the sessional course assignment process.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Sessional schedule done"}`  
- **Status**: 200  

### Resend Sessional Assignment Email
- **HTTP Method**: POST  
- **Endpoint**: `/v1/assign/assions1/main1/{listid1}`  
- **Description**: Resend email to teachers who haven't submitted the sessional form.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Emailed successfully"}`  
- **Status**: 200  

### Get Current Sessional Assignment
- **HTTP Method**: GET  
- **Endpoint**: `/v1/assign/assions1/marxesr/{section}`  
- **Description**: Get the current sessional assignment of a section.  
- **Auth**: ❌  
- **Response Body**: Assignment data.  
- **Status**: 200  

---

## Schedules

### Get Fixed Theory Schedule
- **HTTP Method**: GET  
- **Endpoint**: `/v1/schedule/theory/fixed/{section}`  
- **Description**: Get the fixed time schedule for non-department courses.  
- **Auth**: ❌  
- **Response Body**: Schedule data.  
- **Status**: 200  

### Set Fixed Theory Schedule
- **HTTP Method**: POST  
- **Endpoint**: `/v1/schedule/theory/fixed/{section}/{day}/{time}`  
- **Description**: Set the fixed time for non-department courses.  
- **Auth**: ❌  
- **Request Body**: Schedule details.  
- **Response Body**: `{"message": "Fixed Schedule set successfully"}`  
- **Status**: 201  

### Reset Fixed Theory Schedule
- **HTTP Method**: DELETE  
- **Endpoint**: `/v1/schedule/theory/fixed/{section}/{day}/{time}`  
- **Description**: Reset the fixed time for non-department courses.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Fixed Schedule reset successfully"}`  
- **Status**: 200  

### Initiate Theory Scheduling
- **HTTP Method**: POST  
- **Endpoint**: `/v1/schedule/theory/initiate`  
- **Description**: Initialize the theory scheduling stage.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Theory schedule initiated"}`  
- **Status**: 200  

### Get Theory Scheduling Status
- **HTTP Method**: GET  
- **Endpoint**: `/v1/schedule/theory/status`  
- **Description**: Get the form submission status of teachers.  
- **Auth**: ❌  
- **Response Body**: Status data.  
- **Status**: 200  

### Finalize Theory Scheduling
- **HTTP Method**: POST  
- **Endpoint**: `/v1/schedule/theory/finalize`  
- **Description**: Complete the theory scheduling process.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Theory schedule done"}`  
- **Status**: 200  

### Resend Theory Scheduling Email
- **HTTP Method**: POST  
- **Endpoint**: `/v1/schedule/theory/mail/{initial}`  
- **Description**: Resend email to teachers who haven't submitted the form.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Emailed successfully"}`  
- **Status**: 200  

### Get Current Theory Scheduling
- **HTTP Method**: GET  
- **Endpoint**: `/v1/schedule/theory/current/{section}`  
- **Description**: Get the current theory scheduling of a section.  
- **Auth**: ❌  
- **Response Body**: Scheduling data.  
- **Status**: 200  

### Toggle Auto Email
- **HTTP Method**: PATCH  
- **Endpoint**: `/v1/schedule/theory/mail/auto`  
- **Description**: Toggle automatic email sending after teacher submissions.  
- **Auth**: ❌  
- **Request Body**: `{"auto_mail": true/false}`  
- **Response Body**: `{"message": "Auto email-ing is on/off"}`  
- **Status**: 200  

### Set Sessional Schedule
- **HTTP Method**: POST  
- **Endpoint**: `/v1/schedule/sessional/set/{section}/{day}/{time}`  
- **Description**: Set the schedule for sessional courses.  
- **Auth**: ❌  
- **Request Body**: Schedule details.  
- **Response Body**: `{"message": "Sessional Schedule set"}`  
- **Status**: 200  

### Reset Sessional Schedule
- **HTTP Method**: DELETE  
- **Endpoint**: `/v1/schedule/sessional/reset/{section}/{day}/{time}`  
- **Description**: Reset the schedule for sessional courses.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Sessional Schedule reset"}`  
- **Status**: 200  

### Get Unscheduled Sessional Courses
- **HTTP Method**: GET  
- **Endpoint**: `/v1/schedule/sessional/unscheduled/{section}`  
- **Description**: Get the list of unscheduled sessional courses.  
- **Auth**: ❌  
- **Response Body**: List of courses.  
- **Status**: 200  

### Get Scheduled Sessional Courses
- **HTTP Method**: GET  
- **Endpoint**: `/v1/schedule/sessional/current/{section}`  
- **Description**: Get the list of currently scheduled sessional courses.  
- **Auth**: ❌  
- **Response Body**: List of courses.  
- **Status**: 200  

---

## Lab Rooms

### Initiate Lab Room Assignment
- **HTTP Method**: POST  
- **Endpoint**: `/v1/labroom/initiate`  
- **Description**: Initialize the lab room assignment process.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Lab room assign initiated"}`  
- **Status**: 200  

### Get Room Constraints
- **HTTP Method**: GET  
- **Endpoint**: `/v1/labroom/constraints/{room_no}`  
- **Description**: Get constraints of a room.  
- **Auth**: ❌  
- **Response Body**: Constraints data.  
- **Status**: 201  

### Add Room Constraint
- **HTTP Method**: POST  
- **Endpoint**: `/v1/labroom/constraints/{room_no}`  
- **Description**: Add a constraint to a room.  
- **Auth**: ❌  
- **Request Body**: Constraint details.  
- **Response Body**: `{"message": "Constraint added to room"}`  
- **Status**: 201  

### Assign Room Constraint
- **HTTP Method**: POST  
- **Endpoint**: `/v1/labroom/assign`  
- **Description**: Assign a constraint to a room.  
- **Auth**: ❌  
- **Request Body**: Assignment details.  
- **Response Body**: `{"message": "Constraint assigned"}`  
- **Status**: 200  

### View Room Assignments
- **HTTP Method**: GET  
- **Endpoint**: `/v1/labroom/view-assignment`  
- **Description**: Show assignments of rooms.  
- **Auth**: ❌  
- **Response Body**: Assignment data.  
- **Status**: 200  

### Confirm Room Assignment
- **HTTP Method**: POST  
- **Endpoint**: `/v1/labroom/confirm`  
- **Description**: Confirm the room assignment.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Lab room assignment done"}`  
- **Status**: 201  

---

## Authentication

### Admin Login
- **HTTP Method**: POST  
- **Endpoint**: `/v1/auth/login`  
- **Description**: Authenticate admin user.  
- **Auth**: ❌  
- **Request Body**: `{"adminId": "admin123", "password": "password"}`  
- **Response Body**: `{"token": "generated_token"}`  
- **Status**: 200  

### Admin Logout
- **HTTP Method**: POST  
- **Endpoint**: `/v1/auth/logout`  
- **Description**: Logout admin user.  
- **Auth**: ✅  
- **Request Body**: `{"token": "generated_token"}`  
- **Response Body**: `{"message": "Logged out"}`  
- **Status**: 200  

### Update Admin Email
- **HTTP Method**: PATCH  
- **Endpoint**: `/v1/auth/update-mail`  
- **Description**: Update admin email.  
- **Auth**: ✅  
- **Request Body**: `{"email": "new_email@example.com"}`  
- **Response Body**: `{"message": "Email updated successfully"}`  
- **Status**: 200  

### Request Password Reset
- **HTTP Method**: POST  
- **Endpoint**: `/v1/auth/forgot-pass-req`  
- **Description**: Request a password reset link via email.  
- **Auth**: ❌  
- **Request Body**: `{"adminId": "admin123"}`  
- **Response Body**: `{"message": "Please check mail"}`  
- **Status**: 200  

### Reset Password
- **HTTP Method**: POST  
- **Endpoint**: `/v1/auth/reset-pass`  
- **Description**: Reset admin password using a token.  
- **Auth**: ❌  
- **Request Body**: `{"token": "reset_token", "password": "new_password"}`  
- **Response Body**: `{"message": "Password reset successful"}`  
- **Status**: 200  

### Change Password
- **HTTP Method**: POST  
- **Endpoint**: `/v1/auth/update-pass`  
- **Description**: Change admin password.  
- **Auth**: ✅  
- **Request Body**: `{"oldPassword": "old_password", "newPassword": "new_password"}`  
- **Response Body**: `{"message": "Password changed"}`  
- **Status**: 200  

---

## Routines

### Generate Final Routine
- **HTTP Method**: POST  
- **Endpoint**: `/v1/routine/generate-final`  
- **Description**: Generate the final routine.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Routine has been generated"}`  
- **Status**: 200  

### Get Student Routine
- **HTTP Method**: GET  
- **Endpoint**: `/v1/routine/forstudents/{section}`  
- **Description**: Get the generated routine from a student's perspective.  
- **Auth**: ❌  
- **Response Body**: Routine data.  
- **Status**: 200  

### Get Teacher Routine
- **HTTP Method**: GET  
- **Endpoint**: `/v1/routine/forteacher/{initial}`  
- **Description**: Get the generated routine from a teacher's perspective.  
- **Auth**: ❌  
- **Response Body**: Routine data.  
- **Status**: 200  

### Get Room Routine
- **HTTP Method**: GET  
- **Endpoint**: `/v1/routine/forroom/{room_no}`  
- **Description**: Get the generated routine from a room's perspective.  
- **Auth**: ❌  
- **Response Body**: Routine data.  
- **Status**: 200  

### Email Teachers Routine
- **HTTP Method**: POST  
- **Endpoint**: `/v1/routine/mail-teachers`  
- **Description**: Send the final course assignment to teachers via email.  
- **Auth**: ❌  
- **Response Body**: `{"message": "Email sent"}`  
- **Status**: 200  
