import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./privateRoute"; // Import PrivateRoute
import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";
import { Login } from "../pages/auth/Login";
import { Dashboard } from "../pages/admin/Dashboard";

import UserHome from "../pages/users/UserHome";

import Schedule from "../pages/users/Schedule";
import Course from "../pages/users/Course";
import CourseDetail from "../pages/users/CourseDetail";
import Message from "../pages/users/Message";
import Lectures from "../pages/users/Lectures";
import Member from "../pages/users/Member";
import Assigments from "../pages/users/Assigments";
import GradeSubmission from "../pages/instructor/GradeSubmission";

import { StudentsManager } from "../pages/admin/StudentsManager";
import { InstructorsManager } from "../pages/admin/InstructorsManager";
import { CoursesManager } from "../pages/academicAffairs/CoursesManager";
import { ClassesManager } from "../pages/academicAffairs/ClassesManager";
import { AssignmentManager } from "../pages/academicAffairs/AssignmentManager";
import UnAssigmentManager from "../pages/academicAffairs/UnAssigmentManager";
import AssignedClassroomManager from "../pages/academicAffairs/AssignedClassroomManager";

import { Profile } from "../pages/users/Profile";
import TeachSchedule from "../pages/users/TeachSchedule";
import Classroom from "../components/users/Classroom";
import Subject from "../pages/instructor/Subjects";
import AddStudentToClass from "../pages/academicAffairs/addStudentToClass";
import { NotFound } from "../pages/errors/NotFound";
import EduAffairLayout from "../layouts/EduAffairLayout";
import GradeManagement from "../pages/instructor/GradeManagement";
import TakeExamPage from "../pages/users/TakeExamPage";
import ExamResultPage from "../pages/users/ExamResultPage";
import ListExams from "../pages/users/ListExams";
import Landing from "../pages/landingpage";

import CreateExam from "../pages/instructor/CreateExam";
import ExamResults from "../pages/instructor/ExamResults";
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/dashboard" element={<Landing />} />
      {/* Route cho Admin */}
      <Route path="/admin" element={<PrivateRoute allowedRoles={[3]} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="manager-students" element={<StudentsManager />} />
          <Route path="manager-instructors" element={<InstructorsManager />} />
        </Route>
      </Route>

      {/**Route cho giáo vụ */}
      <Route path="/eduAffair" element={<PrivateRoute allowedRoles={[4]} />}>
        <Route element={<EduAffairLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="manager-courses" element={<CoursesManager />} />
          <Route path="manager-classes" element={<ClassesManager />} />
          <Route path="manager-assign" element={<AssignmentManager />} />

          <Route
            path="manager-assign/unassigned-classrooms"
            element={<UnAssigmentManager />}
          />
          <Route
            path="manager-assign/assigned-classrooms"
            element={<AssignedClassroomManager />}
          />
          <Route
            path="manager-assign/add-student-to-class"
            element={<AddStudentToClass />}
          />
        </Route>
      </Route>

      {/* Route cho User (Student và Instructor) */}
      <Route path="/" element={<PrivateRoute allowedRoles={[1, 2]} />}>
        <Route element={<UserLayout />}>
          <Route index element={<UserHome />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/subjects" element={<Subject />} />
          <Route path="/teaching-schedule" element={<TeachSchedule />} />
          <Route path="classroom/:classroomId" element={<Classroom />} />
          <Route path="courses" element={<Course />} />
          <Route path="courseDetail/:classroomId" element={<CourseDetail />}>
            <Route index element={<Message />} />
            <Route path="messages" element={<Message />} />
            <Route path="members" element={<Member />} />
            <Route path="assignments" element={<Assigments />} />
            <Route path="lectures" element={<Lectures />} />
            <Route path="grades" element={<GradeManagement />} />
            <Route path="list-exam" element={<ListExams />} />
            <Route path="create-exam" element={<CreateExam />} />
            <Route path="exam-results" element={<ExamResults />} />
            <Route path="exam-results/:examId" element={<ExamResults />} />
          </Route>
          <Route path="exam/:examId" element={<TakeExamPage />} />
          <Route path="exam/:examId/result" element={<ExamResultPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route
            path="/assignments/:assignmentId/grade"
            element={<GradeSubmission />}
          />
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
