/**
 * Demo Mode Utility
 * 
 * Demo mode is opt-in. The app uses mock data only when DEMO_MODE=true.
 * 
 * The demo mode banner is always visible when active.
 */

export const isDemoMode = (): boolean => {
  return process.env.DEMO_MODE === 'true'
}

export const isClientDemoMode = (): boolean => {
  // Safe to check on client without exposing secrets
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
}

// Demo data fixtures
export const DEMO_CHANNEL = {
  _id: 'demo-channel-1',
  channelId: 'UCdemo1234567890',
  channelTitle: 'TechCreator Pro (Demo)',
  channelDescription: 'Your go-to channel for tech tutorials, reviews, and coding tips.',
  thumbnailUrl: 'https://ui-avatars.com/api/?name=TC&background=6366f1&color=fff&size=128',
  subscriberCount: 125400,
  videoCount: 87,
  status: 'active' as const,
}

export const DEMO_VIDEOS = [
  {
    id: 'demo-video-1',
    title: 'Building a REST API with Node.js and Express (2024)',
    description: 'Complete guide to building production-ready REST APIs.',
    thumbnailUrl: 'https://picsum.photos/seed/vid1/320/180',
    publishedAt: '2024-12-15T10:00:00Z',
    privacyStatus: 'public' as const,
    viewCount: 45200,
    likeCount: 1823,
    commentCount: 312,
    duration: 'PT32M15S',
  },
  {
    id: 'demo-video-2',
    title: 'React 19 New Features Explained',
    description: 'Everything you need to know about React 19.',
    thumbnailUrl: 'https://picsum.photos/seed/vid2/320/180',
    publishedAt: '2024-12-08T10:00:00Z',
    privacyStatus: 'public' as const,
    viewCount: 38700,
    likeCount: 1456,
    commentCount: 287,
    duration: 'PT28M44S',
  },
  {
    id: 'demo-video-3',
    title: 'TypeScript Generics Deep Dive',
    description: 'Master TypeScript generics once and for all.',
    thumbnailUrl: 'https://picsum.photos/seed/vid3/320/180',
    publishedAt: '2024-11-30T10:00:00Z',
    privacyStatus: 'public' as const,
    viewCount: 29100,
    likeCount: 1102,
    commentCount: 198,
    duration: 'PT41M30S',
  },
]

export const DEMO_COMMENTS = [
  { id: 'c1', videoId: 'demo-video-1', text: 'Can you make a video about authentication with JWT?', authorName: 'Alex Chen', likeCount: 45, publishedAt: '2024-12-16T08:23:00Z' },
  { id: 'c2', videoId: 'demo-video-1', text: 'How do I handle file uploads in Express? Would love a tutorial!', authorName: 'Maria Garcia', likeCount: 38, publishedAt: '2024-12-16T09:11:00Z' },
  { id: 'c3', videoId: 'demo-video-1', text: 'Please cover error handling best practices in Node.js', authorName: 'Sam Johnson', likeCount: 31, publishedAt: '2024-12-17T10:45:00Z' },
  { id: 'c4', videoId: 'demo-video-1', text: 'Would love to see a video on GraphQL vs REST comparison', authorName: 'Priya Sharma', likeCount: 28, publishedAt: '2024-12-17T14:22:00Z' },
  { id: 'c5', videoId: 'demo-video-1', text: 'JWT authentication tutorial would be amazing! Struggling with refresh tokens', authorName: 'Tom Wilson', likeCount: 26, publishedAt: '2024-12-18T11:30:00Z' },
  { id: 'c6', videoId: 'demo-video-1', text: 'Can you explain database indexing and how it affects API performance?', authorName: 'Lisa Park', likeCount: 22, publishedAt: '2024-12-18T15:00:00Z' },
  { id: 'c7', videoId: 'demo-video-2', text: 'What about React Server Components? Are they ready for production?', authorName: 'James Kim', likeCount: 41, publishedAt: '2024-12-09T08:00:00Z' },
  { id: 'c8', videoId: 'demo-video-2', text: 'Please do a video comparing Next.js 15 vs Remix for production apps', authorName: 'Rachel Brown', likeCount: 35, publishedAt: '2024-12-09T10:30:00Z' },
  { id: 'c9', videoId: 'demo-video-2', text: 'Server components are confusing. Can you do a step-by-step tutorial?', authorName: 'David Lee', likeCount: 29, publishedAt: '2024-12-10T09:15:00Z' },
]

