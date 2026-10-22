export type Role = "USER" | "ADMIN";

export type User = {
  id: number;
  name: string;
  email: string;
  pictureUrl: string | null;
  role: Role;
};

export type Exam = { id: number; name: string; description: string | null };
export type Topic = { id: number; name: string; subjectId: number };
export type Subject = { id: number; name: string; topics: Topic[] };
export type Syllabus = { id: number; name: string; subjects: Subject[] };
export type ProgressStatus = "NOT_STARTED" | "LEARNING" | "REVISING" | "DONE";
export type Progress = { topicId: number; topicName: string; status: ProgressStatus; updatedAt: string };
