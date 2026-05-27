export interface Course {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  ratingCount: number;
  image: string;
  description: string;
  outline: string[];
  enrolledCount: number;
  webViewUrl: string;
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  coursesEnrolled: number;
}
