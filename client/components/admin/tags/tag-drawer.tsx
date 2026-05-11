"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CreateTagForm } from "./create-tag-form";
import { Tag } from "@/types/tag";

interface TagDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tag?: Tag | null;
}

export function TagDrawer({ open, onOpenChange, tag }: TagDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full border-l border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] sm:max-w-[640px]">
        <DrawerHeader className="border-b border-slate-100 px-6 py-5 text-left dark:border-white/10">
          <DrawerTitle className="text-2xl font-semibold text-slate-950 dark:text-white">
            {tag ? "Edit tag" : "Create tag"}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-slate-500 dark:text-slate-300">
            Manage shared tags used across courses and articles.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-146px)]">
          <div className="px-6 py-5">
            <CreateTagForm tag={tag || undefined} onSuccess={() => onOpenChange(false)} />
          </div>
        </ScrollArea>

        <DrawerFooter className="border-t border-slate-100 bg-white px-6 py-4 dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)]">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
