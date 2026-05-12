import { DataSource } from 'typeorm';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Category } from 'src/categories/category.entity';
import { CategoryType } from 'src/categories/enums/categoryType.enum';
import { Chapter } from 'src/chapters/chapter.entity';
import { Coupon } from 'src/coupons/coupon.entity';
import { CouponScope } from 'src/coupons/enums/couponScope.enum';
import { CouponStatus } from 'src/coupons/enums/couponStatus.enum';
import { CouponType } from 'src/coupons/enums/couponType.enum';
import { Course } from 'src/courses/course.entity';
import { CourseDeliveryMode } from 'src/courses/constants/course-delivery-mode';
import { CourseReview } from 'src/course-reviews/course-review.entity';
import { FacultyReview } from 'src/faculty-reviews/faculty-review.entity';
import { Article } from 'src/articles/article.entity';
import { ArticleComment } from 'src/article-comments/article-comment.entity';
import { AutomationJob } from 'src/engagement/automation-job.entity';
import { AutomationJobStatus } from 'src/engagement/enums/automation-job-status.enum';
import { AutomationTriggerType } from 'src/engagement/enums/automation-trigger-type.enum';
import { BroadcastStatus } from 'src/engagement/enums/broadcast-status.enum';
import { EngagementAudience } from 'src/engagement/enums/engagement-audience.enum';
import { NotificationBroadcast } from 'src/engagement/notification-broadcast.entity';
import { NotificationRule } from 'src/engagement/notification-rule.entity';
import { BatchStudent } from 'src/faculty-workspace/batch-student.entity';
import { ClassSession } from 'src/faculty-workspace/class-session.entity';
import { CourseBatch } from 'src/faculty-workspace/course-batch.entity';
import { BatchStudentStatus } from 'src/faculty-workspace/enums/batch-student-status.enum';
import { ClassSessionStatus } from 'src/faculty-workspace/enums/class-session-status.enum';
import { CourseBatchStatus } from 'src/faculty-workspace/enums/course-batch-status.enum';
import { Lecture } from 'src/lectures/lecture.entity';
import { Attachment } from 'src/attachments/attachment.entity';
import { NotificationChannel } from 'src/notifications/enums/notification-channel.enum';
import { NotificationType } from 'src/notifications/enums/notification-type.enum';
import { Enrollment } from 'src/enrollments/enrollment.entity';
import { Order } from 'src/orders/order.entity';
import { OrderItem } from 'src/orders/order-item.entity';
import { OrderStatus } from 'src/orders/enums/orderStatus.enum';
import { FacultyProfile } from 'src/profiles/faculty-profile.entity';
import { UserProfile } from 'src/profiles/user-profile.entity';
import { Role } from 'src/roles-permissions/role.entity';
import { AppSetting } from 'src/settings/app-setting.entity';
import { seedAssignmentDemo } from './assignment-demo.seed';
import { Tag } from 'src/tags/tag.entity';
import { Testimonial } from 'src/testimonials/testimonial.entity';
import { TestimonialStatus } from 'src/testimonials/enums/testimonial-status.enum';
import { TestimonialType } from 'src/testimonials/enums/testimonial-type.enum';
import { Upload } from 'src/uploads/upload.entity';
import { FileTypes } from 'src/uploads/enums/file-types.enum';
import { UploadStatus } from 'src/uploads/enums/upload-status.enum';
import { User } from 'src/users/user.entity';
import * as bcrypt from 'bcrypt';

const createId = (value: string) => value;
const DEMO_PASSWORD = 'Demo@12345';
const DEMO_DATA_DIRS = [
  join(process.cwd(), 'src', 'database', 'data', 'marketplace-demo'),
  join(__dirname, '..', 'data', 'marketplace-demo'),
  join(__dirname, '..', '..', 'src', 'database', 'data', 'marketplace-demo'),
];
const demoVideoPaths = Array.from(
  { length: 15 },
  (_, index) =>
    `/assets/demo-videos/${String(index + 1).padStart(2, '0')}-${[
      'online-class-with-laptop',
      'student-using-his-laptop',
      'student-using-laptop-at-home',
      'laptop-learning-at-home',
      'online-class-study-desk',
      'students-using-laptops',
      'virtual-meeting-learning-setup',
      'male-student-using-laptop',
      'programming-on-laptop',
      'person-encoding-on-laptop',
      'man-coding-on-laptop',
      'students-working-on-laptop-in-classroom',
      'teacher-in-online-class',
      'teacher-recording-an-online-class',
      'teacher-and-student-in-online-class',
    ][index]}.mp4`,
);
const demoAttachmentPaths = [
  '/assets/demo-attachments/ai-productivity-playbook.pdf',
  '/assets/demo-attachments/analytics-dashboard-template.pdf',
  '/assets/demo-attachments/career-interview-kit.pdf',
  '/assets/demo-attachments/communication-practice-pack.pdf',
  '/assets/demo-attachments/database-design-sheet.pdf',
  '/assets/demo-attachments/devops-release-checklist.pdf',
  '/assets/demo-attachments/frontend-practice-worksheet.pdf',
  '/assets/demo-attachments/fullstack-project-brief.pdf',
  '/assets/demo-attachments/marketing-content-calendar.pdf',
  '/assets/demo-attachments/node-api-workbook.pdf',
];

function readDemoJson<T>(fileName: string, fallback: T): T {
  const filePath = DEMO_DATA_DIRS.map((dir) => join(dir, fileName)).find(
    (candidate) => existsSync(candidate),
  );

  if (!filePath) {
    return fallback;
  }

  return JSON.parse(readFileSync(filePath, 'utf8')) as T;
}

function enrichDemoCourse(course: DemoCourse, courseIndex: number): DemoCourse {
  const existingChapters = course.chapters || [];
  const needsRichContent =
    existingChapters.length < 15 ||
    existingChapters.some((chapter) => (chapter.lectures?.length || 0) < 8) ||
    !course.videoPath;

  if (!needsRichContent) return course;

  const topics = [
    'Orientation and learning roadmap',
    'Core concepts and terminology',
    'Tooling and environment setup',
    'Practical workflow foundations',
    'Research and planning methods',
    'Implementation patterns',
    'Quality checklist and review',
    'Common mistakes and fixes',
    'Real-world case study',
    'Hands-on practice lab',
    'Portfolio-ready assignment',
    'Automation and productivity',
    'Assessment preparation',
    'Capstone build session',
    'Final review and next steps',
  ];
  const lessonTypes = [
    'Concept walkthrough',
    'Environment setup',
    'Guided practice',
    'Common mistakes review',
    'Mini assignment briefing',
    'Practice implementation',
    'Debugging session',
    'Resource review',
    'Checkpoint quiz',
    'Portfolio task',
  ];

  return {
    ...course,
    videoPath: course.videoPath || demoVideoPaths[courseIndex % demoVideoPaths.length],
    chapters: topics.map((topic, chapterIndex) => ({
      title: topic,
      description: `${topic} for ${course.title}. This module gives learners a practical, testable path with clear tasks and review material.`,
      isFree: chapterIndex < 1,
      lectures: lessonTypes.map((lessonType, lectureIndex) => ({
        title: `${lessonType}: ${topic}`,
        description: `Learn ${topic.toLowerCase()} in ${course.title}. This lesson includes focused explanation, practical examples, and a review checklist for demo testing.`,
        isFree:
          course.mode === CourseDeliveryMode.FacultyLed ||
          (chapterIndex === 0 && lectureIndex < 2),
        attachmentPaths: [
          demoAttachmentPaths[
            (courseIndex + chapterIndex + lectureIndex) %
              demoAttachmentPaths.length
          ],
        ],
        videoPath:
          course.mode === CourseDeliveryMode.FacultyLed
            ? undefined
            : demoVideoPaths[
                (courseIndex + chapterIndex + lectureIndex) %
                  demoVideoPaths.length
              ],
      })),
    })),
  };
}

function mergeDemoCourses(coursesFromJson: DemoCourse[]) {
  const courseMap = new Map<string, DemoCourse>();

  [...fallbackDemoCourses, ...coursesFromJson].forEach((course, index) => {
    courseMap.set(course.slug, enrichDemoCourse(course, index));
  });

  return [...courseMap.values()];
}

type DemoLecture = {
  title: string;
  description: string;
  isFree?: boolean;
  videoPath?: string;
  attachmentPaths?: string[];
};

type DemoChapter = {
  title: string;
  description: string;
  isFree?: boolean;
  lectures?: DemoLecture[];
};

type DemoCourse = {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  imagePath: string;
  imageAlt: string;
  videoPath?: string;
  priceInr: string;
  priceUsd: string;
  duration: string;
  mode: string;
  certificate: string;
  experienceLevel: string;
  studyMaterial?: string;
  additionalBook: string;
  language: string;
  technologyRequirements: string;
  eligibilityRequirements: string;
  disclaimer: string;
  exams: string;
  monthlyLiveClassLimit?: number | null;
  attendanceType?: string;
  attendanceValue?: number | null;
  showInHero?: boolean;
  showInPopular?: boolean;
  showInMegaMenu?: boolean;
  isFeatured?: boolean;
  categories: string[];
  tags: string[];
  chapters: DemoChapter[];
};

