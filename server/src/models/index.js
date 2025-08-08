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
const Exam = require("./exam.model");
const Question = require("./question.model");
const QuestionOption = require("./question_option.model");
const ExamQuestion = require("./exam_question.model");
const Result = require("./result.model");
const ResultAnswer = require("./result_answer.model");
const ExamProgress = require("./exam_progress.model");

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
  otherKey: "classroom_id",
});
Classroom.belongsToMany(User, {
  through: UserParticipation,
  foreignKey: "classroom_id",
  otherKey: "user_id",
});

// 6. Quan hệ trực tiếp giữa UserParticipation và User, Classroom
UserParticipation.belongsTo(User, { foreignKey: "user_id" });
UserParticipation.belongsTo(Classroom, { foreignKey: "classroom_id" });
User.hasMany(UserParticipation, { foreignKey: "user_id" });

// 7. ChatMessage - UserParticipation (N-1)
UserParticipation.hasMany(ChatMessage, { foreignKey: "participate_id" });
ChatMessage.belongsTo(UserParticipation, { foreignKey: "participate_id" });

// 8. Course -> Classroom (1-N)
Course.hasMany(Classroom, { foreignKey: "course_id" });

// 9. Assignment - UserParticipation (1-N)
UserParticipation.hasMany(Assignment, { foreignKey: "user_participation_id" });
Assignment.belongsTo(UserParticipation, { foreignKey: "user_participation_id" });

// 10. Assignment - User (1-N)
User.hasMany(Assignment, { foreignKey: "user_id" });
Assignment.belongsTo(User, { foreignKey: "user_id" });

// 11. Grade - Assignment (1-N)
Assignment.hasMany(Grade, { foreignKey: "assignment_id" });
Grade.belongsTo(Assignment, { foreignKey: "assignment_id" });

// 12. Lecture - UserParticipation (1-N)
UserParticipation.hasMany(Lecture, { foreignKey: "user_participation_id" });
Lecture.belongsTo(UserParticipation, { foreignKey: "user_participation_id" });

// 13. Lecture - User (1-N)
User.hasMany(Lecture, { foreignKey: "user_id" });
Lecture.belongsTo(User, { foreignKey: "user_id" });

// 14. Assignment - Submission (1-N)
Assignment.hasMany(Submission, { foreignKey: "assignment_id" });
Submission.belongsTo(Assignment, { foreignKey: "assignment_id" });

// 15. Submission - Grade (1-1)
Submission.hasOne(Grade, { foreignKey: "submission_id" });
Grade.belongsTo(Submission, { foreignKey: "submission_id" });

// 16. User - Notification (N-N) --> UserNotification
User.belongsToMany(Notification, {
  through: UserNotification,
  foreignKey: "user_id",
  otherKey: "notification_id",
});
Notification.belongsToMany(User, {
  through: UserNotification,
  foreignKey: "notification_id",
  otherKey: "user_id",
});
UserNotification.belongsTo(User, { foreignKey: "user_id" });
UserNotification.belongsTo(Notification, { foreignKey: "notification_id" });

//chat_message --> chat_message
ChatMessage.belongsTo(ChatMessage, {
  foreignKey: "reply",
  as: "ParentMessage", // Alias cho tin nhắn gốc
});

ChatMessage.hasMany(ChatMessage, {
  foreignKey: "reply",
  as: "Replies", // Alias cho các tin nhắn trả lời
});
// Quan hệ mới với các bảng Exam, Question, Result, v.v.

// 17. Classroom - Exam (1-N)
Classroom.hasMany(Exam, { foreignKey: "classroom_id" });
Exam.belongsTo(Classroom, { foreignKey: "classroom_id" });

// 18. Exam - Question (N-N) --> ExamQuestion
Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: "exam_id" });
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: "question_id" });

// 19. Question - QuestionOption (1-N)
Question.hasMany(QuestionOption, { as: 'options', foreignKey: "question_id" });
QuestionOption.belongsTo(Question, { foreignKey: "question_id" });

// 20. Exam - Result (1-N)
Exam.hasMany(Result, { foreignKey: "exam_id" });
Result.belongsTo(Exam, { foreignKey: "exam_id" });

// 21. UserParticipation - Result (1-N)
UserParticipation.hasMany(Result, { foreignKey: "participate_id" });
Result.belongsTo(UserParticipation, { foreignKey: "participate_id" });

// 22. Result - ResultAnswer (1-N)
Result.hasMany(ResultAnswer, { foreignKey: "result_id" });
ResultAnswer.belongsTo(Result, { foreignKey: "result_id" });

// 23. Question - ResultAnswer (1-N)
Question.hasMany(ResultAnswer, { foreignKey: "question_id" });
ResultAnswer.belongsTo(Question, { foreignKey: "question_id" });

// 24. QuestionOption - ResultAnswer (1-N)
QuestionOption.hasMany(ResultAnswer, { foreignKey: "selected_option_id" });
ResultAnswer.belongsTo(QuestionOption, { foreignKey: "selected_option_id" });

// 25. User - ExamProgress (1-N)
User.hasMany(ExamProgress, { foreignKey: 'user_id' });
ExamProgress.belongsTo(User, { foreignKey: 'user_id' });

// 26. Exam - ExamProgress (1-N)
Exam.hasMany(ExamProgress, { foreignKey: 'exam_id' });
ExamProgress.belongsTo(Exam, { foreignKey: 'exam_id' });
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
  Exam,
  Question,
  QuestionOption,
  ExamQuestion,
  Result,
  ResultAnswer,
  ExamProgress
};