"use client";

interface CourseFeatureItemProps {
  title: string;
  value?: string | number | null;
}

const CourseFeatureItem = ({ title, value }: CourseFeatureItemProps) => {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-3 last:border-b-0">
      <span className="shrink-0 text-sm font-semibold text-muted-foreground">
        {title}
      </span>

      <span className="text-right text-sm font-semibold leading-6 text-card-foreground">
        {value || "N/A"}
      </span>
    </div>
  );
};

export default CourseFeatureItem;