type DemoUser = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  role?: 'admin' | 'faculty' | 'student';
  avatarUrl?: string;
  headline?: string;
  facultyProfile?: {
    expertise: string;
    designation: string;
    experience: string;
  };
};

type DemoCoupon = {
  code: string;
  type: CouponType;
  value: number;
  scope: CouponScope;
  status: CouponStatus;
  minOrderValue?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  isAutoApply?: boolean;
  courseSlugs?: string[];
};

type DemoArticle = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imagePath: string;
  imageAlt: string;
  categories: string[];
  tags: string[];
  readingTime: number;
  isFeatured?: boolean;
};

type DemoTestimonial = {
  name: string;
  designation: string;
  company?: string;
  message: string;
  rating: number;
  avatarPath: string;
  avatarAlt: string;
  courseSlugs?: string[];
  priority?: number;
};

type DemoNotificationRule = {
  eventKey: string;
  label: string;
  description: string;
  isEnabled: boolean;
  audience: EngagementAudience;
  channels: NotificationChannel[];
  type: NotificationType;
  titleTemplate: string;
  messageTemplate: string;
  hrefTemplate?: string;
  imageUrl?: string;
};

type DemoBroadcast = {
  title: string;
  message: string;
  href?: string;
  imageUrl?: string;
  type: NotificationType;
  audience: EngagementAudience;
  channels: NotificationChannel[];
  status: BroadcastStatus;
};

type DemoAutomationJob = {
  name: string;
  slug: string;
  description: string;
  status: AutomationJobStatus;
  triggerType: AutomationTriggerType;
  cronExpression?: string;
  timezone?: string;
  actionType: string;
  actionPayload?: Record<string, unknown>;
  conditions?: Record<string, unknown>;
};

type DemoBatch = {
  name: string;
  code: string;
  description: string;
  courseSlug: string;
  facultyEmail: string;
  status: CourseBatchStatus;
  startOffsetDays: number;
  endOffsetDays: number;
  capacity: number;
  studentEmails: string[];
};

type DemoClassSession = {
  batchCode: string;
  courseSlug: string;
  facultyEmail: string;
  title: string;
  description: string;
  startsInDays: number;
  startHour: number;
  startMinute: number;
  durationMinutes: number;
  timezone?: string;
  status: ClassSessionStatus;
  reminderOffsetsMinutes?: number[];
  bbbRecord?: boolean;
  allowRecordingAccess?: boolean;
};

type DemoAppSetting = {
  key: string;
  valueJson: Record<string, unknown>;
};

const fallbackDemoUsers: DemoUser[] = [
  {
    firstName: 'Aarav',
    lastName: 'Kapoor',
    username: 'demo-admin',
    email: 'admin@codewithkasa.demo',
    phoneNumber: '+919900000001',
    role: 'admin',
    avatarUrl: '/assets/faculty-1.jpg',
  },
  {
    firstName: 'Meera',
    lastName: 'Sharma',
    username: 'demo-faculty-meera',
    email: 'faculty@codewithkasa.demo',
    phoneNumber: '+919900000002',
    role: 'faculty',
    avatarUrl: '/assets/faculty-2.jpg',
    facultyProfile: {
      expertise: 'Frontend development, UI systems, and live project mentoring',
      designation: 'Senior Faculty - Web Development',
      experience: '8+ years teaching practical web development',
    },
  },
  {
    firstName: 'Kabir',
    lastName: 'Malhotra',
    username: 'demo-faculty-kabir',
    email: 'mentor@codewithkasa.demo',
    phoneNumber: '+919900000003',
    role: 'faculty',
    avatarUrl: '/assets/faculty-3.jpg',
    facultyProfile: {
      expertise:
        'Digital marketing, analytics, spoken communication, and career coaching',
      designation: 'Faculty Mentor',
      experience: '10+ years across training and growth operations',
    },
  },
  {
    firstName: 'Riya',
    lastName: 'Verma',
    username: 'demo-learner',
    email: 'learner@codewithkasa.demo',
    phoneNumber: '+919900000004',
    role: 'student',
    avatarUrl: '/assets/guest-user.webp',
    headline: 'Frontend learner',
  },
  {
    firstName: 'Arjun',
    lastName: 'Singh',
    username: 'demo-learner-arjun',
    email: 'arjun@codewithkasa.demo',
    phoneNumber: '+919900000005',
    role: 'student',
    avatarUrl: '/assets/guest-user.webp',
    headline: 'Hybrid program learner',
  },
];

