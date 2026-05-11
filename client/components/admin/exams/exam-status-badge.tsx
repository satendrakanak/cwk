import { Badge } from "@/components/ui/badge";
import { ExamStatus } from "@/types/exam";

const statusLabel: Record<ExamStatus, string> = {
  draft: "Draft",
  published: "Published",
  archived: "Archived",
};

export function ExamStatusBadge({ status }: { status: ExamStatus }) {
  return (
    <Badge variant={status === "published" ? "default" : "secondary"}>
      {statusLabel[status]}
    </Badge>
  );
}
