React Native Expo Developer Assignment

Overview
Build a Mini LMS Mobile App using React Native Expo that demonstrates proficiency in native features, WebView integration, and state management.

API Base: https://api.freeapi.app/

About This Assignment

We are seeking highly skilled and motivated React Native developers proficient in modern mobile development. Candidates must be adept at building efficient, scalable, and secure mobile applications using React Native Expo, including asynchronous programming, API integration, native module implementation, state management, and performance optimization.

What We Expect From You
We don't expect a basic mobile app with simple API calls. We want you to showcase your intellect and approach to developing impactful mobile applications, demonstrating sophisticated problem-solving and innovative solutions that go beyond technical proficiency. Your project should reflect critical thinking, analytical capabilities, and strategic design for valuable, transformative mobile experiences, from ideation to scalable implementation.

This assignment tests your ability to:

Bridge the gap between native functionality and web content
Handle complex state management and data persistence
Build performant, production-ready mobile applications
Implement security best practices
Solve real-world mobile development challenges
Technology Stack
Mandatory Technologies
Framework: React Native Expo (latest stable SDK)
Language: TypeScript (strict mode enabled)
Data Persistence:
Expo SecureStore (for sensitive data)
AsyncStorage or MMKV (for app data)
Navigation: Expo router
Styling: NativeWind (Tailwind for React Native)
Optional Technologies (Bonus Points)
Testing: Jest + React Native Testing Library
Error Tracking: Sentry or custom solution
Analytics: Expo Analytics or custom implementation
Forms: React Hook Form
Validation: Zod or Yup
Image Handling: Expo Image with caching
AI Integration: OpenAI SDK for smart course recommendations

Mandatory Skills
✅ React Native & Expo - Architecture, SDK modules, platform-specific code
✅ TypeScript - Strong typing, interfaces, generics, strict mode
✅ WebView - Bidirectional communication, JS injection, state persistence
✅ State Management - async operations, persistence
✅ API Integration - interceptors, retry logic
✅ Performance - optimization, memoization, caching
✅ Native Features - Notifications, downloads, camera, network monitoring
✅ Error Handling - Boundaries, offline mode, retry mechanisms

Optional Skills (Bonus)
🌟 Advanced Native - Custom modules, biometric auth, background tasks
🌟 AI Integration - OpenAI SDK, recommendations, smart search
🌟 Testing - Jest, Testing Library, E2E (Detox), >70% coverage
🌟 DevOps - CI/CD, GitHub Actions, automated builds
🌟 Advanced UI - Reanimated, gestures, dark mode, accessibility
🌟 Security - Certificate pinning, encryption, jailbreak detection

What We Expect
We don't want basic apps. We want to see:

🎯 Critical Thinking - Architectural decisions with clear rationale
🎯 Problem Solving - Elegant solutions to complex challenges
🎯 Code Quality - Production-ready, maintainable, well-structured code
🎯 Real-World Focus - Error resilience, performance
🎯 Innovation - Creative solutions beyond basic requirements

Your project should demonstrate: Senior-level engineering practices, deep understanding of React Native, security-first mindset, and scalable architecture.


Requirements

Part 1: Authentication & User Management
1.1 User Authentication
Implement login/register using /api/v1/users endpoints
Store auth tokens using Expo SecureStore
Auto-login on app restart if token is valid
Implement logout functionality
Basic token refresh handling
1.2 Profile Screen
Display user profile information
Allow profile picture update
Show user statistics (courses enrolled, progress)
Part 2: Course Catalog (Native Implementation)
2.1 Course List
Fetch data from /api/v1/public/randomusers (treat as course instructors)
Fetch data from /api/v1/public/randomproducts (treat as courses)
Display courses in a scrollable list with:
Course thumbnail
Instructor name
Course title and description
Bookmark icon
Implement pull-to-refresh
Add search functionality to filter courses
2.2 Course Details Screen
Show complete course information
Add "Enroll" button with visual feedback
Implement bookmark toggle with local storage
Part 3: WebView Integration
3.1 Embedded Content Viewer
Create a WebView screen that displays course content
Load a simple HTML page showing course details (you can create a local HTML template)
Implement basic communication from Native app to Webview using headers
Part 4: Native Features
4.1 Local Notifications
Request notification permissions
Show notification when user bookmarks 5+ courses
Add notification when user hasn't opened app for 24 hours (reminder)
Part 5: State Management & Performance
5.1 State Management
Implement global state using Expo Secure Store and React native async storage for situation-specific
Manage:
Authentication state
Course list and bookmarks
User preferences
5.2 List Optimization
 Implement LegendList with proper
optimization
Use keyExtractor and proper item keys
Implement basic memoization for list items
Add pull-to-refresh without UI jank
Part 6: Error Handling
6.1 Network Errors
Handle API failures with a retry mechanism
Show user-friendly error messages
Implement timeout handling
Add offline mode banner
6.2 WebView Error Handling
Handle failed WebView loads
Deliverables
Source Code
GitHub repository with clean commit history
Organized folder structure
No debug logs or commented code
Documentation (README.md)
Setup instructions
Environment variables needed
Key architectural decisions
Known issues/limitations
Screenshots of main screens
Demo Video (3-5 minutes)
Walkthrough of main features
Offline functionality
APK Build
Provide development build APK
Include build instructions
Technical Constraints
Must use Expo SDK (latest stable version)
Must work on both iOS and Android
Typescript is must
No usage of deprecated Expo APIs
Must handle portrait and landscape orientations
Evaluation Criteria
Functionality
Completeness and correctness of authentication, course catalog, notifications

Code Quality

Code structure, organization, TypeScript strict mode, state management, and optimization techniques.

User Interface
User-friendliness, responsiveness, design consistency, and accessibility best practices.

Real-World Considerations
Error handling, edge cases, security, and understanding of production challenges.

Documentation & Deployment
README quality, setup instructions, demo video, and APK build.

Submission
Create a GitHub repository with:

Complete source code
README with setup instructions
Demo video
APK file in releases section