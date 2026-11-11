"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

export type ParticleFormation =
  | "sphere"
  | "geometry"
  | "pathways"
  | "constellation"
  | "orbital";

interface Particle {
  // Current position
  x: number;
  y: number;
  z: number;
  // Velocity
  vx: number;
  vy: number;
  vz: number;
  // Base formation target
  targetX: number;
  targetY: number;
  targetZ: number;
  // Alternative formation target for dynamic reforming
  altX: number;
  altY: number;
  altZ: number;
  // Properties
  size: number;
  baseAlpha: number;
  colorType: number; // 0 = white, 1 = silver
  clusterId?: number;
  phase: number;
  speed: number;
}

interface InteractiveSectionParticlesProps {
  formation?: ParticleFormation;
  className?: string;
  particleCount?: number;
  densityScale?: number;
  interactive?: boolean;
}

export function InteractiveSectionParticles({
  formation = "sphere",
  className = "",
  particleCount = 90,
  interactive = true,
}: InteractiveSectionParticlesProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let rafId: number = 0;
    let isVisible = false;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Check reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Mouse / Touch interaction coordinates relative to container
    let pointerX = -9999;
    let pointerY = -9999;
    let isPointerActive = false;
    let lastInteractionTime = 0;
    let currentFormationState = 0; // 0 = primary, 1 = alternative morphed layout

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = container.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
      isPointerActive = true;
      lastInteractionTime = performance.now();
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePointer(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handlePointerLeave = () => {
      isPointerActive = false;
      pointerX = -9999;
      pointerY = -9999;
    };

    if (interactive) {
      container.addEventListener("mousemove", handleMouseMove, { passive: true });
      container.addEventListener("mouseleave", handlePointerLeave, { passive: true });
      container.addEventListener("touchmove", handleTouchMove, { passive: true });
      container.addEventListener("touchend", handlePointerLeave, { passive: true });
    }

    // --- PARTICLE GENERATION PER FORMATION ---
    let particles: Particle[] = [];
    const count = Math.min(particleCount, window.innerWidth < 768 ? 45 : particleCount);

    const initParticles = () => {
      particles = [];
      const cx = width / 2;
      const cy = height / 2;

      switch (formation) {
        case "sphere": {
          // Large 3D interconnected spherical particle network
          const sphereRadius = Math.min(width * 0.28, Math.max(height * 0.38, 140));
          const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

          for (let i = 0; i < count; i++) {
            const yNorm = 1 - (i / (count - 1)) * 2;
            const rAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
            const theta = phi * i;

            const x = Math.cos(theta) * rAtY * sphereRadius;
            const y = yNorm * sphereRadius;
            const z = Math.sin(theta) * rAtY * sphereRadius;

            // Alternative morphed target (eccentric tilted ellipsoid)
            const altX = Math.cos(theta * 1.5) * rAtY * (sphereRadius * 1.15);
            const altY = yNorm * (sphereRadius * 0.85);
            const altZ = Math.sin(theta * 1.5) * rAtY * (sphereRadius * 1.15);

            particles.push({
              x: cx + x + (Math.random() - 0.5) * 20,
              y: cy + y + (Math.random() - 0.5) * 20,
              z,
              vx: (Math.random() - 0.5) * 0.2,
              vy: (Math.random() - 0.5) * 0.2,
              vz: (Math.random() - 0.5) * 0.2,
              targetX: cx + x,
              targetY: cy + y,
              targetZ: z,
              altX: cx + altX,
              altY: cy + altY,
              altZ: altZ,
              size: Math.random() > 0.8 ? 2.4 : 1.5,
              baseAlpha: Math.random() * 0.4 + 0.45,
              colorType: Math.random() > 0.5 ? 0 : 1,
              phase: Math.random() * Math.PI * 2,
              speed: 0.003 + Math.random() * 0.002,
            });
          }
          break;
        }

        case "geometry": {
          // Abstract crystalline / diamond lattice network
          const latticeCols = 10;
          const latticeRows = Math.ceil(count / latticeCols);
          const colSpacing = (width * 0.85) / latticeCols;
          const rowSpacing = (height * 0.75) / latticeRows;

          for (let i = 0; i < count; i++) {
            const col = i % latticeCols;
            const row = Math.floor(i / latticeCols);
            const jitterX = ((row % 2) * colSpacing) / 2;

            const tx = width * 0.075 + col * colSpacing + jitterX;
            const ty = height * 0.12 + row * rowSpacing;

            // Alternative target (hexagonal concentric grouping)
            const angle = (i / count) * Math.PI * 6;
            const rad = 40 + (i / count) * Math.min(width * 0.35, height * 0.45);
            const altX = cx + Math.cos(angle) * rad;
            const altY = cy + Math.sin(angle) * rad;

            particles.push({
              x: tx + (Math.random() - 0.5) * 30,
              y: ty + (Math.random() - 0.5) * 30,
              z: (Math.random() - 0.5) * 50,
              vx: 0,
              vy: 0,
              vz: 0,
              targetX: tx,
              targetY: ty,
              targetZ: 0,
              altX,
              altY,
              altZ: 0,
              size: Math.random() > 0.75 ? 2.2 : 1.4,
              baseAlpha: Math.random() * 0.35 + 0.5,
              colorType: i % 2,
              phase: Math.random() * Math.PI * 2,
              speed: 0.002,
            });
          }
          break;
        }

        case "pathways": {
          // Flowing particles along data conduits
          const numTracks = 4;
          for (let i = 0; i < count; i++) {
            const track = i % numTracks;
            const trackY = height * 0.2 + (track / (numTracks - 1)) * (height * 0.6);
            const xPos = Math.random() * width;

            particles.push({
              x: xPos,
              y: trackY + (Math.random() - 0.5) * 25,
              z: 0,
              vx: 0.6 + Math.random() * 0.6,
              vy: (Math.random() - 0.5) * 0.15,
              vz: 0,
              targetX: xPos,
              targetY: trackY,
              targetZ: 0,
              altX: xPos,
              altY: trackY + Math.sin(xPos * 0.01) * 35,
              altZ: 0,
              size: Math.random() > 0.75 ? 2.4 : 1.5,
              baseAlpha: Math.random() * 0.4 + 0.45,
              colorType: track % 2,
              phase: Math.random() * Math.PI * 2,
              speed: 0.005,
            });
          }
          break;
        }

        case "constellation": {
          // 4 interconnected network hub clusters
          const clusters = [
            { x: width * 0.25, y: height * 0.35 },
            { x: width * 0.75, y: height * 0.35 },
            { x: width * 0.3, y: height * 0.7 },
            { x: width * 0.7, y: height * 0.7 },
          ];

          for (let i = 0; i < count; i++) {
            const clusterId = i % 4;
            const center = clusters[clusterId];
            const dist = Math.random() * (Math.min(width, height) * 0.18);
            const angle = Math.random() * Math.PI * 2;

            const tx = center.x + Math.cos(angle) * dist;
            const ty = center.y + Math.sin(angle) * dist;

            // Alt target (ring around center)
            const altAngle = angle + Math.PI / 4;
            const altX = center.x + Math.cos(altAngle) * dist;
            const altY = center.y + Math.sin(altAngle) * dist;

            particles.push({
              x: tx + (Math.random() - 0.5) * 20,
              y: ty + (Math.random() - 0.5) * 20,
              z: 0,
              vx: 0,
              vy: 0,
              vz: 0,
              targetX: tx,
              targetY: ty,
              targetZ: 0,
              altX,
              altY,
              altZ: 0,
              size: Math.random() > 0.8 ? 2.3 : 1.4,
              baseAlpha: Math.random() * 0.35 + 0.5,
              colorType: clusterId % 2,
              clusterId,
              phase: Math.random() * Math.PI * 2,
              speed: 0.004,
            });
          }
          break;
        }

        case "orbital": {
          // Orbital rings with dynamic orbital velocity
          for (let i = 0; i < count; i++) {
            const ringIndex = i % 3;
            const ringRadius =
              Math.min(width, height) * (0.16 + ringIndex * 0.12);
            const angle = (i / count) * Math.PI * 2;

            const tx = cx + Math.cos(angle) * ringRadius;
            const ty = cy + Math.sin(angle) * (ringRadius * 0.45); // Tilted ellipse

            particles.push({
              x: tx,
              y: ty,
              z: Math.sin(angle) * 60,
              vx: 0,
              vy: 0,
              vz: 0,
              targetX: tx,
              targetY: ty,
              targetZ: Math.sin(angle) * 60,
              altX: cx + Math.cos(angle * 1.5) * (ringRadius * 1.1),
              altY: cy + Math.sin(angle * 1.5) * (ringRadius * 0.55),
              altZ: Math.sin(angle * 1.5) * 60,
              size: Math.random() > 0.75 ? 2.5 : 1.5,
              baseAlpha: Math.random() * 0.4 + 0.5,
              colorType: ringIndex % 2,
              phase: angle,
              speed: 0.006 / (ringIndex + 1),
            });
          }
          break;
        }
      }
    };

    // --- RESIZE HANDLING ---
    const handleResize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || 400;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);
      initParticles();
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // --- INTERSECTION OBSERVER (Pauses when scrolled out of view) ---
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isVisible = entry.isIntersecting;
        if (isVisible && !rafId) {
          rafId = requestAnimationFrame(animate);
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // --- ANIMATION & PHYSICS LOOP ---
    let sphereRotationY = 0;
    const repelRadius = 140;
    const repelRadiusSq = repelRadius * repelRadius;
    const maxConnectDist = formation === "pathways" ? 75 : 95;
    const maxConnectDistSq = maxConnectDist * maxConnectDist;

    const animate = () => {
      if (!isVisible) {
        rafId = 0;
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const isDarkMode = resolvedTheme !== "light";
      const particleWhite = isDarkMode ? "#FFFFFF" : "#111111";
      const particleSilver = isDarkMode ? "#CCCCCC" : "#444444";
      const lineBaseColor = isDarkMode ? "255, 255, 255" : "30, 30, 30";

      // Periodically switch target formation if user interacted recently
      const now = performance.now();
      if (!isPointerActive && now - lastInteractionTime > 3500) {
        currentFormationState = Math.sin(now * 0.0004) > 0 ? 1 : 0;
      }

      if (!prefersReducedMotion) {
        sphereRotationY += 0.0035;
      }

      const cx = width / 2;
      const cy = height / 2;

      // 1. Update Physics for All Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Active target position based on current formation state
        let currentTargetX = currentFormationState === 0 ? p.targetX : p.altX;
        let currentTargetY = currentFormationState === 0 ? p.targetY : p.altY;

        // Special handling for sphere rotation
        if (formation === "sphere" && !prefersReducedMotion) {
          const cosR = Math.cos(sphereRotationY);
          const sinR = Math.sin(sphereRotationY);
          const dx = p.targetX - cx;
          const dz = p.targetZ;
          const rotatedX = dx * cosR + dz * sinR;
          currentTargetX = cx + rotatedX;
        }

        // Special handling for orbital rotation
        if (formation === "orbital" && !prefersReducedMotion) {
          p.phase += p.speed;
          const ringRad = Math.sqrt((p.targetX - cx) ** 2 + ((p.targetY - cy) / 0.45) ** 2);
          currentTargetX = cx + Math.cos(p.phase) * ringRad;
          currentTargetY = cy + Math.sin(p.phase) * (ringRad * 0.45);
        }

        // Special handling for continuous data pathway flow
        if (formation === "pathways" && !prefersReducedMotion) {
          p.x += p.vx;
          if (p.x > width + 20) p.x = -20;
          currentTargetX = p.x;
        }

        // Spring attraction toward target
        const springK = 0.04;
        const damping = 0.88;

        const ax = (currentTargetX - p.x) * springK;
        const ay = (currentTargetY - p.y) * springK;

        p.vx = (p.vx + ax) * damping;
        p.vy = (p.vy + ay) * damping;

        // Mouse / Touch Repulsion & Scatter
        if (isPointerActive) {
          const dx = p.x - pointerX;
          const dy = p.y - pointerY;
          const distSq = dx * dx + dy * dy;

          if (distSq < repelRadiusSq && distSq > 0.1) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / repelRadius) * 4.5;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
        }
      }

      // 2. Efficient Grid Spatial Partitioning for Connecting Lines
      const cellSize = maxConnectDist;
      const gridCols = Math.ceil(width / cellSize) + 1;
      const gridRows = Math.ceil(height / cellSize) + 1;
      const grid: number[][] = Array.from({ length: gridCols * gridRows }, () => []);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const col = Math.floor(p.x / cellSize);
        const row = Math.floor(p.y / cellSize);
        if (col >= 0 && col < gridCols && row >= 0 && row < gridRows) {
          grid[row * gridCols + col].push(i);
        }
      }

      // Draw connecting lines only between adjacent grid cells
      ctx.lineWidth = 0.65;
      for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
          const cellIndex = row * gridCols + col;
          const cellParticles = grid[cellIndex];
          if (!cellParticles || cellParticles.length === 0) continue;

          // Check this cell and adjacent cells (right, down, down-left, down-right)
          const neighborOffsets = [
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
            [-1, 1],
          ];

          for (const [ox, oy] of neighborOffsets) {
            const nc = col + ox;
            const nr = row + oy;
            if (nc < 0 || nc >= gridCols || nr < 0 || nr >= gridRows) continue;

            const neighborParticles = grid[nr * gridCols + nc];
            if (!neighborParticles) continue;

            for (let i = 0; i < cellParticles.length; i++) {
              const pAIndex = cellParticles[i];
              const pA = particles[pAIndex];
              const startIndex = ox === 0 && oy === 0 ? i + 1 : 0;

              for (let j = startIndex; j < neighborParticles.length; j++) {
                const pBIndex = neighborParticles[j];
                const pB = particles[pBIndex];

                const dx = pA.x - pB.x;
                const dy = pA.y - pB.y;
                const dSq = dx * dx + dy * dy;

                if (dSq < maxConnectDistSq) {
                  const dist = Math.sqrt(dSq);
                  // Line alpha fades as distance increases and fades if mouse is near
                  let lineAlpha = (1 - dist / maxConnectDist) * 0.16;

                  if (isPointerActive) {
                    const midX = (pA.x + pB.x) / 2;
                    const midY = (pA.y + pB.y) / 2;
                    const distToPointer = Math.hypot(midX - pointerX, midY - pointerY);
                    if (distToPointer < repelRadius * 0.7) {
                      lineAlpha *= distToPointer / (repelRadius * 0.7); // break line near pointer
                    }
                  }

                  if (lineAlpha > 0.01) {
                    ctx.strokeStyle = `rgba(${lineBaseColor}, ${lineAlpha})`;
                    ctx.beginPath();
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.stroke();
                  }
                }
              }
            }
          }
        }
      }

      // 3. Draw All Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.fillStyle = p.colorType === 0 ? particleWhite : particleSilver;
        ctx.globalAlpha = p.baseAlpha;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) {
        rafId = requestAnimationFrame(animate);
      }
    };

    if (isVisible) {
      rafId = requestAnimationFrame(animate);
    }

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", handleResize);
      if (interactive) {
        container.removeEventListener("mousemove", handleMouseMove);
        container.removeEventListener("mouseleave", handlePointerLeave);
        container.removeEventListener("touchmove", handleTouchMove);
        container.removeEventListener("touchend", handlePointerLeave);
      }
    };
  }, [formation, particleCount, interactive, resolvedTheme]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pointer-events-auto absolute inset-0 z-0 overflow-hidden select-none ${className}`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