const fallbackDemoCourses: DemoCourse[] = [
  {
    title: 'Frontend Developer Starter Kit',
    slug: 'frontend-developer-starter-kit',
    shortDescription:
      'A polished self-learning path for HTML, CSS, JavaScript, responsive UI, and portfolio-ready practice.',
    description:
      '<p>Start from the foundations and build real interface confidence. This self-paced course is structured for learners who want clean HTML, responsive CSS, JavaScript interaction, and practical portfolio exercises without needing a live classroom.</p><p>The demo shows recorded lessons, free preview content, course progress, a final assessment, and certificate eligibility.</p>',
    imagePath: '/assets/courses/course-1.jpg',
    imageAlt: 'Learner building a frontend project on a laptop',
    priceInr: '1499.00',
    priceUsd: '29.00',
    duration: '6 weeks',
    mode: CourseDeliveryMode.SelfLearning,
    certificate: 'Certificate after recorded progress and final assessment',
    experienceLevel: 'Beginner',
    studyMaterial:
      'Downloadable notes, code checklists, UI practice sheets, and final project prompts.',
    additionalBook: 'Frontend Foundations Workbook',
    language: 'English',
    technologyRequirements:
      'Laptop or desktop, modern browser, VS Code, and stable internet connection.',
    eligibilityRequirements:
      'No prior programming experience required. Basic computer comfort is enough.',
    disclaimer:
      'Learner outcome depends on regular practice and completion of assigned projects.',
    exams: 'Final assessment required for certification',
    categories: ['Web Development', 'Self Learning'],
    tags: ['HTML', 'CSS', 'JavaScript', 'Portfolio'],
    chapters: [
      {
        title: 'Web Foundations',
        description:
          'Understand browser basics, page structure, assets, semantic HTML, and project setup.',
        isFree: true,
        lectures: [
          {
            title: 'How websites are built',
            description:
              'A practical introduction to pages, assets, links, developer tools, and deployment thinking.',
            isFree: true,
          },
          {
            title: 'Semantic HTML starter project',
            description:
              'Create a clean page structure with headings, sections, forms, links, and media.',
          },
        ],
      },
      {
        title: 'Responsive Interface Design',
        description:
          'Build layouts that stay readable on mobile, tablet, and desktop screens.',
        lectures: [
          {
            title: 'CSS layout essentials',
            description:
              'Use spacing, typography, flexbox, grid, and reusable layout patterns.',
          },
          {
            title: 'Mobile-first landing page',
            description:
              'Turn a simple design into a responsive landing page with polished buttons and cards.',
          },
        ],
      },
      {
        title: 'JavaScript for Real UI',
        description:
          'Add meaningful interaction using events, DOM updates, validation, and loading states.',
        lectures: [
          {
            title: 'DOM events and state',
            description:
              'Build interactive menus, tabs, counters, and small interface patterns.',
          },
          {
            title: 'Form validation mini project',
            description:
              'Create a practical form flow with validation messages and submit feedback.',
          },
        ],
      },
    ],
  },
  {
    title: 'UI UX Design Essentials',
    slug: 'ui-ux-design-essentials',
    shortDescription:
      'A self-paced design course covering UX research, wireframes, design systems, and handoff basics.',
    description:
      '<p>Learn how to think like a product designer. This course covers user journeys, wireframes, visual hierarchy, accessible interface patterns, and developer handoff. It is ideal for academies that sell creative courses without live-class dependency.</p>',
    imagePath: '/assets/courses/course-3.png',
    imageAlt: 'Designer reviewing a digital interface prototype',
    priceInr: '1999.00',
    priceUsd: '39.00',
    duration: '5 weeks',
    mode: CourseDeliveryMode.SelfLearning,
    certificate: 'Certificate after design project submission and final quiz',
    experienceLevel: 'Beginner to Intermediate',
    studyMaterial:
      'UX worksheets, design review checklist, wireframe templates, and handoff notes.',
    additionalBook: 'Practical UI Review Checklist',
    language: 'English',
    technologyRequirements:
      'Laptop or desktop, Figma or browser-based design tool, and internet access.',
    eligibilityRequirements:
      'No design degree required. Suitable for students, founders, and junior designers.',
    disclaimer:
      'Design portfolio quality depends on project effort and feedback iteration.',
    exams: 'Final design-readiness assessment required for certification',
    categories: ['Design', 'Self Learning'],
    tags: ['UI UX', 'Figma', 'Design Systems', 'Portfolio'],
    chapters: [
      {
        title: 'UX Thinking',
        description:
          'Learn problem framing, user goals, customer journeys, and simple research notes.',
        isFree: true,
        lectures: [
          {
            title: 'Understanding users',
            description:
              'Map user goals, pain points, and decisions before designing screens.',
            isFree: true,
          },
          {
            title: 'Journey map practice',
            description:
              'Create a simple journey map and identify moments where UI can reduce friction.',
          },
        ],
      },
      {
        title: 'Interface Craft',
        description:
          'Improve hierarchy, spacing, typography, colors, components, and responsive composition.',
        lectures: [
          {
            title: 'Visual hierarchy basics',
            description:
              'Use size, contrast, grouping, and alignment to make screens easier to scan.',
          },
          {
            title: 'Component consistency',
            description:
              'Build repeatable buttons, cards, forms, and navigation patterns.',
          },
        ],
      },
      {
        title: 'Portfolio Case Study',
        description:
          'Turn your final design into a clear case study with process, decisions, and outcomes.',
        lectures: [
          {
            title: 'Case study structure',
            description:
              'Present problem, role, process, screens, and measurable improvement clearly.',
          },
        ],
      },
    ],
  },
  {
    title: 'Digital Marketing Launchpad',
    slug: 'digital-marketing-launchpad',
    shortDescription:
      'A self-learning course for content planning, SEO basics, campaign funnels, and analytics reports.',
    description:
      '<p>This practical marketing course helps learners understand content strategy, search visibility, paid campaign planning, email sequences, and analytics reporting. It demonstrates how non-technical courses can be sold through the LMS with exams and certificates.</p>',
    imagePath: '/assets/courses/course-4.png',
    imageAlt: 'Marketing dashboard with campaign planning notes',
    priceInr: '1799.00',
    priceUsd: '35.00',
    duration: '4 weeks',
    mode: CourseDeliveryMode.SelfLearning,
    certificate: 'Certificate after campaign plan submission and assessment',
    experienceLevel: 'Beginner',
    studyMaterial:
      'Campaign planner, SEO checklist, content calendar template, and analytics worksheet.',
    additionalBook: '30-Day Marketing Action Planner',
    language: 'English',
    technologyRequirements:
      'Browser, spreadsheet tool, and access to basic social media or website examples.',
    eligibilityRequirements:
      'Suitable for students, small business owners, creators, and marketing beginners.',
    disclaimer:
      'Marketing results vary by niche, budget, offer, and execution quality.',
    exams: 'Final marketing strategy assessment required for certification',
    categories: ['Marketing', 'Self Learning'],
    tags: ['SEO', 'Content', 'Analytics', 'Campaigns'],
    chapters: [
      {
        title: 'Marketing Foundations',
        description:
          'Understand audiences, positioning, offers, channels, and conversion goals.',
        isFree: true,
        lectures: [
          {
            title: 'Audience and offer clarity',
            description:
              'Define who the campaign is for, what problem it solves, and why it matters.',
            isFree: true,
          },
          {
            title: 'Channel selection',
            description:
              'Choose the right mix of search, social, email, and content channels.',
          },
        ],
      },
      {
        title: 'Campaign Execution',
        description:
          'Plan content, landing pages, lead magnets, paid promotion, and email follow-up.',
        lectures: [
          {
            title: 'Content calendar workflow',
            description:
              'Build a practical publishing calendar with topics, owners, and outcomes.',
          },
          {
            title: 'Funnel and email sequence',
            description:
              'Create a simple campaign funnel from awareness to lead capture and conversion.',
          },
        ],
      },
      {
        title: 'Reports and Optimization',
        description:
          'Read performance metrics and improve future campaigns based on evidence.',
        lectures: [
          {
            title: 'Marketing report basics',
            description:
              'Track traffic, conversions, cost, revenue, and campaign learning notes.',
          },
        ],
      },
    ],
  },
  {
    title: 'Ayurveda Nutrition Live Practitioner Program',
    slug: 'ayurveda-nutrition-live-practitioner-program',
    shortDescription:
      'A faculty-led course with live classes, batch scheduling, attendance rules, and certificate readiness.',
    description:
      '<p>This faculty-led program demonstrates a coaching-style course where learners attend scheduled live sessions instead of recorded lectures. It highlights batches, calendar sessions, reminders, attendance rules, recordings, and certification workflows.</p>',
    imagePath: '/assets/courses/vedic-nutrition-beginner.png',
    imageAlt: 'Ayurveda nutrition live class with healthy food planning',
    priceInr: '6999.00',
    priceUsd: '129.00',
    duration: '12 weeks',
    mode: CourseDeliveryMode.FacultyLed,
    certificate: 'Certificate after live attendance requirement and final exam',
    experienceLevel: 'Beginner to Professional',
    studyMaterial:
      'Live class notes, printable diet planning sheets, case discussion templates, and replay references.',
    additionalBook: 'Ayurveda Nutrition Casebook',
    language: 'English and Hindi',
    technologyRequirements:
      'Mobile or laptop, camera and microphone for live sessions, and stable internet.',
    eligibilityRequirements:
      'Open to wellness learners, yoga trainers, nutrition enthusiasts, and healthcare assistants.',
    disclaimer:
      'This course is educational and does not replace medical diagnosis or clinical treatment.',
    exams: 'Final exam unlocks after attendance requirement is met',
    monthlyLiveClassLimit: 8,
    attendanceType: 'percentage',
    attendanceValue: 80,
    categories: ['Health and Wellness', 'Live Classes'],
    tags: ['Ayurveda', 'Nutrition', 'Faculty Led', 'Attendance'],
    chapters: [
      {
        title: 'Foundations of Ayurvedic Nutrition',
        description:
          'Live sessions cover prakriti, digestion, meal timing, food qualities, and learner Q&A.',
        isFree: true,
      },
      {
        title: 'Diet Planning Workshops',
        description:
          'Faculty guides learners through practical meal plans, seasonal adjustments, and case examples.',
      },
      {
        title: 'Case Discussions and Exam Readiness',
        description:
          'Learners review common client scenarios, revise key concepts, and prepare for assessment.',
      },
    ],
  },
  {
    title: 'Spoken English Live Confidence Batch',
    slug: 'spoken-english-live-confidence-batch',
    shortDescription:
      'A live batch program for spoken English fluency, interview practice, and confidence building.',
    description:
      '<p>This course demonstrates how language academies can run live cohorts. Faculty manages batches, students join scheduled classes, reminders go out automatically, and attendance helps decide assessment eligibility.</p>',
    imagePath: '/assets/courses/course-2.jpg',
    imageAlt: 'Learners practicing spoken English in a live batch',
    priceInr: '3499.00',
    priceUsd: '69.00',
    duration: '8 weeks',
    mode: CourseDeliveryMode.FacultyLed,
    certificate: 'Certificate after attendance and speaking assessment',
    experienceLevel: 'Beginner to Intermediate',
    studyMaterial:
      'Speaking prompts, vocabulary sheets, interview scripts, and weekly practice tasks.',
    additionalBook: 'Daily Speaking Practice Journal',
    language: 'English and Hindi',
    technologyRequirements:
      'Mobile or laptop, microphone, camera for live practice, and stable internet.',
    eligibilityRequirements:
      'Learners should be comfortable reading basic English sentences.',
    disclaimer:
      'Fluency improves with regular practice, class participation, and speaking confidence.',
    exams: 'Speaking assessment and final quiz required for certification',
    monthlyLiveClassLimit: 12,
    attendanceType: 'percentage',
    attendanceValue: 70,
    categories: ['Language Learning', 'Live Classes'],
    tags: ['English', 'Interview', 'Communication', 'Faculty Led'],
    chapters: [
      {
        title: 'Confidence and Pronunciation',
        description:
          'Live speaking drills, pronunciation correction, and confidence-building exercises.',
        isFree: true,
      },
      {
        title: 'Daily Conversation Practice',
        description:
          'Roleplays for introductions, workplace conversations, calls, and common situations.',
      },
      {
        title: 'Interview and Presentation Practice',
        description:
          'Mock interviews, short presentations, feedback rounds, and final speaking assessment.',
      },
    ],
  },
  {
    title: 'Full Stack Web Development Mentorship',
    slug: 'full-stack-web-development-mentorship',
    shortDescription:
      'A hybrid mentorship program with recorded modules, live project reviews, attendance, exams, and certificates.',
    description:
      '<p>This premium hybrid course combines recorded lessons with faculty-led live implementation sessions. It demonstrates the complete platform strength: recorded learning, batches, live classes, reminders, attendance, exams, certificates, and learner dashboards.</p>',
    imagePath: '/assets/courses/banner-01.webp',
    imageAlt: 'Hybrid full stack development mentorship dashboard',
    priceInr: '8999.00',
    priceUsd: '179.00',
    duration: '16 weeks',
    mode: CourseDeliveryMode.Hybrid,
    certificate: 'Certificate after progress, attendance, project review, and final exam',
    experienceLevel: 'Beginner to Intermediate',
    studyMaterial:
      'Recorded modules, live class notes, Git workflow guide, project briefs, and review checklists.',
    additionalBook: 'Full Stack Project Workbook',
    language: 'English',
    technologyRequirements:
      'Laptop or desktop, Node.js, VS Code, Git, modern browser, webcam, microphone, and internet.',
    eligibilityRequirements:
      'Basic computer skills required. Prior coding experience is helpful but not mandatory.',
    disclaimer:
      'Project readiness depends on completing both recorded and live learning requirements.',
    exams: 'Final assessment unlocks after progress and attendance requirements are met',
    monthlyLiveClassLimit: 10,
    attendanceType: 'percentage',
    attendanceValue: 75,
    categories: ['Web Development', 'Hybrid Programs'],
    tags: ['Full Stack', 'Mentorship', 'Live Classes', 'Projects'],
    chapters: [
      {
        title: 'Recorded Foundations',
        description:
          'Self-paced modules prepare learners for productive live project sessions.',
        isFree: true,
        lectures: [
          {
            title: 'Development environment setup',
            description:
              'Install and configure Node.js, VS Code, Git, browser tools, and project folders.',
            isFree: true,
          },
          {
            title: 'JavaScript and TypeScript essentials',
            description:
              'Revise variables, functions, async flows, types, and practical debugging habits.',
          },
        ],
      },
      {
        title: 'Frontend Application Build',
        description:
          'Build authenticated screens, dashboards, forms, tables, and reusable UI patterns.',
        lectures: [
          {
            title: 'Component planning',
            description:
              'Break screens into maintainable components, states, and data-fetching boundaries.',
          },
          {
            title: 'Forms and validation',
            description:
              'Create polished form flows with validation, loading states, and helpful errors.',
          },
        ],
      },
      {
        title: 'Backend and Deployment',
        description:
          'Connect APIs, persistence, authentication, deployment checks, and release readiness.',
        lectures: [
          {
            title: 'API contract basics',
            description:
              'Understand endpoints, DTOs, validation, error handling, and integration testing.',
          },
          {
            title: 'Production readiness checklist',
            description:
              'Review environment, build, logs, backups, and deployment validation before launch.',
          },
        ],
      },
    ],
  },
  {
    title: 'Data Analytics Career Track',
    slug: 'data-analytics-career-track',
    shortDescription:
      'A hybrid analytics course with recorded Excel/SQL modules, live dashboard workshops, and portfolio review.',
    description:
      '<p>This hybrid analytics track is designed for learners who need structured practice and live review. Recorded modules cover foundations while faculty-led classes focus on case studies, dashboard interpretation, and portfolio presentation.</p>',
    imagePath: '/assets/courses/course-3.png',
    imageAlt: 'Data analytics dashboard and learner notes',
    priceInr: '5999.00',
    priceUsd: '119.00',
    duration: '10 weeks',
    mode: CourseDeliveryMode.Hybrid,
    certificate: 'Certificate after analytics portfolio, attendance, and final assessment',
    experienceLevel: 'Beginner to Intermediate',
    studyMaterial:
      'Practice datasets, dashboard templates, SQL exercises, and case study briefs.',
    additionalBook: 'Analytics Portfolio Playbook',
    language: 'English',
    technologyRequirements:
      'Laptop or desktop, spreadsheet software, browser, SQL practice tool, and stable internet.',
    eligibilityRequirements:
      'Suitable for students, analysts, operations teams, and career switchers.',
    disclaimer:
      'Portfolio quality depends on completed practice assignments and review participation.',
    exams: 'Final analytics assessment and portfolio review required for certification',
    monthlyLiveClassLimit: 6,
    attendanceType: 'percentage',
    attendanceValue: 75,
    categories: ['Data Analytics', 'Hybrid Programs'],
    tags: ['Excel', 'SQL', 'Dashboards', 'Career Track'],
    chapters: [
      {
        title: 'Analytics Foundations',
        description:
          'Learn data cleaning, metrics, spreadsheet logic, and practical analysis habits.',
        isFree: true,
        lectures: [
          {
            title: 'Data thinking for beginners',
            description:
              'Understand rows, columns, metrics, dimensions, and business questions.',
            isFree: true,
          },
          {
            title: 'Spreadsheet cleanup workflow',
            description:
              'Practice cleaning messy data and preparing it for charts and reports.',
          },
        ],
      },
      {
        title: 'SQL and Reporting',
        description:
          'Use SQL queries and reporting patterns to answer practical business questions.',
        lectures: [
          {
            title: 'SQL select and filters',
            description:
              'Write simple queries, filter records, sort outputs, and avoid common mistakes.',
          },
          {
            title: 'Report storytelling',
            description:
              'Turn metrics into clear observations, risks, and recommendations.',
          },
        ],
      },
      {
        title: 'Live Portfolio Review',
        description:
          'Faculty reviews learner dashboards, case-study logic, and presentation quality.',
        lectures: [
          {
            title: 'Dashboard review checklist',
            description:
              'Check chart choice, labels, insight quality, filtering, and executive summary.',
          },
        ],
      },
    ],
  },
];

