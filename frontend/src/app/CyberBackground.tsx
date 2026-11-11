"use client";

import { useEffect, useRef } from "react";

interface SphereNode {
  x: number;
  y: number;
  z: number;
  origX: number;
  origY: number;
  origZ: number;
  size: number;
  colorType: number; // 0 = cyan, 1 = violet, 2 = bright white
  pulsePhase: number;
}

interface SphereEdge {
  a: number;
  b: number;
}

interface NetworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  pulsePhase: number;
}

interface DataPulse {
  edgeIndex: number;
  progress: number;
  speed: number;
  color: string;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  alphaSpeed: number;
}

export default function CyberBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = mediaQuery.matches;

    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    mediaQuery.addEventListener("change", onMotionChange);

    // Mouse tracking for subtle holographic parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let currentParallaxX = 0;
    let currentParallaxY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      targetParallaxX = mouseX * 0.15;
      targetParallaxY = mouseY * 0.15;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle visibility to save 100% CPU when tab hidden
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // --- SETUP SPHERE ---
    const NUM_SPHERE_NODES = 160;
    let sphereRadius = 240;
    let sphereNodes: SphereNode[] = [];
    let sphereEdges: SphereEdge[] = [];
    let sphereCenterX = 0;
    let sphereCenterY = 0;

    const initSphere = () => {
      const isMobile = width < 768;
      const isTablet = width < 1024;

      if (isMobile) {
        sphereRadius = Math.min(width * 0.36, 150);
        sphereCenterX = width * 0.5;
        sphereCenterY = Math.min(height * 0.28, 320);
      } else if (isTablet) {
        sphereRadius = Math.min(width * 0.26, 210);
        sphereCenterX = width * 0.62;
        sphereCenterY = Math.min(height * 0.35, 420);
      } else {
        sphereRadius = Math.min(Math.max(width * 0.18, 220), 280);
        sphereCenterX = width * 0.72;
        sphereCenterY = Math.min(height * 0.38, 480);
      }

      // Generate nodes using Fibonacci Sphere
      sphereNodes = [];
      const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

      for (let i = 0; i < NUM_SPHERE_NODES; i++) {
        const y = 1 - (i / (NUM_SPHERE_NODES - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        const colorRand = Math.random();
        const colorType = colorRand > 0.8 ? 2 : colorRand > 0.4 ? 1 : 0;
        const size = colorType === 2 ? 2.4 : 1.5;

        sphereNodes.push({
          x: x * sphereRadius,
          y: y * sphereRadius,
          z: z * sphereRadius,
          origX: x * sphereRadius,
          origY: y * sphereRadius,
          origZ: z * sphereRadius,
          size,
          colorType,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }

      // Precompute edges: connect close nodes
      sphereEdges = [];
      const maxConnectDistSq = (sphereRadius * 0.34) ** 2;

      for (let i = 0; i < NUM_SPHERE_NODES; i++) {
        let connections = 0;
        for (let j = i + 1; j < NUM_SPHERE_NODES; j++) {
          const dx = sphereNodes[i].origX - sphereNodes[j].origX;
          const dy = sphereNodes[i].origY - sphereNodes[j].origY;
          const dz = sphereNodes[i].origZ - sphereNodes[j].origZ;
          const dSq = dx * dx + dy * dy + dz * dz;

          if (dSq < maxConnectDistSq && connections < 4) {
            sphereEdges.push({ a: i, b: j });
            connections++;
          }
        }
      }
    };

    // --- SETUP NETWORK PARTICLES ---
    const NUM_NETWORK = 75;
    let networkParticles: NetworkParticle[] = [];

    const initNetwork = () => {
      networkParticles = [];
      const count = width < 768 ? 40 : NUM_NETWORK;
      for (let i = 0; i < count; i++) {
        networkParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          radius: Math.random() * 1.5 + 1,
          color: Math.random() > 0.4 ? "#38bdf8" : "#818cf8",
          alpha: Math.random() * 0.4 + 0.25,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    // --- SETUP FLOATING DUST PARTICLES ---
    const NUM_DUST = 45;
    let dustParticles: DustParticle[] = [];

    const initDust = () => {
      dustParticles = [];
      const count = width < 768 ? 20 : NUM_DUST;
      for (let i = 0; i < count; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -Math.random() * 0.3 - 0.05, // gentle upwards drift
          size: Math.random() * 1.2 + 0.4,
          alpha: Math.random() * 0.3 + 0.1,
          alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        });
      }
    };

    // --- SETUP DATA PULSES ON SPHERE ---
    const spherePulses: DataPulse[] = [];
    const initPulses = () => {
      spherePulses.length = 0;
      for (let i = 0; i < 8; i++) {
        if (sphereEdges.length > 0) {
          spherePulses.push({
            edgeIndex: Math.floor(Math.random() * sphereEdges.length),
            progress: Math.random(),
            speed: Math.random() * 0.015 + 0.008,
            color: Math.random() > 0.5 ? "#38bdf8" : "#c084fc",
          });
        }
      }
    };

    // --- RESIZE HANDLER ---
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      initSphere();
      initNetwork();
      initDust();
      initPulses();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // --- ANIMATION STATE ---
    let rotX = 0.28;
    let rotY = 0;
    let rotZ = 0.08;
    let ringPhotonAngle1 = 0;
    let ringPhotonAngle2 = Math.PI;
    let pulseWaveRadius = 0;
    let pulseWaveMax = 0;
    let time = 0;

    // --- RENDER LOOP ---
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.016;

      // Clear with dark subtle fade
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse parallax
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

      if (!prefersReducedMotion) {
        rotY += 0.0035;
        ringPhotonAngle1 += 0.018;
        ringPhotonAngle2 += 0.014;
      }

      const activeRotX = rotX + currentParallaxY;
      const activeRotY = rotY + currentParallaxX;
      const focalLength = 550;

      // 1. Draw subtle ambient network in background
      const maxDist = width < 768 ? 85 : 120;
      const maxDistSq = maxDist * maxDist;

      // Update and draw network particles
      ctx.lineWidth = 0.6;
      for (let i = 0; i < networkParticles.length; i++) {
        const p = networkParticles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulsePhase += 0.02;

          if (p.x < 0) p.x = width;
          else if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          else if (p.y > height) p.y = 0;
        }

        // Draw connections
        for (let j = i + 1; j < networkParticles.length; j++) {
          const p2 = networkParticles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dSq = dx * dx + dy * dy;

          if (dSq < maxDistSq) {
            const dist = Math.sqrt(dSq);
            const lineAlpha = (1 - dist / maxDist) * 0.16;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }

        // Draw particle dot
        const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.12;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.05, Math.min(currentAlpha, 0.6));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 2. Draw floating dust particles
      for (let i = 0; i < dustParticles.length; i++) {
        const d = dustParticles[i];
        if (!prefersReducedMotion) {
          d.x += d.vx;
          d.y += d.vy;
          d.alpha += d.alphaSpeed;
          if (d.alpha > 0.4 || d.alpha < 0.08) d.alphaSpeed = -d.alphaSpeed;

          if (d.y < -10) {
            d.y = height + 10;
            d.x = Math.random() * width;
          }
        }

        ctx.fillStyle = "#93c5fd";
        ctx.globalAlpha = Math.max(0.05, d.alpha);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 3. Draw Holographic Sphere
      const cosX = Math.cos(activeRotX);
      const sinX = Math.sin(activeRotX);
      const cosY = Math.cos(activeRotY);
      const sinY = Math.sin(activeRotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      // Rotate and project all sphere nodes
      const projected: {
        px: number;
        py: number;
        z: number;
        scale: number;
        node: SphereNode;
      }[] = [];

      for (let i = 0; i < sphereNodes.length; i++) {
        const n = sphereNodes[i];

        // 3D Rotation Matrix
        // Y rotation
        const x1 = n.origX * cosY + n.origZ * sinY;
        const z1 = -n.origX * sinY + n.origZ * cosY;

        // X rotation
        const y2 = n.origY * cosX - z1 * sinX;
        const z2 = n.origY * sinX + z1 * cosX;

        // Z rotation
        const x3 = x1 * cosZ - y2 * sinZ;
        const y3 = x1 * sinZ + y2 * cosZ;

        // Perspective projection
        const scale = focalLength / (focalLength + z2 + sphereRadius * 0.5);
        const px = sphereCenterX + x3 * scale;
        const py = sphereCenterY + y3 * scale;

        projected.push({
          px,
          py,
          z: z2,
          scale,
          node: n,
        });
      }

      // Internal Holographic Core Glow
      const coreGrad = ctx.createRadialGradient(
        sphereCenterX,
        sphereCenterY,
        0,
        sphereCenterX,
        sphereCenterY,
        sphereRadius * 0.95
      );
      coreGrad.addColorStop(0, "rgba(56, 189, 248, 0.12)");
      coreGrad.addColorStop(0.4, "rgba(99, 102, 241, 0.06)");
      coreGrad.addColorStop(0.8, "rgba(139, 92, 246, 0.02)");
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, sphereRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Draw Sphere Edges (depth separated: back faint, front crisp)
      // Pass 1: Back edges (z < 0)
      ctx.lineWidth = 0.55;
      for (let i = 0; i < sphereEdges.length; i++) {
        const edge = sphereEdges[i];
        const pA = projected[edge.a];
        const pB = projected[edge.b];
        const avgZ = (pA.z + pB.z) * 0.5;

        if (avgZ < 0) {
          const depthNorm = Math.max(0, (avgZ + sphereRadius) / sphereRadius);
          const alpha = 0.04 + depthNorm * 0.1;
          ctx.strokeStyle = `rgba(30, 58, 138, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.stroke();
        }
      }

      // Pass 2: Front edges (z >= 0)
      for (let i = 0; i < sphereEdges.length; i++) {
        const edge = sphereEdges[i];
        const pA = projected[edge.a];
        const pB = projected[edge.b];
        const avgZ = (pA.z + pB.z) * 0.5;

        if (avgZ >= 0) {
          const depthNorm = Math.min(1, avgZ / sphereRadius);
          const alpha = 0.15 + depthNorm * 0.45;
          // Gradient between cyan and violet based on depth
          ctx.strokeStyle = depthNorm > 0.5 ? `rgba(56, 189, 248, ${alpha})` : `rgba(129, 140, 248, ${alpha})`;
          ctx.lineWidth = 0.7 + depthNorm * 0.5;
          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.stroke();
        }
      }

      // Draw traveling pulses along sphere edges
      if (!prefersReducedMotion) {
        for (let i = 0; i < spherePulses.length; i++) {
          const pulse = spherePulses[i];
          pulse.progress += pulse.speed;
          if (pulse.progress >= 1) {
            pulse.progress = 0;
            pulse.edgeIndex = Math.floor(Math.random() * sphereEdges.length);
          }

          const edge = sphereEdges[pulse.edgeIndex];
          if (!edge) continue;
          const pA = projected[edge.a];
          const pB = projected[edge.b];

          const pulseX = pA.px + (pB.px - pA.px) * pulse.progress;
          const pulseY = pA.py + (pB.py - pA.py) * pulse.progress;
          const pulseZ = pA.z + (pB.z - pA.z) * pulse.progress;

          if (pulseZ > -sphereRadius * 0.2) {
            const pulseAlpha = Math.min(1, Math.max(0.2, (pulseZ + sphereRadius) / (sphereRadius * 2)));
            ctx.fillStyle = pulse.color;
            ctx.shadowColor = pulse.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2.2 * pA.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Sphere Nodes (sorted or depth-proportional)
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const n = item.node;
        const zNorm = (item.z + sphereRadius) / (sphereRadius * 2); // 0 to 1

        if (!prefersReducedMotion) {
          n.pulsePhase += 0.03;
        }

        const pulseEffect = Math.sin(n.pulsePhase) * 0.3;

        if (item.z < 0) {
          // Back hemisphere
          const alpha = Math.max(0.08, zNorm * 0.35);
          ctx.fillStyle = `rgba(79, 70, 229, ${alpha})`;
          ctx.beginPath();
          ctx.arc(item.px, item.py, Math.max(0.8, n.size * item.scale * 0.8), 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Front hemisphere - brightly glowing
          const alpha = Math.min(1, 0.4 + zNorm * 0.55 + pulseEffect * 0.15);
          const rad = Math.max(1.2, n.size * item.scale * (1 + pulseEffect * 0.2));

          if (n.colorType === 2) {
            // High energy node
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = "#38bdf8";
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(item.px, item.py, rad * 1.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (n.colorType === 1) {
            ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
            ctx.beginPath();
            ctx.arc(item.px, item.py, rad, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
            ctx.beginPath();
            ctx.arc(item.px, item.py, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Orbital Rings around sphere
      // Ring 1: Primary tilted equatorial ring
      const ring1Radius = sphereRadius * 1.18;
      const ring1Tilt = 0.42;

      ctx.save();
      ctx.translate(sphereCenterX, sphereCenterY);
      ctx.rotate(ring1Tilt);
      ctx.scale(1, 0.28);

      // Ring stroke
      ctx.strokeStyle = "rgba(56, 189, 248, 0.22)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, ring1Radius, 0, Math.PI * 2);
      ctx.stroke();

      // Photon 1 on ring
      const photon1X = Math.cos(ringPhotonAngle1) * ring1Radius;
      const photon1Y = Math.sin(ringPhotonAngle1) * ring1Radius;
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "#38bdf8";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(photon1X, photon1Y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // Ring 2: Secondary counter-tilted latitude ring
      const ring2Radius = sphereRadius * 1.32;
      const ring2Tilt = -0.32;

      ctx.save();
      ctx.translate(sphereCenterX, sphereCenterY);
      ctx.rotate(ring2Tilt);
      ctx.scale(1, 0.22);

      ctx.strokeStyle = "rgba(139, 92, 246, 0.16)";
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, ring2Radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Photon 2 on ring
      const photon2X = Math.cos(ringPhotonAngle2) * ring2Radius;
      const photon2Y = Math.sin(ringPhotonAngle2) * ring2Radius;
      ctx.fillStyle = "#c084fc";
      ctx.shadowColor = "#c084fc";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(photon2X, photon2Y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // 5. Ambient Expanding Pulse Wave (occasional subtle pulse)
      if (!prefersReducedMotion) {
        if (pulseWaveRadius <= 0 && Math.random() < 0.008) {
          pulseWaveRadius = sphereRadius * 0.4;
          pulseWaveMax = sphereRadius * 1.8;
        }

        if (pulseWaveRadius > 0) {
          pulseWaveRadius += 1.8;
          const waveAlpha = Math.max(0, 0.22 * (1 - pulseWaveRadius / pulseWaveMax));
          if (waveAlpha > 0) {
            ctx.strokeStyle = `rgba(56, 189, 248, ${waveAlpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(sphereCenterX, sphereCenterY, pulseWaveRadius, 0, Math.PI * 2);
            ctx.stroke();
          } else {
            pulseWaveRadius = 0;
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      mediaQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* Base deep midnight black/navy background */}
      <div className="absolute inset-0 bg-[#05060D]" />

      {/* Subtle futuristic cyber grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 40%, transparent 85%)",
        }}
      />

      {/* Layered cinematic atmospheric glows */}
      {/* Top violet/indigo ambient aura */}
      <div className="absolute -top-[15%] left-[20%] h-[55vw] w-[55vw] max-h-[750px] max-w-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(129,140,248,0.12),rgba(99,102,241,0.05)_40%,transparent_75%)] blur-3xl" />

      {/* Hero electric blue aura */}
      <div className="absolute right-[5%] top-[12%] h-[60vw] w-[60vw] max-h-[850px] max-w-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.14),rgba(56,189,248,0.06)_45%,transparent_75%)] blur-3xl" />

      {/* Lower subtle violet security glow */}
      <div className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] max-h-[800px] max-w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.08),rgba(14,165,233,0.04)_45%,transparent_75%)] blur-3xl" />

      {/* Main interactive Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* Vignette edge shadows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,6,13,0.7)_90%,#05060D_100%)] pointer-events-none" />
    </div>
  );
}
