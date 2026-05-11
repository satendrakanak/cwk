import { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

type ExamStatCardProps = {
  label: string;
  value: string | number;
  icon: LucideIcon;
};

export function ExamStatCard({ label, value, icon: Icon }: ExamStatCardProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
        </div>
        <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="size-5" />
        </span>
      </CardContent>
    </Card>
  );
}
