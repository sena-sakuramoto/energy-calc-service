/* Pure CSS/SVG hero background — no Three.js dependency, always renders */
export default function HeroBg() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* Base gradient — deep navy */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020817] via-[#0a1e3d] to-[#050b18]" />

      {/* Radial glow — center blue */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-[radial-gradient(ellipse,rgba(56,189,248,.07)_0%,transparent_70%)]" />

      {/* Radial glow — bottom cyan */}
      <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-[radial-gradient(ellipse,rgba(6,182,212,.1)_0%,transparent_60%)]" />

      {/* Globe SVG */}
      <svg className="absolute bottom-[-15%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] opacity-60" viewBox="0 0 800 800">
        <defs>
          <radialGradient id="globeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.12" />
            <stop offset="60%" stopColor="#0ea5e9" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="arcGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
            <stop offset="30%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="arcGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0" />
            <stop offset="40%" stopColor="#7dd3fc" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Globe glow */}
        <circle cx="400" cy="400" r="300" fill="url(#globeGlow)" />

        {/* Globe wireframe circles */}
        {[200, 250, 300].map((r) => (
          <circle key={r} cx="400" cy="400" r={r} fill="none" stroke="#38bdf8" strokeWidth="0.5" opacity="0.08" />
        ))}

        {/* Latitude lines */}
        {[-120, -60, 0, 60, 120].map((offset) => (
          <ellipse key={offset} cx="400" cy={400 + offset * 0.4} rx={Math.max(50, 280 - Math.abs(offset))} ry={30} fill="none" stroke="#38bdf8" strokeWidth="0.4" opacity="0.06" />
        ))}

        {/* Longitude arcs */}
        {[0, 45, 90, 135].map((deg) => (
          <ellipse key={deg} cx="400" cy="400" rx={60} ry={280} fill="none" stroke="#38bdf8" strokeWidth="0.4" opacity="0.06"
            transform={`rotate(${deg} 400 400)`} />
        ))}

        {/* Light trail arcs */}
        <path d="M 150 500 Q 300 200 550 180" fill="none" stroke="url(#arcGrad1)" strokeWidth="2.5" strokeLinecap="round">
          <animate attributeName="stroke-dasharray" values="0,1000;400,1000;0,1000" dur="6s" repeatCount="indefinite" />
        </path>
        <path d="M 250 600 Q 450 300 700 350" fill="none" stroke="url(#arcGrad2)" strokeWidth="2" strokeLinecap="round">
          <animate attributeName="stroke-dasharray" values="0,1000;350,1000;0,1000" dur="8s" begin="2s" repeatCount="indefinite" />
        </path>
        <path d="M 100 400 Q 350 150 650 250" fill="none" stroke="url(#arcGrad1)" strokeWidth="1.5" strokeLinecap="round">
          <animate attributeName="stroke-dasharray" values="0,1000;300,1000;0,1000" dur="7s" begin="4s" repeatCount="indefinite" />
        </path>

        {/* Glowing dots on arcs */}
        <circle r="3" fill="#38bdf8" opacity="0.8">
          <animateMotion dur="6s" repeatCount="indefinite" path="M 150 500 Q 300 200 550 180" />
        </circle>
        <circle r="2.5" fill="#06b6d4" opacity="0.7">
          <animateMotion dur="8s" begin="2s" repeatCount="indefinite" path="M 250 600 Q 450 300 700 350" />
        </circle>
        <circle r="2" fill="#7dd3fc" opacity="0.6">
          <animateMotion dur="7s" begin="4s" repeatCount="indefinite" path="M 100 400 Q 350 150 650 250" />
        </circle>

        {/* Outer ring */}
        <circle cx="400" cy="400" r="340" fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.06" strokeDasharray="8,12" >
          <animateTransform attributeName="transform" type="rotate" from="0 400 400" to="360 400 400" dur="60s" repeatCount="indefinite" />
        </circle>
      </svg>

      {/* Star particles via CSS */}
      {Array.from({ length: 60 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            width: Math.random() > 0.7 ? '2px' : '1px',
            height: Math.random() > 0.7 ? '2px' : '1px',
            top: `${Math.random() * 70}%`,
            left: `${Math.random() * 100}%`,
            opacity: 0.1 + Math.random() * 0.3,
            animationDuration: `${2 + Math.random() * 4}s`,
            animationDelay: `${Math.random() * 3}s`,
          }}
        />
      ))}
    </div>
  );
}
