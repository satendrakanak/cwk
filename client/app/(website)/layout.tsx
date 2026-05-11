import { Header } from "@/components/header/header";
import MobileMenu from "@/components/header/mobile-menu";
import Topbar from "@/components/header/top-bar";
import Footer from "@/components/layout/footer";
import { ReactNode } from "react";

export default function WebsiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <Header />
      <MobileMenu />

      <main className="h-full flex-1 pb-14 pt-25 md:pb-0 md:pt-25 lg:pt-25">
        {children}
      </main>

      <Footer />
    </div>
  );
}
