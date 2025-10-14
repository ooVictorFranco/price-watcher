// src/components/AnimatedBackground.tsx
'use client';

export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient Base */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-sky-50 to-emerald-50" />

      {/* Animated Gradient Orbs */}
      <div className="absolute top-0 -left-40 w-80 h-80 bg-gradient-to-br from-violet-300/30 to-purple-400/30 rounded-full blur-3xl animate-blob" />
      <div className="absolute top-0 -right-40 w-80 h-80 bg-gradient-to-br from-sky-300/30 to-blue-400/30 rounded-full blur-3xl animate-blob animation-delay-2000" />
      <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-80 h-80 bg-gradient-to-br from-emerald-300/30 to-teal-400/30 rounded-full blur-3xl animate-blob animation-delay-4000" />

      {/* Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Gradient Mesh */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            radial-gradient(at 27% 37%, rgba(139, 92, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 97% 21%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
            radial-gradient(at 52% 99%, rgba(16, 185, 129, 0.1) 0px, transparent 50%),
            radial-gradient(at 10% 29%, rgba(236, 72, 153, 0.1) 0px, transparent 50%),
            radial-gradient(at 97% 96%, rgba(249, 115, 22, 0.1) 0px, transparent 50%),
            radial-gradient(at 33% 50%, rgba(99, 102, 241, 0.1) 0px, transparent 50%),
            radial-gradient(at 79% 53%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)
          `
        }}
      />
    </div>
  );
}
