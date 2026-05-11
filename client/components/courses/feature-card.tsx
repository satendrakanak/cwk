interface FeatureCardProps {
  title: string;
  desc: string;
  Icon: React.ElementType;
}

export function FeatureCard({ title, desc, Icon }: FeatureCardProps) {
  return (
    <div className="academy-card group relative overflow-hidden p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_color-mix(in_oklab,var(--primary)_20%,transparent)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary/60 via-primary to-primary/60" />

      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary shadow-sm transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon size={24} />
      </div>

      <h3 className="mb-2 text-lg font-semibold text-card-foreground">
        {title}
      </h3>

      <p className="text-sm leading-6 text-muted-foreground">{desc}</p>
    </div>
  );
}
