export default function HeroBg() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Soft gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-white" />

      {/* Accent glow top-right */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(ellipse,rgba(234,88,12,.04)_0%,transparent_70%)]" />

      {/* Subtle blue glow bottom */}
      <div className="absolute bottom-[-10%] left-[20%] w-[800px] h-[400px] bg-[radial-gradient(ellipse,rgba(56,189,248,.03)_0%,transparent_60%)]" />

      {/* Dot pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-[.03]">
        <pattern id="dots" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#334155" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>
    </div>
  );
}
