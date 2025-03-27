// Mock data for tests
const mockUser = {
  student: {
    user_id: 1,
    username: 'test_student',
    fullname: 'Test Student',
    email: 'student@test.com',
    password: 'Password123',
    role_id: 1
  },
  teacher: {
    user_id: 2,
    username: 'test_teacher',
    fullname: 'Test Teacher',
    email: 'teacher@test.com',
    password: 'Password123',
    role_id: 2
  },
  admin: {
    user_id: 3,
    username: 'test_admin',
    fullname: 'Test Admin',
    email: 'admin@test.com',
    password: 'Password123',
    role_id: 3
  }
};

const mockCourse = {
  course_id: 1,
  course_name: 'Test Course',
  course_code: 'TC101',
  description: 'This is a test course description',
  course_img: 'img1'
};

const mockClassroom = {
  classroom_id: 1,
  class_id: 1,
  course_id: 1,
  status_id: 1,
  start_date: new Date('2023-01-01'),
  end_date: new Date('2023-12-31'),
  max_capacity: 30
};

const mockAssignment = {
  assignment_id: 1,
  user_participation_id: 1,
  title: 'Test Assignment',
  description: 'This is a test assignment',
  user_id: 2, // Teacher
  file_path: JSON.stringify(['test/file/path.pdf']),
  start_assignment: new Date('2023-03-01'),
  end_assignment: new Date('2023-03-15')
};

const mockSubmission = {
  submission_id: 1,
  assignment_id: 1,
  user_id: 1, // Student
  file_path: JSON.stringify(['test/submission/file.pdf']),
  submitted_at: new Date('2023-03-10'),
  status: 'pending'
};

module.exports = {
  mockUser,
  mockCourse,
  mockClassroom,
  mockAssignment,
  mockSubmission
};
