import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r p-4">
      <h2 className="text-xl font-bold mb-6">LMS</h2>

      <nav className="space-y-3">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dashboard/courses">My Courses</Link>
        <Link href="/dashboard/profile">Profile</Link>
        <Link href="/dashboard/settings">Settings</Link>
      </nav>
    </aside>
  );
}
