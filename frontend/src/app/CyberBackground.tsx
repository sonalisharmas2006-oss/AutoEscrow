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
  colorType: number; // 0 = cyan (#00C8FF), 1 = indigo/violet (#8855FF), 2 = bright white
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

interface NetworkPulse {
  p1Index: number;
  p2Index: number;
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
      targetParallaxX = mouseX * 0.18;
      targetParallaxY = mouseY * 0.18;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Handle visibility to save 100% CPU when tab hidden
    const handleVisibility = () => {
      isVisible = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // --- SETUP HOLOGRAPHIC SPHERE ---
    const NUM_SPHERE_NODES = 180;
    let sphereRadius = 280;
    let sphereNodes: SphereNode[] = [];
    let sphereEdges: SphereEdge[] = [];
    let sphereCenterX = 0;
    let sphereCenterY = 0;

    const initSphere = () => {
      const isMobile = width < 768;
      const isTablet = width < 1024;

      if (isMobile) {
        sphereRadius = Math.min(width * 0.38, 160);
        sphereCenterX = width * 0.5;
        sphereCenterY = Math.min(height * 0.34, 300);
      } else if (isTablet) {
        sphereRadius = Math.min(width * 0.28, 230);
        sphereCenterX = width * 0.65;
        sphereCenterY = Math.min(height * 0.38, 380);
      } else {
        sphereRadius = Math.min(Math.max(width * 0.2, 260), 320);
        sphereCenterX = width * 0.70;
        sphereCenterY = Math.min(height * 0.44, 460);
      }

      // Generate nodes using Fibonacci Spiral algorithm
      sphereNodes = [];
      const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

      for (let i = 0; i < NUM_SPHERE_NODES; i++) {
        const y = 1 - (i / (NUM_SPHERE_NODES - 1)) * 2;
        const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
        const theta = phi * i;

        const x = Math.cos(theta) * radiusAtY;
        const z = Math.sin(theta) * radiusAtY;

        const colorRand = Math.random();
        const colorType = colorRand > 0.82 ? 2 : colorRand > 0.45 ? 1 : 0;
        const size = colorType === 2 ? 2.5 : 1.6;

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

      // Precompute edges between close nodes
      sphereEdges = [];
      const maxConnectDistSq = (sphereRadius * 0.33) ** 2;

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

    // --- SETUP EXPANSIVE NETWORK PARTICLES ---
    const NUM_NETWORK = 110;
    let networkParticles: NetworkParticle[] = [];

    const initNetwork = () => {
      networkParticles = [];
      const count = width < 768 ? 55 : NUM_NETWORK;
      for (let i = 0; i < count; i++) {
        networkParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.32,
          vy: (Math.random() - 0.5) * 0.32,
          radius: Math.random() * 1.5 + 1.2,
          color: Math.random() > 0.45 ? "#00C8FF" : "#8855FF",
          alpha: Math.random() * 0.45 + 0.3,
          pulsePhase: Math.random() * Math.PI * 2,
        });
      }
    };

    // --- SETUP FLOATING DUST PARTICLES ---
    const NUM_DUST = 50;
    let dustParticles: DustParticle[] = [];

    const initDust = () => {
      dustParticles = [];
      const count = width < 768 ? 25 : NUM_DUST;
      for (let i = 0; i < count; i++) {
        dustParticles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: -Math.random() * 0.28 - 0.06, // subtle continuous upward drift
          size: Math.random() * 1.3 + 0.5,
          alpha: Math.random() * 0.35 + 0.1,
          alphaSpeed: (Math.random() * 0.01 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        });
      }
    };

    // --- SETUP DATA PULSES ON SPHERE ---
    const spherePulses: DataPulse[] = [];
    const initPulses = () => {
      spherePulses.length = 0;
      for (let i = 0; i < 10; i++) {
        if (sphereEdges.length > 0) {
          spherePulses.push({
            edgeIndex: Math.floor(Math.random() * sphereEdges.length),
            progress: Math.random(),
            speed: Math.random() * 0.016 + 0.009,
            color: Math.random() > 0.5 ? "#00C8FF" : "#8855FF",
          });
        }
      }
    };

