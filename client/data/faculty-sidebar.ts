import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Layers,
  ListChecks,
  ListVideo,
  Video,
  Users,
} from "lucide-react";
import type { SidebarNavItem } from "./sidebar";

export const facultySidebarData: { navMain: SidebarNavItem[] } = {
  navMain: [
    {
      title: "Dashboard",
      url: "/faculty/dashboard",
      icon: LayoutDashboard,
      licenseFeature: "faculty",
    },
    {
      title: "Courses",
      url: "/faculty/courses",
      icon: BookOpen,
      licenseFeature: "faculty",
    },
    {
      title: "Exams",
      url: "/faculty/exams",
      icon: ClipboardCheck,
      licenseFeature: "exams",
      items: [
        {
          title: "Assigned Exams",
          url: "/faculty/exams",
          licenseFeature: "exams",
        },
        {
          title: "Question Bank",
          url: "/faculty/exams/questions",
          licenseFeature: "exams",
        },
        {
          title: "Categories",
          url: "/faculty/exams/categories",
          licenseFeature: "exams",
        },
      ],
    },
    {
      title: "Assignments",
      url: "/faculty/assignments",
      icon: ListChecks,
      licenseFeature: "assignments",
    },
    {
      title: "Batches",
      url: "/faculty/batches",
      icon: Layers,
      licenseFeature: "faculty",
    },
    {
      title: "Calendar",
      url: "/faculty/calendar",
      icon: CalendarDays,
      licenseFeature: "liveClasses",
    },
    {
      title: "Classes",
      url: "/faculty/classes",
      icon: ListVideo,
      licenseFeature: "liveClasses",
    },
    {
      title: "Recordings",
      url: "/faculty/recordings",
      icon: Video,
      licenseFeature: "liveClasses",
    },
    {
      title: "Students",
      url: "/faculty/students",
      icon: Users,
      licenseFeature: "faculty",
    },
    {
      title: "Reminders",
      url: "/faculty/reminders",
      icon: Bell,
      licenseFeature: "liveClasses",
    },
  ],
};
