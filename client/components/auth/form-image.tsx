import Image from "next/image";

interface FormImageProps {
  imageUrl: string;
  alt: string;
  width: number;
  height: number;
}

export default function FormImage({
  imageUrl,
  alt,
  width,
  height,
}: FormImageProps) {
  return (
    <div className="relative hidden min-h-[560px] overflow-hidden bg-muted md:block">
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        priority
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,color-mix(in_oklab,var(--foreground)_38%,transparent),transparent_45%,color-mix(in_oklab,var(--primary)_34%,transparent))]" />

      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.10)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.10)_1px,transparent_1px)] bg-[size:52px_52px] opacity-25 dark:opacity-10" />

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/55 via-slate-950/16 to-transparent p-8">
        <div className="rounded-3xl border border-white/20 bg-slate-950/72 p-5 text-white shadow-[0_24px_70px_rgba(2,6,23,0.45)] backdrop-blur-md">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-emerald-100">
            Secure Learning
          </p>

          <h2 className="mt-2 text-2xl font-semibold leading-tight text-white">
            Start where your progress continues.
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-100">
            Access courses, certificates, exams, and your academy dashboard from
            one protected account.
          </p>
        </div>
      </div>
    </div>
  );
}