const demoCourses = mergeDemoCourses(
  readDemoJson<DemoCourse[]>('courses.json', []),
);
const demoUsers = readDemoJson<DemoUser[]>('users.json', fallbackDemoUsers);
const demoCoupons = readDemoJson<DemoCoupon[]>('coupons.json', []);
const demoArticles = readDemoJson<DemoArticle[]>('articles.json', []);
const demoTestimonials = readDemoJson<DemoTestimonial[]>('testimonials.json', []);
const demoNotificationRules = readDemoJson<DemoNotificationRule[]>(
  'notification-rules.json',
  [],
);
const demoBroadcasts = readDemoJson<DemoBroadcast[]>('broadcasts.json', []);
const demoAutomationJobs = readDemoJson<DemoAutomationJob[]>(
  'automation-jobs.json',
  [],
);
const demoBatches = readDemoJson<DemoBatch[]>('batches.json', []);
const demoClassSessions = readDemoJson<DemoClassSession[]>(
  'class-sessions.json',
  [],
);
const demoAppSettings = readDemoJson<DemoAppSetting[]>('settings.json', []);

const demoFaqs = (courseTitle: string) => [
  {
    question: `Is ${courseTitle} beginner friendly?`,
    answer:
      'Yes. The course starts with foundations and gradually moves into practical application.',
  },
  {
    question: 'Will I get a certificate after completion?',
    answer:
      'Yes. Certification unlocks after the required progress, attendance when applicable, and final exam are completed.',
  },
  {
    question: 'Can I access this on mobile?',
    answer:
      'You can browse course details and dashboard updates on mobile. For coding practice and live classes, a laptop or desktop is recommended.',
  },
];

const createDemoExam = (courseTitle: string) => ({
  title: `${courseTitle} Final Assessment`,
  description:
    'A practical assessment to validate learner readiness before certification is issued.',
  instructions:
    'Answer every question carefully. The assessment includes objective questions, short answers, and ordering tasks.',
  passingPercentage: 70,
  maxAttempts: 3,
  timeLimitMinutes: 20,
  showResultImmediately: true,
  isPublished: true,
  questions: [
    {
      id: createId('q1'),
      prompt: 'Which learning outcome matters most in this course?',
      type: 'single' as const,
      points: 2,
      explanation:
        'The course is designed around practical understanding and confident application.',
      acceptedAnswers: [],
      options: [
        {
          id: createId('q1o1'),
          text: 'Only memorising definitions',
          isCorrect: false,
        },
        {
          id: createId('q1o2'),
          text: 'Building practical understanding through application',
          isCorrect: true,
        },
        {
          id: createId('q1o3'),
          text: 'Skipping practice and attempting the exam directly',
          isCorrect: false,
        },
      ],
    },
    {
      id: createId('q2'),
      prompt: 'Select habits that improve learner performance.',
      type: 'multiple' as const,
      points: 3,
      explanation:
        'Consistency, revision, and practice improve retention and assessment performance.',
      acceptedAnswers: [],
      options: [
        { id: createId('q2o1'), text: 'Regular revision', isCorrect: true },
        { id: createId('q2o2'), text: 'Hands-on practice', isCorrect: true },
        { id: createId('q2o3'), text: 'Skipping modules', isCorrect: false },
        {
          id: createId('q2o4'),
          text: 'Reviewing feedback before retrying',
          isCorrect: true,
        },
      ],
    },
    {
      id: createId('q3'),
      prompt: 'True or False: Certification can be unlocked without meeting course requirements.',
      type: 'true_false' as const,
      points: 2,
      explanation:
        'Certification requires the configured learning, attendance, and exam requirements.',
      acceptedAnswers: [],
      options: [
        { id: createId('q3o1'), text: 'True', isCorrect: false },
        { id: createId('q3o2'), text: 'False', isCorrect: true },
      ],
    },
    {
      id: createId('q4'),
      prompt: 'Write one word learners should build along with knowledge.',
      type: 'short_text' as const,
      points: 2,
      explanation: 'Confidence is a core learning outcome.',
      acceptedAnswers: ['confidence', 'self confidence', 'self-confidence'],
      options: [],
    },
    {
      id: createId('q5'),
      prompt: 'Arrange the certification journey in a sensible order.',
      type: 'drag_drop' as const,
      points: 3,
      explanation:
        'Learners should study, revise, attempt the exam, and then unlock the certificate.',
      acceptedAnswers: [],
      options: [
        { id: createId('q5o1'), text: 'Complete learning modules', isCorrect: false },
        { id: createId('q5o2'), text: 'Revise key concepts', isCorrect: false },
        { id: createId('q5o3'), text: 'Attempt final assessment', isCorrect: false },
        { id: createId('q5o4'), text: 'Unlock certificate', isCorrect: false },
      ],
    },
  ],
});

