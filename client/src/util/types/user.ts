/**
 * Interface for the user data type return from the backend
 */
interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'teacher' | 'admin' | 'speaker';
  admin: boolean;
}

interface ISpeaker {
  _id: string;
  firstName: string;
  lastName: string;
  bio: string;
  email: string;
  title: string;
  organization: string;
  personalSite: string;
  industryFocus: string[];
  areaOfExpertise: string[];
  ageGroup: string;
  location: string;
  speakingFormat: string;
  languages: string[];
  available: string[];
}

interface ITeacher {
  _id: string;
  userId: string;
  school: string;
  location: string;
}

interface ITeacherDetails {
  department: string;
  subjects: string[];
  officeHours?: string;
  officeLocation?: string;
}

interface IStudentDetails {
  studentId: string;
  grade: number;
  enrollmentDate: Date;
  courses: string[];
}

export type { IUser, ISpeaker, ITeacher, ITeacherDetails, IStudentDetails };
