import { Course } from "./types";
import { useNetworkStore } from "@/store/useNetworkStore";

// Premium course objects styled like world-class products (Linear, Notion, Airbnb)
const MOCK_COURSES: Course[] = [
  {
    id: "1",
    title: "Crafting Divine Interfaces like Linear",
    subtitle: "Learn the secrets behind keyboard-centric workflows, dark layouts, and high-performance animation systems.",
    category: "Product Design",
    duration: "6h 45m",
    level: "Advanced",
    rating: 4.9,
    ratingCount: 1840,
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    description: "This course teaches you how to construct extremely premium interfaces with micro-animations that feel human-made. We cover state machines, gesture frameworks, layout springs, and the emotional impact of fine pixel alignments.",
    outline: [
      "1. Emotion in Pixels: Linear's Design Core",
      "2. Implementing the Spring Layout Engine",
      "3. Fluid Drag gestures and Gesture handlers",
      "4. Managing System Dark Mode with NativeWind",
      "5. WebView RPC: Embedding Custom Widgets"
    ],
    enrolledCount: 14202,
    webViewUrl: "https://expo.dev",
    instructor: {
      name: "Sarah Lin",
      role: "Lead Designer, Linear",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    }
  },
  {
    id: "2",
    title: "System Design at Scale: Airbnb Architecture",
    subtitle: "Deep-dive into multi-tier caching, spatial coordinate lookup indices, and hyper-responsive map overlays.",
    category: "Software Engineering",
    duration: "12h 15m",
    level: "Advanced",
    rating: 4.85,
    ratingCount: 3920,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80",
    description: "Learn how Airbnb processes hundreds of thousands of bookings per second. We explore geolocation algorithms, scalable relational patterns, local-first UI updating, and edge rendering networks.",
    outline: [
      "1. Geospatial Databases & Quadtrees",
      "2. Optimistic UI Mutations: Rendering at 60 FPS",
      "3. Local Cache Persistence with synchronous MMKV",
      "4. Dynamic Routing & File structures in Expo Router",
      "5. Graceful Network Retries and Exponential Fallbacks"
    ],
    enrolledCount: 34182,
    webViewUrl: "https://reactnative.dev",
    instructor: {
      name: "Marcus Aurelius",
      role: "Principal Engineer, Airbnb",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    }
  },
  {
    id: "3",
    title: "Advanced Notion Workspaces & Design",
    subtitle: "Unlock complete relational database capabilities, modular blocks, and production tracking setups.",
    category: "Productivity",
    duration: "4h 30m",
    level: "Beginner",
    rating: 4.7,
    ratingCount: 940,
    image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
    description: "Unravel the structure of Notion databases. We establish complex workspace relations, task tracking schemas, rollup calculations, and automation scripts to optimize team productivity.",
    outline: [
      "1. Relational Databases & Rollup Logic",
      "2. Modular Component Tree design",
      "3. Building your First Corporate Wiki",
      "4. Connecting Zapier & Make Automations",
      "5. Local Device Storage: Fallback cache frameworks"
    ],
    enrolledCount: 5410,
    webViewUrl: "https://notion.so",
    instructor: {
      name: "David Notion",
      role: "Head of Workspaces, Notion",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    }
  },
  {
    id: "4",
    title: "React Native Masterclass: Expo SDK 51",
    subtitle: "Construct blazing fast mobile architectures using typescript, reanimated layout loops, and absolute routing controls.",
    category: "Mobile Development",
    duration: "18h 50m",
    level: "Advanced",
    rating: 4.95,
    ratingCount: 5820,
    image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
    description: "Build robust cross-platform mobile systems. This masterclass dives deep into JSI binding bridges, direct native platform access wrappers, strict typing setups, secure token storage, and extreme render loops.",
    outline: [
      "1. strict TypeScript Configuration in Expo SDK 51",
      "2. Core UI Layouts: atomic design systems",
      "3. Performance Optimizations via FlashList",
      "4. Secure storage with Hardware Keys via SecureStore",
      "5. Production Notification systems: local triggers"
    ],
    enrolledCount: 42104,
    webViewUrl: "https://github.com",
    instructor: {
      name: "Jordan Expo",
      role: "Framework Architect, Expo",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    }
  },
  {
    id: "5",
    title: "Mastering Next.js & Edge Functions",
    subtitle: "Build serverless applications with hybrid page rendering, middleware routing filters, and scalable databases.",
    category: "Software Engineering",
    duration: "9h 30m",
    level: "Intermediate",
    rating: 4.8,
    ratingCount: 1420,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80",
    description: "Learn Next.js App Router inside out. Explore server components, data fetching, mutations, local caching, and edge-native persistence layouts.",
    outline: [
      "1. Next.js App Router Foundations",
      "2. Server Components vs Client Components",
      "3. Route Handlers & Server Actions",
      "4. Vercel Edge Middleware Security Controls",
      "5. Hydrating Databases and Caching"
    ],
    enrolledCount: 8900,
    webViewUrl: "https://nextjs.org",
    instructor: {
      name: "Lee Robinson",
      role: "VP of Developer Experience, Vercel",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80"
    }
  },
  {
    id: "6",
    title: "AI Engineering & Large Language Models",
    subtitle: "Integrate vector embeddings, semantic retrieval indexes, and raw chat completions into production nodes.",
    category: "Software Engineering",
    duration: "14h 20m",
    level: "Advanced",
    rating: 4.92,
    ratingCount: 2310,
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=80",
    description: "Construct production-grade cognitive search engines. Master prompt tuning protocols, agent structures, retrieval-augmented pipelines, and token budgeting parameters.",
    outline: [
      "1. Core Large Language Model Mechanics",
      "2. Implementing Semantic Vector Indexes",
      "3. Context Injection & Retrieval Systems (RAG)",
      "4. Designing Stateful Agent Frameworks",
      "5. budget scaling & API latency reduction"
    ],
    enrolledCount: 19800,
    webViewUrl: "https://openai.com",
    instructor: {
      name: "Sam Altman",
      role: "CEO, OpenAI",
      avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80"
    }
  }
];