async function getRole(dataSource: DataSource, name: string) {
  const roleRepository = dataSource.getRepository(Role);
  const role = await roleRepository.findOne({ where: { name } });

  if (!role) {
    throw new Error(`Role "${name}" is missing. Run role seed before demo data.`);
  }

  return role;
}

async function getDemoUser(
  dataSource: DataSource,
  payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    phoneNumber?: string;
    role: Role;
    avatarUrl?: string;
  },
) {
  const userRepository = dataSource.getRepository(User);
  const studentRole = await getRole(dataSource, 'student');
  const existingUser = await userRepository.findOne({
    where: { email: payload.email },
    relations: { roles: true },
  });

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const phoneNumber = payload.phoneNumber
    ? await userRepository
        .createQueryBuilder('user')
        .select(['user.id'])
        .where('user.phoneNumber = :phoneNumber', {
          phoneNumber: payload.phoneNumber,
        })
        .getOne()
        .then((phoneOwner) =>
          !phoneOwner || phoneOwner.id === existingUser?.id
            ? payload.phoneNumber
            : null,
        )
    : null;

  const roles =
    payload.role.name === 'student'
      ? [studentRole]
      : [studentRole, payload.role];

  if (existingUser) {
    existingUser.firstName = payload.firstName;
    existingUser.lastName = payload.lastName;
    existingUser.username = payload.username;
    existingUser.phoneNumber = phoneNumber;
    existingUser.password = password;
    existingUser.avatarUrl = payload.avatarUrl || null;
    existingUser.emailVerified = existingUser.emailVerified || new Date();
    existingUser.roles = roles;
    return userRepository.save(existingUser);
  }

  return userRepository.save(
    userRepository.create({
      firstName: payload.firstName,
      lastName: payload.lastName,
      username: payload.username,
      email: payload.email,
      phoneNumber,
      password,
      avatarUrl: payload.avatarUrl || null,
      emailVerified: new Date(),
      roles,
    }),
  );
}

async function upsertLearnerProfile(
  dataSource: DataSource,
  user: User,
  headline: string,
) {
  const profileRepository = dataSource.getRepository(UserProfile);
  const existingProfile = await profileRepository.findOne({
    where: { user: { id: user.id } },
    relations: { user: true },
  });

  const profile =
    existingProfile ||
    profileRepository.create({
      user,
    });

  profile.headline = headline;
  profile.bio =
    'Demo learner profile used for marketplace screenshots and testing.';
  profile.location = 'Bengaluru, India';
  profile.isPublic = true;
  profile.showCourses = true;
  profile.showCertificates = true;

  await profileRepository.save(profile);
}

async function upsertInstructorPublicProfile(
  dataSource: DataSource,
  user: User,
  index: number,
) {
  const profileRepository = dataSource.getRepository(UserProfile);
  const existingProfile = await profileRepository.findOne({
    where: { user: { id: user.id } },
    relations: { user: true },
  });

  const profile =
    existingProfile ||
    profileRepository.create({
      user,
    });
  const slug = `${user.firstName}-${user.lastName || user.username}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  profile.headline = profile.headline || 'CodeWithKasa instructor';
  profile.bio =
    profile.bio ||
    `${user.firstName} mentors learners through practical CodeWithKasa projects, review sessions, and career-focused learning paths.`;
  profile.location = profile.location || 'India';
  profile.isPublic = true;
  profile.showCourses = true;
  profile.showCertificates = true;
  profile.linkedin = `https://www.linkedin.com/in/${slug}`;
  profile.instagram = `https://www.instagram.com/${slug}`;
  profile.twitter = `https://x.com/${slug}`;
  profile.youtube =
    index % 3 === 0 ? `https://www.youtube.com/@${slug}` : profile.youtube;
  profile.facebook =
    index % 4 === 0 ? `https://www.facebook.com/${slug}` : profile.facebook;

  await profileRepository.save(profile);
}

async function upsertFacultyProfile(
  dataSource: DataSource,
  user: User,
  payload: {
    expertise: string;
    designation: string;
    experience: string;
  },
) {
  const profileRepository = dataSource.getRepository(FacultyProfile);
  const existingProfile = await profileRepository.findOne({
    where: { user: { id: user.id } },
    relations: { user: true },
  });

  const profile =
    existingProfile ||
    profileRepository.create({
      user,
    });

  profile.expertise = payload.expertise;
  profile.designation = payload.designation;
  profile.experience = payload.experience;
  profile.isApproved = true;

  await profileRepository.save(profile);
}

async function seedDemoUsers(dataSource: DataSource) {
  const adminRole = await getRole(dataSource, 'admin');
  const facultyRole = await getRole(dataSource, 'faculty');
  const studentRole = await getRole(dataSource, 'student');
  const roleMap = {
    admin: adminRole,
    faculty: facultyRole,
    student: studentRole,
  };

  const seededUsers: User[] = [];

  for (const demoUser of demoUsers) {
    const userRole = demoUser.role || 'student';
    const user = await getDemoUser(dataSource, {
      ...demoUser,
      role: roleMap[userRole],
    });

    if (demoUser.facultyProfile) {
      await upsertFacultyProfile(dataSource, user, demoUser.facultyProfile);
      await upsertInstructorPublicProfile(dataSource, user, seededUsers.length);
    }

    if (userRole === 'student') {
      await upsertLearnerProfile(
        dataSource,
        user,
        demoUser.headline || 'Demo learner',
      );
    }

    seededUsers.push(user);
  }

  return {
    admin:
      seededUsers.find((user) =>
        user.roles?.some((role) => role.name === 'admin'),
      ) || seededUsers[0],
    facultyUsers: seededUsers.filter((user) =>
      user.roles?.some((role) => role.name === 'faculty'),
    ),
    learnerUsers: seededUsers.filter((user) =>
      user.roles?.some((role) => role.name === 'student'),
    ),
    allUsers: seededUsers,
  };
}

async function getUpload(dataSource: DataSource, path: string, name: string) {
  const uploadRepository = dataSource.getRepository(Upload);
  const existingUpload = await uploadRepository.findOne({ where: { path } });

  const isVideo = path.endsWith('.mp4') || path.endsWith('.webm');
  const type = isVideo ? FileTypes.VIDEO : FileTypes.IMAGE;
  const mime = path.endsWith('.mp4')
    ? 'video/mp4'
    : path.endsWith('.webm')
      ? 'video/webm'
      : path.endsWith('.pdf')
        ? 'application/pdf'
      : path.endsWith('.webp')
        ? 'image/webp'
        : path.endsWith('.png')
          ? 'image/png'
          : 'image/jpeg';
  const uploadType = path.endsWith('.pdf') ? FileTypes.PDF : type;

  if (existingUpload) {
    existingUpload.name = name;
    existingUpload.type = uploadType;
    existingUpload.mime = mime;
    existingUpload.status = UploadStatus.COMPLETED;
    return uploadRepository.save(existingUpload);
  }

  return uploadRepository.save(
    uploadRepository.create({
      name,
      path,
      type: uploadType,
      mime,
      size: 0,
      status: UploadStatus.COMPLETED,
    }),
  );
}

async function getCategory(
  dataSource: DataSource,
  name: string,
  createdBy: User,
) {
  const categoryRepository = dataSource.getRepository(Category);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existingCategory = await categoryRepository.findOne({
    where: { slug, type: CategoryType.COURSE },
  });

  if (existingCategory) return existingCategory;

  return categoryRepository.save(
    categoryRepository.create({
      name,
      slug,
      type: CategoryType.COURSE,
      description: `${name} course category`,
      createdBy,
    }),
  );
}

async function getTag(dataSource: DataSource, name: string, createdBy: User) {
  const tagRepository = dataSource.getRepository(Tag);
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const existingTag = await tagRepository.findOne({ where: { slug } });

  if (existingTag) return existingTag;

  return tagRepository.save(
    tagRepository.create({
      name,
      slug,
      description: `${name} course tag`,
      createdBy,
    }),
  );
}

const toSlug = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function dateOnlyFromOffset(offsetDays: number) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

function classDateFromOffset(
  offsetDays: number,
  hour: number,
  minute: number,
  durationMinutes = 60,
) {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + offsetDays);
  startsAt.setHours(hour, minute, 0, 0);
  const endsAt = new Date(startsAt.getTime() + durationMinutes * 60 * 1000);

  return { startsAt, endsAt };
}

