"use client";

import { useState } from "react";

import { FaBars } from "react-icons/fa";

import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { MobileMenuItems } from "@/components/header/mobile-menu-items";
import { Button } from "@/components/ui/button";

const MobileMenuIcon = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="block md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background/90 p-0 shadow-sm backdrop-blur-sm transition hover:bg-muted/80"
          >
            <FaBars className="h-4 w-4 text-foreground/75" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[min(88vw,22rem)] border-r border-border/70 bg-background/95 p-0 backdrop-blur-xl"
        >
          <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
          <MobileMenuItems />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileMenuIcon;
