import { useEffect, useState } from "react";

export function CursorGlow() {
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      setHidden(false);
    };
    const leave = () => setHidden(true);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseleave", leave);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseleave", leave);
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed z-[1] hidden lg:block transition-opacity"
      style={{
        left: pos.x,
        top: pos.y,
        opacity: hidden ? 0 : 1,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div
        style={{
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, oklch(0.62 0.24 25 / 0.22), transparent 60%)",
        }}
      />
    </div>
  );
}