async function seedDemoCoupons(dataSource: DataSource) {
  const couponRepository = dataSource.getRepository(Coupon);
  const courseRepository = dataSource.getRepository(Course);

  for (const demoCoupon of demoCoupons) {
    const applicableCourses = demoCoupon.courseSlugs?.length
      ? await courseRepository.find({
          where: demoCoupon.courseSlugs.map((slug) => ({ slug })),
        })
      : [];
    const existingCoupon = await couponRepository.findOne({
      where: { code: demoCoupon.code },
    });
    const coupon = existingCoupon || couponRepository.create({ code: demoCoupon.code });

    coupon.type = demoCoupon.type;
    coupon.value = demoCoupon.value;
    coupon.scope = demoCoupon.scope;
    coupon.status = demoCoupon.status;
    coupon.minOrderValue = demoCoupon.minOrderValue;
    coupon.maxDiscount = demoCoupon.maxDiscount;
    coupon.usageLimit = demoCoupon.usageLimit;
    coupon.perUserLimit = demoCoupon.perUserLimit || 1;
    coupon.isAutoApply = Boolean(demoCoupon.isAutoApply);
    coupon.applicableCourseIds = applicableCourses.map((course) => course.id);
    coupon.meta = { demo: true };

    await couponRepository.save(coupon);
  }
}

async function seedDemoArticles(dataSource: DataSource, systemUser: User) {
  const articleRepository = dataSource.getRepository(Article);

  for (const demoArticle of demoArticles) {
    const featuredImage = await getUpload(
      dataSource,
      demoArticle.imagePath,
      `${demoArticle.title} cover`,
    );
    const categories = await Promise.all(
      demoArticle.categories.map((category) =>
        getCategory(dataSource, category, systemUser),
      ),
    );
    const tags = await Promise.all(
      demoArticle.tags.map((tag) => getTag(dataSource, tag, systemUser)),
    );
    const existingArticle = await articleRepository.findOne({
      where: { slug: demoArticle.slug },
    });
    const article =
      existingArticle ||
      articleRepository.create({
        slug: demoArticle.slug,
        createdBy: systemUser,
      });

    article.title = demoArticle.title;
    article.excerpt = demoArticle.excerpt;
    article.content = demoArticle.content;
    article.featuredImage = featuredImage;
    article.imageAlt = demoArticle.imageAlt;
    article.author = systemUser;
    article.categories = categories;
    article.tags = tags;
    article.metaTitle = demoArticle.title;
    article.metaSlug = demoArticle.slug;
    article.metaDescription = demoArticle.excerpt.slice(0, 160);
    article.readingTime = demoArticle.readingTime;
    article.isFeatured = Boolean(demoArticle.isFeatured);
    article.isPublished = true;
    article.publishedAt = new Date();
    article.updatedBy = systemUser;

    await articleRepository.save(article);
  }
}

async function seedDemoTestimonials(dataSource: DataSource) {
  const testimonialRepository = dataSource.getRepository(Testimonial);
  const courseRepository = dataSource.getRepository(Course);

  for (const demoTestimonial of demoTestimonials) {
    const avatar = await getUpload(
      dataSource,
      demoTestimonial.avatarPath,
      `${demoTestimonial.name} avatar`,
    );
    const courses = demoTestimonial.courseSlugs?.length
      ? await courseRepository.find({
          where: demoTestimonial.courseSlugs.map((slug) => ({ slug })),
        })
      : [];
    let testimonial = await testimonialRepository.findOne({
      where: { name: demoTestimonial.name, message: demoTestimonial.message },
      relations: { courses: true },
    });

    testimonial =
      testimonial ||
      testimonialRepository.create({
        name: demoTestimonial.name,
        message: demoTestimonial.message,
      });
    testimonial.designation = demoTestimonial.designation;
    testimonial.company = demoTestimonial.company;
    testimonial.type = TestimonialType.TEXT;
    testimonial.avatar = avatar;
    testimonial.avatarAlt = demoTestimonial.avatarAlt;
    testimonial.rating = demoTestimonial.rating;
    testimonial.isActive = true;
    testimonial.isFeatured = true;
    testimonial.priority = demoTestimonial.priority || 0;
    testimonial.status = TestimonialStatus.APPROVED;
    testimonial.courses = courses;

    await testimonialRepository.save(testimonial);
  }
}

async function seedDemoEngagement(dataSource: DataSource, systemUser: User) {
  const ruleRepository = dataSource.getRepository(NotificationRule);
  const broadcastRepository = dataSource.getRepository(NotificationBroadcast);
  const automationRepository = dataSource.getRepository(AutomationJob);

  for (const demoRule of demoNotificationRules) {
    const existingRule = await ruleRepository.findOne({
      where: { eventKey: demoRule.eventKey },
    });
    const rule =
      existingRule ||
      ruleRepository.create({
        eventKey: demoRule.eventKey,
        createdBy: systemUser,
      });

    rule.label = demoRule.label;
    rule.description = demoRule.description;
    rule.isEnabled = demoRule.isEnabled;
    rule.audience = demoRule.audience;
    rule.channels = demoRule.channels;
    rule.type = demoRule.type;
    rule.titleTemplate = demoRule.titleTemplate;
    rule.messageTemplate = demoRule.messageTemplate;
    rule.hrefTemplate = demoRule.hrefTemplate || null;
    rule.imageUrl = demoRule.imageUrl || null;
    rule.createdBy = systemUser;

    await ruleRepository.save(rule);
  }

  for (const demoBroadcast of demoBroadcasts) {
    const existingBroadcast = await broadcastRepository.findOne({
      where: { title: demoBroadcast.title },
    });
    const broadcast =
      existingBroadcast ||
      broadcastRepository.create({
        title: demoBroadcast.title,
        createdBy: systemUser,
      });

    broadcast.message = demoBroadcast.message;
    broadcast.href = demoBroadcast.href || null;
    broadcast.imageUrl = demoBroadcast.imageUrl || null;
    broadcast.type = demoBroadcast.type;
    broadcast.audience = demoBroadcast.audience;
    broadcast.channels = demoBroadcast.channels;
    broadcast.status = demoBroadcast.status;
    broadcast.sentAt =
      demoBroadcast.status === BroadcastStatus.Sent
        ? broadcast.sentAt || new Date()
        : null;
    broadcast.recipientCount = broadcast.recipientCount || 0;
    broadcast.deliveredCount = broadcast.deliveredCount || 0;
    broadcast.createdBy = systemUser;

    await broadcastRepository.save(broadcast);
  }

  for (const demoJob of demoAutomationJobs) {
    const existingJob = await automationRepository.findOne({
      where: { slug: demoJob.slug },
    });
    const job =
      existingJob ||
      automationRepository.create({
        slug: demoJob.slug,
        createdBy: systemUser,
      });

    job.name = demoJob.name;
    job.description = demoJob.description;
    job.status = demoJob.status;
    job.triggerType = demoJob.triggerType;
    job.cronExpression = demoJob.cronExpression || null;
    job.timezone = demoJob.timezone || 'Asia/Kolkata';
    job.actionType = demoJob.actionType;
    job.actionPayload = demoJob.actionPayload || null;
    job.conditions = demoJob.conditions || null;
    job.createdBy = systemUser;

    await automationRepository.save(job);
  }
}

async function seedDemoLiveOperations(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);
  const userRepository = dataSource.getRepository(User);
  const batchRepository = dataSource.getRepository(CourseBatch);
  const batchStudentRepository = dataSource.getRepository(BatchStudent);
  const sessionRepository = dataSource.getRepository(ClassSession);

  for (const demoBatch of demoBatches) {
    const course = await courseRepository.findOne({
      where: { slug: demoBatch.courseSlug },
    });
    const faculty = await userRepository.findOne({
      where: { email: demoBatch.facultyEmail },
    });

    if (!course || !faculty) continue;

    const existingBatch = await batchRepository.findOne({
      where: { code: demoBatch.code },
    });
    const batch =
      existingBatch ||
      batchRepository.create({
        code: demoBatch.code,
      });

    batch.name = demoBatch.name;
    batch.description = demoBatch.description;
    batch.course = course;
    batch.faculty = faculty;
    batch.status = demoBatch.status;
    batch.startDate = dateOnlyFromOffset(demoBatch.startOffsetDays);
    batch.endDate = dateOnlyFromOffset(demoBatch.endOffsetDays);
    batch.capacity = demoBatch.capacity;

    const savedBatch = await batchRepository.save(batch);
    await batchStudentRepository
      .createQueryBuilder()
      .delete()
      .where('batchId = :batchId', { batchId: savedBatch.id })
      .execute();

    const students = await userRepository.find({
      where: demoBatch.studentEmails.map((email) => ({ email })),
    });

    await batchStudentRepository.save(
      students.map((student) =>
        batchStudentRepository.create({
          batch: savedBatch,
          student,
          status: BatchStudentStatus.Active,
        }),
      ),
    );
  }

  for (const demoSession of demoClassSessions) {
    const batch = await batchRepository.findOne({
      where: { code: demoSession.batchCode },
    });
    const course = await courseRepository.findOne({
      where: { slug: demoSession.courseSlug },
    });
    const faculty = await userRepository.findOne({
      where: { email: demoSession.facultyEmail },
    });

    if (!batch || !course || !faculty) continue;

    const { startsAt, endsAt } = classDateFromOffset(
      demoSession.startsInDays,
      demoSession.startHour,
      demoSession.startMinute,
      demoSession.durationMinutes,
    );
    const existingSession = await sessionRepository.findOne({
      where: { title: demoSession.title, batch: { id: batch.id } },
      relations: { batch: true },
    });
    const session = existingSession || sessionRepository.create({ batch });

    session.batch = batch;
    session.course = course;
    session.faculty = faculty;
    session.title = demoSession.title;
    session.description = demoSession.description;
    session.startsAt = startsAt;
    session.endsAt = endsAt;
    session.timezone = demoSession.timezone || 'Asia/Kolkata';
    session.status = demoSession.status;
    session.reminderBeforeMinutes = demoSession.reminderOffsetsMinutes?.[0] || 60;
    session.reminderOffsetsMinutes = demoSession.reminderOffsetsMinutes || [60];
    session.bbbRecord = Boolean(demoSession.bbbRecord);
    session.allowRecordingAccess = Boolean(demoSession.allowRecordingAccess);

    await sessionRepository.save(session);
  }
}

