// components/layout/two-column-layout.tsx

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
}

export const TwoColumnLayout = ({ left, right }: Props) => {
  return (
    <div className="grid grid-cols-12 gap-8 relative">
      {/* LEFT CONTENT */}
      <div className="col-span-12 lg:col-span-8">{left}</div>

      {/* RIGHT SIDEBAR */}
      <div
        className="
          col-span-12
          lg:col-span-4
          relative
        "
      >
        {right}
      </div>
    </div>
  );
};