import { httpClient } from "./httpClient";

const FREE_API_BASE = "https://api.freeapi.app/api/v1";

export const apiClient = {
  async getCourses(): Promise<Course[]> {
    if (!useNetworkStore.getState().isOnline()) {
      console.log("[APIClient] Network offline. Grabbing premium local mock catalog.");
      return MOCK_COURSES;
    }

    try {
      console.log("[APIClient] Hydrating catalog from FreeAPI public endpoints...");
      
      const [productsRes, usersRes] = await Promise.all([
        httpClient.request<{ data: { data: any[] } }>(`${FREE_API_BASE}/public/randomproducts?page=1&limit=8`),
        httpClient.request<{ data: { data: any[] } }>(`${FREE_API_BASE}/public/randomusers?page=1&limit=8`)
      ]);

      const products = productsRes?.data?.data || [];
      const users = usersRes?.data?.data || [];

      if (products.length === 0) {
        throw new Error("No products returned from FreeAPI.");
      }

      // Map dynamic FreeAPI random products/users into rich LMS courses
      const mappedCourses: Course[] = products.map((product, index) => {
        const instructorUser = users[index % users.length] || {
          name: { first: "Alex", last: "Dev" },
          picture: { large: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" }
        };

        const realCourseData = [
          {
            title: "Mastering React Native & Expo",
            subtitle: "Build premium cross-platform mobile apps with buttery smooth animations and native performance.",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80",
            category: "Mobile Development",
            description: "Go from beginner to expert in React Native. This course covers the new architecture, Reanimated, Expo Router, and offline-first state synchronization.",
            outline: [
              "1. Introducing React Native & Expo SDK",
              "2. Building Responsive Layouts with NativeWind",
              "3. Gestures and Animations with Reanimated",
              "4. Fast Offline Caching with MMKV and Zustand",
              "5. Preparing and Deploying to App Stores"
            ]
          },
          {
            title: "Figma UI/UX Design Essentials",
            subtitle: "Learn user interface design, prototyping, and wireframing from scratch with real-world case studies.",
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
            category: "Product Design",
            description: "Master Figma to design beautiful, user-centered websites and mobile apps. Learn components, auto-layout, variables, and prototyping animations.",
            outline: [
              "1. Introduction to UI/UX Design Principles",
              "2. Mastering Figma Components & Auto Layout v5",
              "3. Building Interactive High-Fidelity Prototypes",
              "4. Design Systems: Tokens, Typography, & Grid Systems",
              "5. Handing Off Designs to Developers"
            ]
          },
          {
            title: "System Design & Microservices at Scale",
            subtitle: "Architect highly available, fault-tolerant, and distributed software systems for millions of users.",
            image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80",
            category: "Software Engineering",
            description: "Learn how to design scalable backend architectures. This course covers load balancers, caching strategies, SQL vs NoSQL, and message queues.",
            outline: [
              "1. Key Concepts: Scalability, Availability, & Latency",
              "2. Database Sharding and Read-Replicas",
              "3. Distributed Caching with Redis & Memcached",
              "4. Event-Driven Microservices with Apache Kafka",
              "5. Live Case Study: Designing an System like Netflix"
            ]
          },
          {
            title: "Personal Productivity & Notion Mastery",
            subtitle: "Organize your life, projects, and documents with high-performance workspaces and relational templates.",
            image: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80",
            category: "Productivity",
            description: "Build custom trackers, databases, wikis, and document hubs. Learn to optimize your daily workflows using templates and automation integrations.",
            outline: [
              "1. Building Relational Databases & Custom Views",
              "2. Designing a Modular Workspace Dashboard",
              "3. Advanced Rollups, Formulas, and Database Relations",
              "4. Task Management and Kanban Workflows",
              "5. Automating Notion with Zapier and Make"
            ]
          }
        ];

        const courseDetails = realCourseData[index % realCourseData.length];
        const levels: Course["level"][] = ["Beginner", "Intermediate", "Advanced"];
        
        return {
          id: String(product.id || index + 1),
          title: courseDetails.title,
          subtitle: courseDetails.subtitle,
          category: courseDetails.category,
          duration: `${4 + (index * 3)}h 30m`,
          level: levels[index % levels.length],
          rating: Number((4.6 + (index * 0.1)).toFixed(2)),
          ratingCount: 120 + (index * 340),
          image: courseDetails.image,
          description: courseDetails.description,
          outline: courseDetails.outline,
          enrolledCount: 1400 + (index * 2300),
          webViewUrl: "https://expo.dev",
          instructor: {
            name: `${instructorUser.name.first} ${instructorUser.name.last}`,
            role: "Principal Developer Architect",
            avatar: instructorUser.picture.large
          }
        };
      });

      return mappedCourses;
    } catch (e) {
      console.error("[APIClient] FreeAPI hydration failed. Returning premium local mock catalog:", e);
      return MOCK_COURSES;
    }
  },

  async getCourseById(id: string): Promise<Course> {
    if (!useNetworkStore.getState().isOnline()) {
      const course = MOCK_COURSES.find((c) => c.id === id);
      if (course) return course;
      throw new Error("Course not found in local offline cache.");
    }

    try {
      // Find within active catalog hydration list
      const activeCourses = await this.getCourses();
      const course = activeCourses.find((c) => c.id === id);
      if (course) return course;

      // Fallback search local
      const localCourse = MOCK_COURSES.find((c) => c.id === id);
      if (localCourse) return localCourse;

      throw new Error("Course not found.");
    } catch (e) {
      const course = MOCK_COURSES.find((c) => c.id === id);
      if (course) return course;
      throw new Error("Course not found.");
    }
  },

  async enroll(courseId: string): Promise<{ success: boolean }> {
    console.log("[APIClient] Enrolling in course:", courseId);
    if (!useNetworkStore.getState().isOnline()) {
      throw new Error("Enrollment failed. Network is offline.");
    }
    return { success: true };
  },

  async bookmark(courseId: string): Promise<{ success: boolean }> {
    console.log("[APIClient] Bookmarking course:", courseId);
    if (!useNetworkStore.getState().isOnline()) {
      throw new Error("Bookmark failed. Network is offline.");
    }
    return { success: true };
  }
};
