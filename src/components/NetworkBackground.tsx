import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulseSpeed: number;
  pulseVal: number;
}

export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 140,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const initParticles = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      particles = [];
      const count = Math.min(85, Math.max(30, Math.floor(window.innerWidth / 18)));

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          radius: Math.random() * 2 + 1,
          pulseSpeed: 0.02 + Math.random() * 0.03,
          pulseVal: Math.random() * Math.PI,
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    const handleResize = () => {
      initParticles();
    };

    initParticles();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        p.pulseVal += p.pulseSpeed;
        const currentRadius = p.radius + Math.sin(p.pulseVal) * 0.4;

        // Draw particle node
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.5, currentRadius), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 217, 255, 0.75)';
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(0, 217, 255, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;

        // Connect with nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 125) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            const opacity = (1 - dist / 125) * 0.18;
            ctx.strokeStyle = `rgba(0, 217, 255, ${opacity})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }

        // Connect with mouse cursor if nearby
        if (mouse.x !== null && mouse.y !== null) {
          const mdx = p.x - mouse.x;
          const mdy = p.y - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist < mouse.radius) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            const mOpacity = (1 - mdist / mouse.radius) * 0.35;
            ctx.strokeStyle = `rgba(120, 110, 255, ${mOpacity})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        id="networkCanvas"
        className="fixed inset-0 w-full h-full pointer-events-none -z-10"
      />
      <div
        className="fixed inset-0 pointer-events-none -z-20 bg-[#050816]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(0, 180, 255, 0.12), transparent 35%),
            radial-gradient(circle at 85% 75%, rgba(120, 50, 255, 0.14), transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(5, 8, 22, 0.95), rgba(5, 8, 22, 1))
          `,
        }}
      />
    </>
  );
}