async function seedDemoSettings(dataSource: DataSource) {
  const settingRepository = dataSource.getRepository(AppSetting);

  for (const demoSetting of demoAppSettings) {
    const existingSetting = await settingRepository.findOne({
      where: { key: demoSetting.key },
    });
    const setting =
      existingSetting ||
      settingRepository.create({
        key: demoSetting.key,
      });

    setting.valueJson = demoSetting.valueJson;
    setting.valueEnc = null;
    setting.isEncrypted = false;

    await settingRepository.save(setting);
  }
}

const demoCourseReviewComments = [
  'The course flow is practical and the examples feel close to real project work.',
  'Lessons are easy to follow, and the checkpoints helped me revise quickly.',
  'Good balance of theory, practice, and portfolio-style tasks.',
  'The faculty explanations are clear and the resources are useful for revision.',
  'I liked the structure because every section ends with something hands-on.',
  'This helped me understand the topic with real implementation confidence.',
  'Assignments and resource PDFs made the learning path feel complete.',
  'Great for building consistency because the lectures are short and focused.',
  'The course examples match the kind of work I wanted to practice.',
  'Very useful demo curriculum for testing learning progress and reviews.',
];

async function seedDemoCourseReviews(
  dataSource: DataSource,
  courses: Course[],
  users: User[],
) {
  if (!courses.length || !users.length) return;

  const reviewRepository = dataSource.getRepository(CourseReview);
  const ratingPattern = [
    5, 5, 5, 5, 4, 5, 4, 5, 5, 4, 5, 3, 5, 2, 1, 5, 4, 5, 5, 4,
  ];

  for (const [courseIndex, course] of courses.entries()) {
    const reviewCount = Math.min(users.length, 45 + (courseIndex % 6));
    const reviews: CourseReview[] = [];

    for (let index = 0; index < reviewCount; index += 1) {
      const user = users[(courseIndex * 11 + index) % users.length];
      let review = await reviewRepository.findOne({
        where: { course: { id: course.id }, user: { id: user.id } },
        relations: { course: true, user: true },
        withDeleted: true,
      });

      if (!review) {
        review = reviewRepository.create({ course, user });
      }

      review.rating =
        ratingPattern[(courseIndex + index) % ratingPattern.length];
      review.comment = `${
        demoCourseReviewComments[
          (courseIndex + index) % demoCourseReviewComments.length
        ]
      } ${course.title} has a clean learning path for demo testing.`;
      review.isPublished = true;
      review.deletedAt = null as unknown as Date;

      reviews.push(review);
    }

    await reviewRepository.save(reviews);
  }
}

const demoFacultyReviewComments = [
  'Clear explanations, practical examples, and patient guidance throughout the learning path.',
  'The instructor connects concepts with real project decisions, which made the sessions useful.',
  'Supportive teaching style with strong feedback on assignments and portfolio work.',
  'Very structured mentoring and helpful answers during doubt-clearing discussions.',
  'The examples felt realistic and the instructor kept the pace comfortable.',
  'Strong subject knowledge and practical suggestions for improving project quality.',
];

async function seedDemoFacultyReviews(
  dataSource: DataSource,
  faculties: User[],
  users: User[],
) {
  if (!faculties.length || !users.length) return;

  const reviewRepository = dataSource.getRepository(FacultyReview);
  const ratingPattern = [
    5, 5, 5, 4, 5, 4, 5, 5, 3, 5, 4, 5, 2, 5, 5, 4, 5, 3, 5, 4,
  ];

  for (const [facultyIndex, faculty] of faculties.entries()) {
    const reviewCount = Math.min(users.length, 40 + (facultyIndex % 8));
    const reviews: FacultyReview[] = [];

    for (let index = 0; index < reviewCount; index += 1) {
      const user = users[(facultyIndex * 7 + index) % users.length];
      if (user.id === faculty.id) continue;

      let review = await reviewRepository.findOne({
        where: { faculty: { id: faculty.id }, user: { id: user.id } },
        relations: { faculty: true, user: true },
        withDeleted: true,
      });

      if (!review) {
        review = reviewRepository.create({ faculty, user });
      }

      review.rating =
        ratingPattern[(facultyIndex + index) % ratingPattern.length];
      review.comment = `${
        demoFacultyReviewComments[
          (facultyIndex + index) % demoFacultyReviewComments.length
        ]
      } ${faculty.firstName} brings practical instructor energy to the demo academy.`;
      review.isPublished = true;
      review.deletedAt = null as unknown as Date;

      reviews.push(review);
    }

    await reviewRepository.save(reviews);
  }
}

async function seedDemoEnrollments(
  dataSource: DataSource,
  courses: Course[],
  users: User[],
) {
  if (!courses.length || !users.length) return;

  const orderRepository = dataSource.getRepository(Order);
  const orderItemRepository = dataSource.getRepository(OrderItem);
  const enrollmentRepository = dataSource.getRepository(Enrollment);

  for (const [courseIndex, course] of courses.entries()) {
    const enrollmentCount = Math.min(users.length, 45 + (courseIndex % 6));

    for (let index = 0; index < enrollmentCount; index += 1) {
      const user = users[(courseIndex * 11 + index) % users.length];
      const totalAmount = Number(course.priceInr || 0);
      const orderCode = `cwk_demo_${course.id}_${user.id}`;
      const paidAt = new Date(
        Date.now() - (courseIndex * 3 + index + 1) * 24 * 60 * 60 * 1000,
      );

      let order = await orderRepository.findOne({
        where: { orderId: orderCode },
        relations: { user: true, items: true },
      });

      if (!order) {
        order = await orderRepository.save(
          orderRepository.create({
            user,
            subTotal: totalAmount,
            discount: 0,
            autoDiscount: 0,
            manualDiscount: 0,
            tax: 0,
            totalAmount,
            currency: 'INR',
            paymentId: `pay_${orderCode}`,
            orderId: orderCode,
            paymentAttempts: 1,
            paidAt,
            paymentMethod: 'DEMO',
            paymentMode: 'demo_seed',
            status: OrderStatus.PAID,
            billingAddress: {
              firstName: user.firstName,
              lastName: user.lastName || '',
              email: user.email,
              phoneNumber: user.phoneNumber || '+91-9809-000000',
              address: 'CodeWithKasa demo billing address',
              country: 'India',
              state: 'Delhi',
              city: 'New Delhi',
              pincode: '110001',
            },
          }),
        );
      } else {
        order.user = user;
        order.subTotal = totalAmount;
        order.discount = 0;
        order.autoDiscount = 0;
        order.manualDiscount = 0;
        order.tax = 0;
        order.totalAmount = totalAmount;
        order.currency = 'INR';
        order.paymentId = order.paymentId || `pay_${orderCode}`;
        order.paymentAttempts = 1;
        order.paidAt = order.paidAt || paidAt;
        order.paymentMethod = 'DEMO';
        order.paymentMode = 'demo_seed';
        order.status = OrderStatus.PAID;
        await orderRepository.save(order);
      }

      const existingItem = await orderItemRepository.findOne({
        where: { order: { id: order.id }, course: { id: course.id } },
      });

      if (!existingItem) {
        await orderItemRepository.save(
          orderItemRepository.create({
            order,
            course,
            price: totalAmount,
            quantity: 1,
          }),
        );
      }

      let enrollment = await enrollmentRepository.findOne({
        where: { user: { id: user.id }, course: { id: course.id } },
        relations: { user: true, course: true, order: true },
      });

      if (!enrollment) {
        enrollment = enrollmentRepository.create({
          user,
          course,
          order,
        });
      }

      enrollment.isActive = true;
      enrollment.order = order;
      enrollment.progress = Math.min(98, 12 + ((courseIndex * 7 + index) % 87));

      await enrollmentRepository.save(enrollment);
    }
  }
}

