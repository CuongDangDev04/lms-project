const sequelize = require("../config/db");
const User = require("./user.model");
const Class = require("./class.model");
const Course = require("./course.model");
const ChatMessage = require("./chat_message.model");
const Role = require("./role.model");
const Classroom = require("./classroom.model");
const ClassStatus = require("./class_status.model");
const UserParticipation = require("./user_participation.model");
const Schedule = require("./schedule.model");
const Assignment = require("./assignment.model");
const Grade = require("./grade.model");
const Lecture = require("./lecture.model");
const Submission = require("./submission.model");
const UserNotification = require("./user_notification.model");
const Notification = require("./notification.model");

// 1. User - Role (1-N)
Role.hasMany(User, { foreignKey: "role_id" });
User.belongsTo(Role, { foreignKey: "role_id" });

// 2. Class - Course (N-N) --> Classroom
Class.belongsToMany(Course, {
  through: Classroom,
  foreignKey: "class_id",
  otherKey: "course_id",
});
Course.belongsToMany(Class, {
  through: Classroom,
  foreignKey: "course_id",
  otherKey: "class_id",
});

Classroom.belongsTo(Class, { foreignKey: "class_id" });
Classroom.belongsTo(Course, { foreignKey: "course_id" });

// 3. Classroom - ClassStatus (1-N)
ClassStatus.hasMany(Classroom, { foreignKey: "status_id" });
Classroom.belongsTo(ClassStatus, { foreignKey: "status_id" });

// 4. Schedule - Classroom (1-N)
Classroom.hasMany(Schedule, { foreignKey: "classroom_id" });
Schedule.belongsTo(Classroom, { foreignKey: "classroom_id" });

// 5. User - Classroom (N-N) --> UserParticipation
User.belongsToMany(Classroom, {
  through: UserParticipation,
  foreignKey: "user_id",
  otherKey: "classroom_id"
});
Classroom.belongsToMany(User, {
  through: UserParticipation,
  foreignKey: "classroom_id",
  otherKey: "user_id",
});

// 6. Quan hệ trực tiếp giữa UserParticipation và User, Classroom
UserParticipation.belongsTo(User, {
  foreignKey: "user_id"
});
UserParticipation.belongsTo(Classroom, {
  foreignKey: "classroom_id"
});

User.hasMany(UserParticipation, { foreignKey: "user_id" });
UserParticipation.belongsTo(User, { foreignKey: "user_id" });
// 8. ChatMessage - UserParticipation (N-1)
UserParticipation.hasMany(ChatMessage, { foreignKey: "participate_id" });
ChatMessage.belongsTo(UserParticipation, { foreignKey: "participate_id" });

// Course -> Classroom (1 - N)
Course.hasMany(Classroom, { foreignKey: 'course_id' });

// 9. Assignment - UserParticipation (1-N)
UserParticipation.hasMany(Assignment, { foreignKey: "user_participation_id" });
Assignment.belongsTo(UserParticipation, { foreignKey: "user_participation_id" });

// 10. Assignment - User (1-N)
User.hasMany(Assignment, { foreignKey: "user_id" });
Assignment.belongsTo(User, { foreignKey: "user_id" });



// 13. Grade - Assignment (1-N)
Assignment.hasMany(Grade, { foreignKey: "assignment_id" });
Grade.belongsTo(Assignment, { foreignKey: "assignment_id" });

// 14. Lecture - UserParticipation (1-N)
UserParticipation.hasMany(Lecture, { foreignKey: 'user_participation_id' });
Lecture.belongsTo(UserParticipation, { foreignKey: 'user_participation_id' });

// 15. Lecture - User (1-N)
User.hasMany(Lecture, { foreignKey: 'user_id' });
Lecture.belongsTo(User, { foreignKey: 'user_id' });

// Quan hệ Assignment - Submission
Assignment.hasMany(Submission, { foreignKey: "assignment_id" });
Submission.belongsTo(Assignment, { foreignKey: "assignment_id" });

// Quan hệ Submission - Grade
Submission.hasOne(Grade, { foreignKey: "submission_id" });
Grade.belongsTo(Submission, { foreignKey: "submission_id" });

// Quan hệ Assignment - Grade
Assignment.hasMany(Grade, { foreignKey: "assignment_id" });
Grade.belongsTo(Assignment, { foreignKey: "assignment_id" });

//9. User - Notification (1-N)
// Thiết lập quan hệ
User.belongsToMany(Notification, {
  through: "UserNotification",
  foreignKey: "user_id",
  otherKey: "notification_id",
});
Notification.belongsToMany(User, {
  through: "UserNotification",
  foreignKey: "notification_id",
  otherKey: "user_id",
});
UserNotification.belongsTo(User, { foreignKey: "user_id" });
UserNotification.belongsTo(Notification, { foreignKey: "notification_id" });

module.exports = {
  sequelize,
  User,
  Role,
  Class,
  Course,
  ChatMessage,
  Classroom,
  ClassStatus,
  UserParticipation,
  Schedule,
  Assignment,
  Grade,
  Lecture,
  Submission,
  Notification,
  UserNotification,
};
