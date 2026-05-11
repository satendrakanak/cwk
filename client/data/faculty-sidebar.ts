import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  LayoutDashboard,
  Layers,
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
    },
    {
      title: "Courses",
      url: "/faculty/courses",
      icon: BookOpen,
    },
    {
      title: "Exams",
      url: "/faculty/exams",
      icon: ClipboardCheck,
      items: [
        {
          title: "Assigned Exams",
          url: "/faculty/exams",
        },
        {
          title: "Question Bank",
          url: "/faculty/exams/questions",
        },
        {
          title: "Categories",
          url: "/faculty/exams/categories",
        },
      ],
    },
    {
      title: "Batches",
      url: "/faculty/batches",
      icon: Layers,
    },
    {
      title: "Calendar",
      url: "/faculty/calendar",
      icon: CalendarDays,
    },
    {
      title: "Classes",
      url: "/faculty/classes",
      icon: ListVideo,
    },
    {
      title: "Recordings",
      url: "/faculty/recordings",
      icon: Video,
    },
    {
      title: "Students",
      url: "/faculty/students",
      icon: Users,
    },
    {
      title: "Reminders",
      url: "/faculty/reminders",
      icon: Bell,
    },
  ],
};