const demoArticleCommentMessages = [
  'This article makes the topic easy to connect with practical learning.',
  'The examples feel useful for learners who are building real projects.',
  'I liked the structure and the checklist-style explanation.',
  'Helpful points for planning the next practice session.',
  'This gives a clear direction without making the topic feel heavy.',
  'The article is useful for both beginners and people revising the concept.',
  'Good reminder to focus on implementation, not only theory.',
  'The CodeWithKasa examples make the advice easier to apply.',
  'This helped me think through the learning path more clearly.',
  'Nice practical read for learners preparing a portfolio.',
];

async function seedDemoArticleComments(dataSource: DataSource, users: User[]) {
  if (!users.length) return;

  const articleRepository = dataSource.getRepository(Article);
  const commentRepository = dataSource.getRepository(ArticleComment);
  const articles = await articleRepository.find({
    where: demoArticles.map((article) => ({ slug: article.slug })),
    order: { id: 'ASC' },
  });

  for (const [articleIndex, article] of articles.entries()) {
    const commentCount = Math.min(users.length, 45 + (articleIndex % 6));
    const rootComments: ArticleComment[] = [];

    for (let index = 0; index < commentCount; index += 1) {
      const user = users[(articleIndex * 13 + index) % users.length];
      const content = `${
        demoArticleCommentMessages[
          (articleIndex + index) % demoArticleCommentMessages.length
        ]
      } (${article.title})`;

      let comment = await commentRepository.findOne({
        where: {
          article: { id: article.id },
          user: { id: user.id },
          content,
        },
        relations: { article: true, user: true, likedBy: true },
      });

      if (!comment) {
        comment = commentRepository.create({
          article,
          user,
          content,
        });
      }

      const likedBy = [1, 2, 3]
        .map((offset) => users[(articleIndex + index + offset) % users.length])
        .filter((likeUser) => likeUser.id !== user.id);

      comment.parent = null;
      comment.isPublished = true;
      comment.likedBy = likedBy;

      rootComments.push(await commentRepository.save(comment));
    }

    for (let index = 0; index < Math.min(10, rootComments.length); index += 1) {
      const parent = rootComments[index];
      const user = users[(articleIndex * 17 + index + 9) % users.length];
      const content = `Replying to this point because it connects well with demo learning workflows for ${article.title}.`;

      let reply = await commentRepository.findOne({
        where: {
          article: { id: article.id },
          user: { id: user.id },
          parent: { id: parent.id },
          content,
        },
        relations: { article: true, user: true, parent: true, likedBy: true },
      });

      if (!reply) {
        reply = commentRepository.create({
          article,
          user,
          parent,
          content,
        });
      }

      reply.isPublished = true;
      reply.likedBy = [
        users[(articleIndex + index + 4) % users.length],
        users[(articleIndex + index + 7) % users.length],
      ].filter((likeUser) => likeUser.id !== user.id);

      await commentRepository.save(reply);
    }
  }
}

export async function seedProductionDemoContent(dataSource: DataSource) {
  const courseRepository = dataSource.getRepository(Course);
  const chapterRepository = dataSource.getRepository(Chapter);
  const lectureRepository = dataSource.getRepository(Lecture);
  const attachmentRepository = dataSource.getRepository(Attachment);
  const userRepository = dataSource.getRepository(User);
  const seededDemoUsers = await seedDemoUsers(dataSource);
  const systemUser = seededDemoUsers.admin;
  const allFacultyUsers = await userRepository
    .createQueryBuilder('user')
    .leftJoinAndSelect('user.roles', 'roles')
    .where('roles.name = :roleName', { roleName: 'faculty' })
    .getMany();
  const allReviewUsers = await userRepository.find();
  const facultyUsers = allFacultyUsers.length
    ? allFacultyUsers
    : [systemUser];
  const savedCourses: Course[] = [];

  for (const [courseIndex, demoCourse] of demoCourses.entries()) {
    const image = await getUpload(
      dataSource,
      demoCourse.imagePath,
      `${demoCourse.title} cover`,
    );
    const video = demoCourse.videoPath
      ? await getUpload(
          dataSource,
          demoCourse.videoPath,
          `${demoCourse.title} preview video`,
        )
      : null;
    const categories = await Promise.all(
      demoCourse.categories.map((category) =>
        getCategory(dataSource, category, systemUser),
      ),
    );
    const tags = await Promise.all(
      demoCourse.tags.map((tag) => getTag(dataSource, tag, systemUser)),
    );

    let course = await courseRepository.findOne({
      where: { slug: demoCourse.slug },
      relations: {
        chapters: true,
      },
    });

    if (!course) {
      course = courseRepository.create({
        slug: demoCourse.slug,
        createdBy: systemUser,
      });
    } else if (course.chapters?.length) {
      await chapterRepository.remove(course.chapters);
    }

    course.title = demoCourse.title;
    course.shortDescription = demoCourse.shortDescription;
    course.description = demoCourse.description;
    course.metaTitle = demoCourse.title;
    course.metaSlug = demoCourse.slug;
    course.metaDescription = demoCourse.shortDescription.slice(0, 160);
    course.image = image;
    course.imageAlt = demoCourse.imageAlt;
    course.video = video;
    course.isFree = false;
    course.isFeatured = Boolean(demoCourse.isFeatured);
    course.showInHero = Boolean(demoCourse.showInHero);
    course.showInPopular = Boolean(demoCourse.showInPopular);
    course.showInMegaMenu = Boolean(demoCourse.showInMegaMenu);
    course.isPublished = true;
    course.priceInr = demoCourse.priceInr;
    course.priceUsd = demoCourse.priceUsd;
    course.duration = demoCourse.duration;
    course.mode = demoCourse.mode;
    course.monthlyLiveClassLimit = demoCourse.monthlyLiveClassLimit ?? null;
    course.liveClassAttendanceRequirementType =
      demoCourse.attendanceType ?? 'percentage';
    course.liveClassAttendanceRequirementValue =
      demoCourse.attendanceValue ?? 75;
    course.certificate = demoCourse.certificate;
    course.exams = demoCourse.exams;
    course.experienceLevel = demoCourse.experienceLevel;
    course.studyMaterial = demoCourse.studyMaterial;
    course.additionalBook = demoCourse.additionalBook;
    course.language = demoCourse.language;
    course.technologyRequirements = demoCourse.technologyRequirements;
    course.eligibilityRequirements = demoCourse.eligibilityRequirements;
    course.disclaimer = demoCourse.disclaimer;
    course.faqs = demoFaqs(demoCourse.title);
    course.exam = createDemoExam(demoCourse.title);
    course.categories = categories;
    course.tags = tags;
    course.faculties = [facultyUsers[courseIndex % facultyUsers.length]];
    course.updatedBy = systemUser;

    const savedCourse = await courseRepository.save(course);
    savedCourses.push(savedCourse);

    for (const [chapterIndex, demoChapter] of demoCourse.chapters.entries()) {
      const chapter = await chapterRepository.save(
        chapterRepository.create({
          title: demoChapter.title,
          description: demoChapter.description,
          position: chapterIndex + 1,
          isPublished: true,
          isFree: Boolean(demoChapter.isFree),
          course: savedCourse,
        }),
      );

      for (const [lectureIndex, demoLecture] of (
        demoChapter.lectures ?? []
      ).entries()) {
        const lecture = await lectureRepository.save(
          lectureRepository.create({
            title: demoLecture.title,
            description: demoLecture.description,
            position: lectureIndex + 1,
            isPublished: true,
            isFree: Boolean(demoLecture.isFree),
            video: demoLecture.videoPath
              ? await getUpload(
                  dataSource,
                  demoLecture.videoPath,
                  `${demoLecture.title} preview video`,
                )
              : null,
            chapter,
          }),
        );

        for (const attachmentPath of demoLecture.attachmentPaths ?? []) {
          const file = await getUpload(
            dataSource,
            attachmentPath,
            `${demoLecture.title} resource`,
          );
          await attachmentRepository.save(
            attachmentRepository.create({
              name: `${demoLecture.title} resource`,
              file,
              lecture,
            }),
          );
        }
      }
    }
  }

  await seedDemoCourseReviews(
    dataSource,
    savedCourses,
    allReviewUsers.length ? allReviewUsers : seededDemoUsers.allUsers,
  );
  await seedDemoFacultyReviews(
    dataSource,
    allFacultyUsers,
    allReviewUsers.length ? allReviewUsers : seededDemoUsers.allUsers,
  );
  await seedDemoEnrollments(
    dataSource,
    savedCourses,
    allReviewUsers.length ? allReviewUsers : seededDemoUsers.allUsers,
  );
  await seedDemoCoupons(dataSource);
  await seedDemoArticles(dataSource, systemUser);
  await seedDemoArticleComments(dataSource, seededDemoUsers.allUsers);
  await seedDemoTestimonials(dataSource);
  await seedDemoEngagement(dataSource, systemUser);
  await seedDemoLiveOperations(dataSource);
  await seedAssignmentDemo(dataSource);
  await seedDemoSettings(dataSource);

  console.log(
    `✅ Production demo content seeded (${demoCourses.length} courses, ${demoCoupons.length} coupons, ${demoArticles.length} articles)`,
  );
}
