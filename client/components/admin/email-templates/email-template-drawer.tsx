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
import { EmailTemplate } from "@/types/email-template";
import { EmailTemplateForm } from "./email-template-form";

export function EmailTemplateDrawer({
  open,
  onOpenChange,
  template,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: EmailTemplate | null;
}) {
  const isEdit = Boolean(template);

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="w-full border-l border-[var(--brand-100)] bg-white dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] sm:max-w-[880px]">
        <DrawerHeader className="border-b border-slate-100 px-6 py-5 text-left dark:border-white/10">
          <DrawerTitle className="text-2xl font-semibold text-slate-950 dark:text-white">
            {isEdit ? "Edit email template" : "Create email template"}
          </DrawerTitle>
          <DrawerDescription className="text-sm text-slate-500 dark:text-slate-300">
            Manage transactional emails with a richer TipTap editor and reusable variables.
          </DrawerDescription>
        </DrawerHeader>

        <ScrollArea className="h-[calc(100vh-146px)]">
          <div className="px-6 py-5">
            <EmailTemplateForm
              key={template?.id ?? "new-template"}
              template={template}
              onSuccess={() => onOpenChange(false)}
            />
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
