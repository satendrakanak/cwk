import {
  LayoutDashboard,
  BookOpen,
  FileText,
  FolderTree,
  Users,
  Settings,
  MessageSquare,
  TicketPercent,
  ShoppingBag,
  HandCoins,
  Tags,
  Mail,
  ShieldCheck,
  MessageCircleHeart,
  ClipboardCheck,
  Video,
  BellRing,
  Award,
  Images,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import type { LicenseFeatureKey } from "@/types/license";

export type SidebarItem = {
  title: string;
  url: string;
  requiredPermissions?: string[];
  licenseFeature?: LicenseFeatureKey;
};

export type SidebarNavItem = SidebarItem & {
  icon?: LucideIcon;
  items?: SidebarItem[];
};

export const sidebarData: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  navMain: SidebarNavItem[];
} = {
  user: {
    name: "Satendra",
    email: "satendra@example.com",
    avatar: "/avatars/user.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      requiredPermissions: ["view_dashboard"],
    },

    {
      title: "Courses",
      url: "/admin/courses",
      icon: BookOpen,
      licenseFeature: "courses",
      requiredPermissions: [
        "view_course",
        "create_course",
        "update_course",
        "edit_assigned_course",
      ],
    },

    {
      title: "Exams",
      url: "/admin/exams",
      icon: ClipboardCheck,
      licenseFeature: "exams",
      requiredPermissions: ["view_course", "create_course", "update_course"],
      items: [
        {
          title: "Exams",
          url: "/admin/exams",
          licenseFeature: "exams",
          requiredPermissions: ["view_course", "create_course", "update_course"],
        },
        {
          title: "Questions",
          url: "/admin/exams/questions",
          licenseFeature: "exams",
          requiredPermissions: ["view_course", "create_course", "update_course"],
        },
        {
          title: "Categories",
          url: "/admin/exams/categories",
          licenseFeature: "exams",
          requiredPermissions: ["view_course", "create_course", "update_course"],
        },
      ],
    },

    {
      title: "Assignments",
      url: "/admin/assignments",
      icon: ListChecks,
      licenseFeature: "assignments",
      requiredPermissions: ["view_course", "create_course", "update_course"],
    },

    {
      title: "Coupons",
      url: "/admin/coupons",
      icon: TicketPercent,
      licenseFeature: "coupons",
      requiredPermissions: ["view_coupon", "create_coupon", "update_coupon"],
    },

    {
      title: "Orders",
      url: "/admin/orders",
      icon: ShoppingBag,
      requiredPermissions: ["view_order", "update_order"],
    },

    {
      title: "Refunds",
      url: "/admin/refunds",
      icon: HandCoins,
      licenseFeature: "refunds",
      requiredPermissions: ["view_order", "update_order"],
    },

    {
      title: "Recordings",
      url: "/admin/recordings",
      icon: Video,
      licenseFeature: "liveClasses",
      requiredPermissions: ["view_faculty_workspace"],
    },

    {
      title: "Media",
      url: "/admin/media",
      icon: Images,
      requiredPermissions: ["view_course", "create_course", "update_course"],
    },

    {
      title: "Certificates",
      url: "/admin/certificates",
      icon: Award,
      licenseFeature: "certificates",
      requiredPermissions: ["view_certificate"],
    },

    {
      title: "Engagement",
      url: "/admin/engagement",
      icon: BellRing,
      licenseFeature: "engagement",
      requiredPermissions: [
        "manage_engagement",
        "manage_schedulers",
        "manage_notification_rules",
        "send_broadcast_notification",
      ],
    },

    {
      title: "Articles",
      url: "/admin/articles",
      icon: FileText,
      licenseFeature: "articles",
      requiredPermissions: ["view_article", "create_article", "update_article"],
    },

    {
      title: "Email Templates",
      url: "/admin/email-templates",
      icon: Mail,
      licenseFeature: "emailTemplates",
      requiredPermissions: [
        "view_email_template",
        "create_email_template",
        "update_email_template",
      ],
    },

    {
      title: "Moderation",
      url: "/admin/moderation",
      icon: ShieldCheck,
      requiredPermissions: ["view_comment", "view_review", "view_question"],
    },

    {
      title: "Testimonials",
      url: "/admin/testimonials",
      icon: MessageSquare,
      requiredPermissions: [
        "view_testimonial",
        "create_testimonial",
        "update_testimonial",
      ],
    },

    {
      title: "Categories",
      url: "/admin/categories",
      icon: FolderTree,
      requiredPermissions: ["view_category", "create_category", "update_category"],
    },

    {
      title: "Tags",
      url: "/admin/tags",
      icon: Tags,
      requiredPermissions: ["view_tag", "create_tag", "update_tag"],
    },

    {
      title: "Users",
      url: "/admin/users",
      icon: Users,
      requiredPermissions: ["view_user", "create_user", "update_user"],
    },

    {
      title: "Contact Leads",
      url: "/admin/contact-leads",
      icon: MessageCircleHeart,
      requiredPermissions: ["view_contact_lead"],
    },

    {
      title: "Settings",
      url: "/admin/settings/site",
      icon: Settings,
      requiredPermissions: [
        "view_settings",
        "view_permission",
        "view_role",
        "view_license",
      ],
      items: [
        {
          title: "Site Settings",
          url: "/admin/settings/site",
          licenseFeature: "branding",
          requiredPermissions: ["view_settings"],
        },
        {
          title: "Roles & Permissions",
          url: "/admin/settings/access-control",
          licenseFeature: "advancedSettings",
          requiredPermissions: ["view_permission", "view_role"],
        },
        {
          title: "License",
          url: "/admin/settings/license",
          requiredPermissions: ["view_license", "activate_license"],
        },
      ],
    },
  ],
};