export const DEMO_TOPICS = [
  {
    _id: 'topic-1',
    name: 'JWT Authentication & Security',
    summary: 'Multiple viewers are requesting comprehensive content on JWT authentication, refresh token management, and API security best practices.',
    commentCount: 23,
    representativeComments: [
      'Can you make a video about authentication with JWT?',
      'JWT authentication tutorial would be amazing! Struggling with refresh tokens',
    ],
    commonQuestions: [
      'How do I implement JWT refresh tokens?',
      'What is the secure way to store JWTs in a browser?',
      'How to handle JWT expiry gracefully?',
    ],
    suggestedIdeas: [
      'Complete JWT Authentication in Node.js (Access + Refresh Tokens)',
      'Secure API Authentication: JWT vs Session Cookies',
    ],
    priorityScore: 92,
    scoreExplanation: 'High comment volume (23 comments), strong engagement (avg 35 likes), repeated across multiple videos, trending topic in web dev community.',
  },
  {
    _id: 'topic-2',
    name: 'React Server Components',
    summary: 'Viewers want clarity on React Server Components and how to use them in production applications with Next.js.',
    commentCount: 18,
    representativeComments: [
      'What about React Server Components? Are they ready for production?',
      'Server components are confusing. Can you do a step-by-step tutorial?',
    ],
    commonQuestions: [
      'When should I use Server Components vs Client Components?',
      'How do Server Components affect bundle size?',
      'Can I use hooks in Server Components?',
    ],
    suggestedIdeas: [
      'React Server Components: Complete Practical Guide (2024)',
      'Server vs Client Components: Decision Framework',
    ],
    priorityScore: 87,
    scoreExplanation: 'High viewer confusion signals content gap. Cross-video interest from React 19 video. Strong engagement (29–41 likes).',
  },
  {
    _id: 'topic-3',
    name: 'File Uploads & Storage',
    summary: 'Creators want to see how to handle file uploads in Express/Node.js, including cloud storage integration.',
    commentCount: 14,
    representativeComments: [
      'How do I handle file uploads in Express? Would love a tutorial!',
    ],
    commonQuestions: [
      'How to upload files to AWS S3 from Node.js?',
      'What is Multer and how do I use it?',
      'How to handle large file uploads efficiently?',
    ],
    suggestedIdeas: [
      'File Uploads in Node.js: Multer + AWS S3 Complete Guide',
      'Building a File Upload Service with Progress Tracking',
    ],
    priorityScore: 78,
    scoreExplanation: 'Consistent request across tutorial videos. Practical everyday use case. Moderate engagement (38 likes).',
  },
]

export const DEMO_CONTENT_IDEAS = [
  {
    _id: 'idea-1',
    title: 'Complete JWT Authentication in Node.js (Access + Refresh Tokens)',
    contentType: 'video' as const,
    status: 'approved' as const,
    titleSuggestions: [
      'JWT Authentication in Node.js: The Complete Guide',
      'Secure Your API: JWT + Refresh Tokens in Node.js',
      'JWT Auth Done Right: Access Tokens, Refresh Tokens & Security',
    ],
    outline: [
      'Introduction: Why JWT authentication matters',
      'JWT anatomy: Header, payload, signature explained',
      'Implementing access token generation and validation',
      'Building refresh token rotation system',
      'Secure storage strategies (httpOnly cookies vs localStorage)',
      'Handling token expiry and silent refresh',
      'Testing the authentication flow',
    ],
    keywords: ['JWT', 'Node.js', 'authentication', 'refresh tokens', 'API security'],
    scheduledDate: new Date('2024-01-20'),
    sourceTopicId: 'topic-1',
  },
  {
    _id: 'idea-2',
    title: 'React Server Components: Complete Practical Guide (2024)',
    contentType: 'video' as const,
    status: 'draft' as const,
    titleSuggestions: [
      'React Server Components Explained (No Fluff)',
      'When to Use Server vs Client Components in Next.js',
    ],
    outline: [
      'What are React Server Components and why they exist',
      'Server Components vs Client Components: key differences',
      'Practical decision framework: when to use each',
      'Data fetching patterns with Server Components',
      'Common pitfalls and how to avoid them',
    ],
    keywords: ['React', 'Server Components', 'Next.js', 'performance'],
    sourceTopicId: 'topic-2',
  },
]

export const DEMO_BROADCASTS = [
  {
    _id: 'broadcast-1',
    title: 'Live Q&A: JWT Authentication Deep Dive',
    description: 'Join me for a live coding session where we tackle your authentication questions!',
    scheduledStartTime: new Date('2025-05-25T18:00:00Z'),
    timezone: 'America/New_York',
    status: 'local' as const,
    isDemo: true,
    agenda: [
      'Introduction and setup (10 min)',
      'JWT basics recap (15 min)',
      'Live coding: Full auth system (45 min)',
      'Q&A from chat (20 min)',
      'Wrap up and next steps (10 min)',
    ],
  },
]

export const DEMO_STATS = {
  totalCommentsAnalyzed: 847,
  totalTopicsIdentified: 12,
  savedContentIdeas: 8,
  upcomingLivestreams: 1,
  connectedChannels: 1,
  isDemo: true,
}