    // --- SETUP TRAVELING PULSES ON AMBIENT NETWORK ---
    const networkPulses: NetworkPulse[] = [];
    const initNetworkPulses = () => {
      networkPulses.length = 0;
      for (let i = 0; i < 6; i++) {
        networkPulses.push({
          p1Index: 0,
          p2Index: 1,
          progress: 1,
          speed: 0.02,
          color: "#00C8FF",
        });
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
      initNetworkPulses();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // --- ANIMATION STATE ---
    let rotX = 0.26;
    let rotY = 0;
    let rotZ = 0.08;
    let ringPhotonAngle1 = 0;
    let ringPhotonAngle2 = Math.PI;
    let pulseWaveRadius = 0;
    let pulseWaveMax = 0;

    // --- RENDER LOOP ---
    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth mouse parallax interpolation
      currentParallaxX += (targetParallaxX - currentParallaxX) * 0.05;
      currentParallaxY += (targetParallaxY - currentParallaxY) * 0.05;

      if (!prefersReducedMotion) {
        rotY += 0.0032;
        ringPhotonAngle1 += 0.016;
        ringPhotonAngle2 += 0.012;
      }

      const activeRotX = rotX + currentParallaxY;
      const activeRotY = rotY + currentParallaxX;
      const focalLength = 580;

      // 1. Draw Living Particle Network Across Viewport
      const maxDist = width < 768 ? 90 : 130;
      const maxDistSq = maxDist * maxDist;

      ctx.lineWidth = 0.65;
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

        // Draw fine connecting lines between nearby particles
        for (let j = i + 1; j < networkParticles.length; j++) {
          const p2 = networkParticles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dSq = dx * dx + dy * dy;

          if (dSq < maxDistSq) {
            const dist = Math.sqrt(dSq);
            const lineAlpha = (1 - dist / maxDist) * 0.18;
            ctx.strokeStyle = `rgba(0, 200, 255, ${lineAlpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();

            // Occasional light pulse creation along active connection
            if (!prefersReducedMotion && Math.random() < 0.0004) {
              const freePulse = networkPulses.find((np) => np.progress >= 1);
              if (freePulse) {
                freePulse.p1Index = i;
                freePulse.p2Index = j;
                freePulse.progress = 0;
                freePulse.speed = Math.random() * 0.025 + 0.015;
                freePulse.color = Math.random() > 0.5 ? "#00C8FF" : "#8855FF";
              }
            }
          }
        }

        // Draw glowing particle dot
        const currentAlpha = p.alpha + Math.sin(p.pulsePhase) * 0.14;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.08, Math.min(currentAlpha, 0.7));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Draw light pulses travelling along network connections
      if (!prefersReducedMotion) {
        for (let k = 0; k < networkPulses.length; k++) {
          const np = networkPulses[k];
          if (np.progress < 1) {
            np.progress += np.speed;
            const pA = networkParticles[np.p1Index];
            const pB = networkParticles[np.p2Index];
            if (pA && pB) {
              const px = pA.x + (pB.x - pA.x) * np.progress;
              const py = pA.y + (pB.y - pA.y) * np.progress;

              ctx.fillStyle = np.color;
              ctx.shadowColor = np.color;
              ctx.shadowBlur = 8;
              ctx.beginPath();
              ctx.arc(px, py, 2.2, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }

      // 2. Draw Floating Dust Particles
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

        ctx.fillStyle = "#A0A9BC";
        ctx.globalAlpha = Math.max(0.05, d.alpha);
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 3. Draw Holographic Spherical Network Structure
      const cosX = Math.cos(activeRotX);
      const sinX = Math.sin(activeRotX);
      const cosY = Math.cos(activeRotY);
      const sinY = Math.sin(activeRotY);
      const cosZ = Math.cos(rotZ);
      const sinZ = Math.sin(rotZ);

      const projected: {
        px: number;
        py: number;
        z: number;
        scale: number;
        node: SphereNode;
      }[] = [];

      for (let i = 0; i < sphereNodes.length; i++) {
        const n = sphereNodes[i];

        // 3D Euler rotation
        const x1 = n.origX * cosY + n.origZ * sinY;
        const z1 = -n.origX * sinY + n.origZ * cosY;

        const y2 = n.origY * cosX - z1 * sinX;
        const z2 = n.origY * sinX + z1 * cosX;

        const x3 = x1 * cosZ - y2 * sinZ;
        const y3 = x1 * sinZ + y2 * cosZ;

        // Perspective projection
        const scale = focalLength / (focalLength + z2 + sphereRadius * 0.5);
        const px = sphereCenterX + x3 * scale;
        const py = sphereCenterY + y3 * scale;

        projected.push({ px, py, z: z2, scale, node: n });
      }

      // Holographic internal ambient core
      const coreGrad = ctx.createRadialGradient(
        sphereCenterX,
        sphereCenterY,
        0,
        sphereCenterX,
        sphereCenterY,
        sphereRadius * 0.95
      );
      coreGrad.addColorStop(0, "rgba(0, 200, 255, 0.14)");
      coreGrad.addColorStop(0.45, "rgba(83, 109, 255, 0.08)");
      coreGrad.addColorStop(0.8, "rgba(136, 85, 255, 0.03)");
      coreGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(sphereCenterX, sphereCenterY, sphereRadius * 0.95, 0, Math.PI * 2);
      ctx.fill();

      // Draw Sphere Edges
      // Pass 1: Back edges (z < 0) - faint, subtle depth
      ctx.lineWidth = 0.55;
      for (let i = 0; i < sphereEdges.length; i++) {
        const edge = sphereEdges[i];
        const pA = projected[edge.a];
        const pB = projected[edge.b];
        const avgZ = (pA.z + pB.z) * 0.5;

        if (avgZ < 0) {
          const depthNorm = Math.max(0, (avgZ + sphereRadius) / sphereRadius);
          const alpha = 0.04 + depthNorm * 0.09;
          ctx.strokeStyle = `rgba(83, 109, 255, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.stroke();
        }
      }

      // Pass 2: Front edges (z >= 0) - crisp, electric blue and violet
      for (let i = 0; i < sphereEdges.length; i++) {
        const edge = sphereEdges[i];
        const pA = projected[edge.a];
        const pB = projected[edge.b];
        const avgZ = (pA.z + pB.z) * 0.5;

        if (avgZ >= 0) {
          const depthNorm = Math.min(1, avgZ / sphereRadius);
          const alpha = 0.18 + depthNorm * 0.45;
          ctx.strokeStyle =
            depthNorm > 0.5
              ? `rgba(0, 200, 255, ${alpha})`
              : `rgba(136, 85, 255, ${alpha})`;
          ctx.lineWidth = 0.75 + depthNorm * 0.55;
          ctx.beginPath();
          ctx.moveTo(pA.px, pA.py);
          ctx.lineTo(pB.px, pB.py);
          ctx.stroke();
        }
      }

      // Traveling light pulses on sphere edges
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
            const pulseAlpha = Math.min(
              1,
              Math.max(0.2, (pulseZ + sphereRadius) / (sphereRadius * 2))
            );
            ctx.fillStyle = pulse.color;
            ctx.shadowColor = pulse.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(pulseX, pulseY, 2.4 * pA.scale, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
      }

      // Draw Sphere Nodes
      for (let i = 0; i < projected.length; i++) {
        const item = projected[i];
        const n = item.node;
        const zNorm = (item.z + sphereRadius) / (sphereRadius * 2);

        if (!prefersReducedMotion) {
          n.pulsePhase += 0.03;
        }

        const pulseEffect = Math.sin(n.pulsePhase) * 0.25;

        if (item.z < 0) {
          const alpha = Math.max(0.08, zNorm * 0.35);
          ctx.fillStyle = `rgba(83, 109, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(
            item.px,
            item.py,
            Math.max(0.8, n.size * item.scale * 0.8),
            0,
            Math.PI * 2
          );
          ctx.fill();
        } else {
          const alpha = Math.min(1, 0.45 + zNorm * 0.55 + pulseEffect * 0.15);
          const rad = Math.max(1.3, n.size * item.scale * (1 + pulseEffect * 0.2));

          if (n.colorType === 2) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.shadowColor = "#00C8FF";
            ctx.shadowBlur = 9;
            ctx.beginPath();
            ctx.arc(item.px, item.py, rad * 1.25, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
          } else if (n.colorType === 1) {
            ctx.fillStyle = `rgba(136, 85, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(item.px, item.py, rad, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = `rgba(0, 200, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(item.px, item.py, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 4. Orbital Latitude / Planetary Rings
      const ring1Radius = sphereRadius * 1.2;
      const ring1Tilt = 0.45;

      ctx.save();
      ctx.translate(sphereCenterX, sphereCenterY);
      ctx.rotate(ring1Tilt);
      ctx.scale(1, 0.28);

      ctx.strokeStyle = "rgba(0, 200, 255, 0.22)";
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(0, 0, ring1Radius, 0, Math.PI * 2);
      ctx.stroke();

      const photon1X = Math.cos(ringPhotonAngle1) * ring1Radius;
      const photon1Y = Math.sin(ringPhotonAngle1) * ring1Radius;
      ctx.fillStyle = "#F5F7FF";
      ctx.shadowColor = "#00C8FF";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(photon1X, photon1Y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      const ring2Radius = sphereRadius * 1.34;
      const ring2Tilt = -0.35;

      ctx.save();
      ctx.translate(sphereCenterX, sphereCenterY);
      ctx.rotate(ring2Tilt);
      ctx.scale(1, 0.22);

      ctx.strokeStyle = "rgba(136, 85, 255, 0.16)";
      ctx.setLineDash([4, 8]);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, ring2Radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      const photon2X = Math.cos(ringPhotonAngle2) * ring2Radius;
      const photon2Y = Math.sin(ringPhotonAngle2) * ring2Radius;
      ctx.fillStyle = "#8855FF";
      ctx.shadowColor = "#8855FF";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(photon2X, photon2Y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.restore();

      // 5. Ambient Expanding Pulse Wave
      if (!prefersReducedMotion) {
        if (pulseWaveRadius <= 0 && Math.random() < 0.008) {
          pulseWaveRadius = sphereRadius * 0.4;
          pulseWaveMax = sphereRadius * 1.9;
        }

        if (pulseWaveRadius > 0) {
          pulseWaveRadius += 1.8;
          const waveAlpha = Math.max(0, 0.22 * (1 - pulseWaveRadius / pulseWaveMax));
          if (waveAlpha > 0) {
            ctx.strokeStyle = `rgba(0, 200, 255, ${waveAlpha})`;
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
      {/* Deep midnight black/navy base */}
      <div className="absolute inset-0 bg-[#05060A]" />

      {/* Futuristic cybersecurity fine grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
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
      <div className="absolute -top-[15%] left-[25%] h-[55vw] w-[55vw] max-h-[750px] max-w-[750px] rounded-full bg-[radial-gradient(circle_at_center,rgba(136,85,255,0.12),rgba(83,109,255,0.05)_40%,transparent_75%)] blur-3xl" />

      {/* Hero electric blue aura */}
      <div className="absolute right-[5%] top-[10%] h-[65vw] w-[65vw] max-h-[850px] max-w-[850px] rounded-full bg-[radial-gradient(circle_at_center,rgba(0,200,255,0.14),rgba(83,109,255,0.06)_45%,transparent_75%)] blur-3xl" />

      {/* Lower subtle violet security glow */}
      <div className="absolute -bottom-[20%] -left-[10%] h-[60vw] w-[60vw] max-h-[800px] max-w-[800px] rounded-full bg-[radial-gradient(circle_at_center,rgba(136,85,255,0.08),rgba(0,200,255,0.04)_45%,transparent_75%)] blur-3xl" />

      {/* Full-viewport Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full pointer-events-none"
      />

      {/* Cinematic vignette edge shadows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(5,6,10,0.65)_90%,#05060A_100%)] pointer-events-none" />
    </div>
  );
}
