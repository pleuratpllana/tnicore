import { useEffect, useRef } from 'react';

interface HyperdriveProps {
  destination: string;
  ambient: boolean;
  engaged: boolean;
  active: boolean;
  direction: 'outbound' | 'inbound';
  travelProgress: { value: number };
}

interface Star {
  x: number;
  y: number;
  depth: number;
  radius: number;
}

interface Viewport {
  width: number;
  height: number;
  focal: number;
  centerX: number;
  centerY: number;
}

interface FieldLens {
  x: number;
  y: number;
  strength: number;
  twist: number;
  waveRadius: number;
  waveStrength: number;
}

interface WormholeDot {
  ring: number;
  angle: number;
  speed: number;
  size: number;
  opacity: number;
}

interface WormholeDisc {
  progress: number;
  width: number;
  height: number;
  centerY: number;
  area: number;
  opacity: number;
}

const STAR_COUNT_DESKTOP = 960;
const STAR_COUNT_MOBILE = 540;
const WORMHOLE_RING_COUNT = 120;
const WORMHOLE_DOT_COUNT_DESKTOP = 3600;
const WORMHOLE_DOT_COUNT_MOBILE = 1500;

function seededValue(seed: number): number {
  const value = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return value - Math.floor(value);
}

export default function Hyperdrive({ destination, ambient, engaged, active, direction, travelProgress }: HyperdriveProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fieldRef = useRef({ active: false, engaged: false, ambient: true, enabled: true, direction: 'outbound' as 'outbound' | 'inbound' });
  const startFrameRef = useRef<(() => void) | null>(null);
  const stopFrameRef = useRef<(() => void) | null>(null);
  useEffect(() => {
    fieldRef.current.active = active;
    fieldRef.current.engaged = engaged;
    fieldRef.current.ambient = ambient;
    fieldRef.current.enabled = ambient || engaged || active;
    fieldRef.current.direction = active || engaged ? direction : 'outbound';
    if (!active && !engaged) travelProgress.value = 0;
    if (active || engaged) startFrameRef.current?.();
    if (fieldRef.current.enabled) startFrameRef.current?.();
    else stopFrameRef.current?.();
  }, [active, ambient, engaged, direction, travelProgress]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true, desynchronized: true });
    if (!canvas || !context) return;

    let viewport: Viewport = { width: 0, height: 0, focal: 0, centerX: 0, centerY: 0 };
    let stars: Star[] = [];
    let wormholeDiscs: WormholeDisc[] = [];
    let wormholeDots: WormholeDot[] = [];
    let frame = 0;
    let previousTime = 0;
    let running = false;
    let transitionBackground: CanvasGradient | null = null;
    let spatialLight: CanvasGradient | null = null;
    let pointerLight: CanvasGradient | null = null;
    let pointerX = 0;
    let pointerY = 0;
    let pointerTargetX = 0;
    let pointerTargetY = 0;
    let focusX = 0;
    let focusY = 0;
    let cameraX = 0;
    let cameraY = 0;
    let hoverTarget = 0;
    let hoverBlend = 0;
    let energyPulse = 0;
    let waveProgress = 1;
    let wasEngaged = false;
    let wasAccelerating = false;
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let motionAllowed = !motionPreference.matches;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const gateBounds = document.querySelector('.gate-stage')?.getBoundingClientRect();
      viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        focal: Math.min(window.innerWidth, window.innerHeight) * 0.48,
        centerX: gateBounds ? gateBounds.left + gateBounds.width * 0.5 : window.innerWidth * 0.5,
        centerY: gateBounds ? gateBounds.top + gateBounds.height * 0.5 : window.innerHeight * 0.51,
      };
      canvas.width = Math.round(viewport.width * dpr);
      canvas.height = Math.round(viewport.height * dpr);
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      transitionBackground = context.createRadialGradient(
        viewport.centerX,
        viewport.centerY,
        0,
        viewport.centerX,
        viewport.centerY,
        Math.max(viewport.width, viewport.height) * 0.72,
      );
      transitionBackground.addColorStop(0, '#111516');
      transitionBackground.addColorStop(0.28, '#080a0b');
      transitionBackground.addColorStop(1, '#010202');
      const lightX = viewport.centerX - viewport.width * 0.12;
      const lightY = viewport.centerY - viewport.height * 0.1;
      spatialLight = context.createRadialGradient(lightX, lightY, 0, lightX, lightY, Math.max(viewport.width, viewport.height) * 0.68);
      spatialLight.addColorStop(0, 'rgba(156,178,181,.055)');
      spatialLight.addColorStop(0.38, 'rgba(108,133,138,.027)');
      spatialLight.addColorStop(1, 'rgba(70,91,96,0)');
      pointerX = pointerTargetX = focusX = viewport.centerX;
      pointerY = pointerTargetY = focusY = viewport.centerY;
      pointerLight = context.createRadialGradient(pointerX, pointerY, 0, pointerX, pointerY, Math.min(viewport.width, viewport.height) * 0.28);
      pointerLight.addColorStop(0, 'rgba(174,204,208,.15)');
      pointerLight.addColorStop(.36, 'rgba(126,157,163,.055)');
      pointerLight.addColorStop(1, 'rgba(84,112,120,0)');
      const count = window.innerWidth < 600 ? STAR_COUNT_MOBILE : STAR_COUNT_DESKTOP;
      stars = Array.from({ length: count }, (_, index) => ({
        x: seededValue(index + 1) * 2 - 1,
        y: seededValue(index + 941) * 2 - 1,
        depth: 0.08 + seededValue(index + 1867) * 1.42,
        radius: 0.45 + seededValue(index + 2767) * 0.9,
      }));
      wormholeDiscs = Array.from({ length: WORMHOLE_RING_COUNT }, () => ({
        progress: 0,
        width: 0,
        height: 0,
        centerY: 0,
        area: 0,
        opacity: 0,
      }));
      const dotCount = window.innerWidth < 600 ? WORMHOLE_DOT_COUNT_MOBILE : WORMHOLE_DOT_COUNT_DESKTOP;
      wormholeDots = Array.from({ length: dotCount }, (_, index) => ({
        ring: Math.floor(seededValue(index + 631) * WORMHOLE_RING_COUNT),
        angle: seededValue(index + 1297) * Math.PI * 2,
        speed: 0.22 + seededValue(index + 2203) * 0.68,
        size: 0.55 + seededValue(index + 3701) * 0.85,
        opacity: 0.24 + seededValue(index + 4831) * 0.66,
      }));
    };

    const project = (star: Star, lens: FieldLens, depth = star.depth) => {
      const x = viewport.centerX + cameraX + (star.x * viewport.focal) / depth;
      const y = viewport.centerY + cameraY + (star.y * viewport.focal) / depth;
      const dx = x - lens.x;
      const dy = y - lens.y;
      const distance = Math.max(0.01, Math.hypot(dx, dy));
      const directionX = dx / distance;
      const directionY = dy / distance;
      const lensFalloff = 1 / (1 + (distance / 190) ** 2);
      const gravitationalPull = lens.strength * lensFalloff;
      const waveWidth = 18 + distance * .018;
      const waveBand = Math.exp(-Math.abs(distance - lens.waveRadius) / waveWidth) * lens.waveStrength;
      const radialOffset = gravitationalPull + waveBand * 12;
      const tangentialOffset = gravitationalPull * lens.twist;
      return {
        x: x + directionX * radialOffset - directionY * tangentialOffset,
        y: y + directionY * radialOffset + directionX * tangentialOffset,
      };
    };

    const pulseEnergy = () => {
      energyPulse = Math.min(1, energyPulse + .72);
      waveProgress = 0;
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerTargetX = event.clientX;
      pointerTargetY = event.clientY;
      const target = event.target instanceof Element ? event.target : null;
      const chevron = target?.closest<SVGGElement>('.gate-chevron');
      const hit = chevron?.querySelector<SVGCircleElement>('.chevron-hit');
      const interactive = target?.closest<HTMLElement>('a,button,[role="button"]');
      const bounds = hit?.getBoundingClientRect() ?? interactive?.getBoundingClientRect();
      hoverTarget = bounds ? 1 : 0;
      focusX = bounds ? bounds.left + bounds.width / 2 : event.clientX;
      focusY = bounds ? bounds.top + bounds.height / 2 : event.clientY;
      if (viewport.width && viewport.height) {
        pointerLight = context.createRadialGradient(focusX, focusY, 0, focusX, focusY, Math.min(viewport.width, viewport.height) * .28);
        pointerLight.addColorStop(0, 'rgba(174,204,208,.15)');
        pointerLight.addColorStop(.36, 'rgba(126,157,163,.055)');
        pointerLight.addColorStop(1, 'rgba(84,112,120,0)');
      }
    };
    const onPointerOut = (event: PointerEvent) => {
      if (!event.relatedTarget) hoverTarget = 0;
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('a,button,[role="button"],.gate-chevron')) pulseEnergy();
    };
    const onWheel = () => pulseEnergy();

    const draw = (time: number) => {
      const elapsed = Math.min((time - (previousTime || time)) / 1000, 0.032);
      previousTime = time;
      const { width, height } = viewport;
      const progress = travelProgress.value;
      const accelerating = fieldRef.current.active;
      const engaging = fieldRef.current.engaged;
      const ambient = fieldRef.current.ambient && !accelerating && !engaging;
      const outbound = fieldRef.current.direction === 'outbound';
      const wormholeActive = accelerating && motionAllowed;
      if ((engaging && !wasEngaged) || (accelerating && !wasAccelerating)) pulseEnergy();
      wasEngaged = engaging;
      wasAccelerating = accelerating;
      hoverBlend += (hoverTarget - hoverBlend) * Math.min(1, elapsed * 5.2);
      energyPulse *= Math.exp(-elapsed * 2.1);
      if (motionAllowed) waveProgress = Math.min(1, waveProgress + elapsed * .48);
      const ambientDriftX = motionAllowed ? Math.sin(time * .00016) * 2.4 : 0;
      const ambientDriftY = motionAllowed ? Math.cos(time * .00013) * 1.8 : 0;
      const cameraTargetX = motionAllowed ? Math.max(-14, Math.min(14, (pointerTargetX - width * .5) * .012)) + ambientDriftX : 0;
      const cameraTargetY = motionAllowed ? Math.max(-10, Math.min(10, (pointerTargetY - height * .5) * .01)) + ambientDriftY : 0;
      cameraX += (cameraTargetX - cameraX) * Math.min(1, elapsed * 2.5);
      cameraY += (cameraTargetY - cameraY) * Math.min(1, elapsed * 2.5);
      const speed = !motionAllowed ? 0 : accelerating ? 0.62 + progress * 1.05 : engaging ? 0.62 + progress * 0.16 : ambient ? 0.62 : 0;
      const lens: FieldLens = {
        x: accelerating || engaging ? viewport.centerX + cameraX : hoverBlend > .01 ? focusX : viewport.centerX + cameraX,
        y: accelerating || engaging ? viewport.centerY + cameraY : hoverBlend > .01 ? focusY : viewport.centerY + cameraY,
        strength: motionAllowed ? 1.15 + hoverBlend * 8 + (engaging ? 6 : 0) + (accelerating ? 10 + progress * 15 : 0) + energyPulse * 7 : 0,
        twist: motionAllowed ? hoverBlend * .055 + (accelerating ? progress * .11 : 0) : 0,
        waveRadius: waveProgress * Math.max(width, height) * .44,
        waveStrength: motionAllowed ? Math.max(energyPulse * .62, accelerating ? progress * .2 : 0) * (1 - waveProgress * .55) : 0,
      };
      if (accelerating || engaging || ambient) {
        context.fillStyle = transitionBackground ?? '#030405';
        context.fillRect(0, 0, width, height);
        if (spatialLight) {
          context.fillStyle = spatialLight;
          context.fillRect(0, 0, width, height);
        }
      } else context.clearRect(0, 0, width, height);
      if (pointerLight && hoverBlend > .005 && motionAllowed) {
        context.save();
        context.globalAlpha = hoverBlend * .34 + energyPulse * .08;
        context.fillStyle = pointerLight;
        context.fillRect(0, 0, width, height);
        context.restore();
      }

      if (wormholeActive) {
        const baseY = viewport.centerY - height * 0.5;
        const flow = time * 0.000025 + progress * 0.22;
        const travelDirection = outbound ? 1 : -1;
        context.save();
        context.globalCompositeOperation = 'screen';
        // The reference builds the tunnel from elliptical discs that shrink at
        // different easing rates and drift along the viewport's depth axis.
        for (let ring = 0; ring < WORMHOLE_RING_COUNT; ring += 1) {
          const disc = wormholeDiscs[ring];
          if (!disc) continue;
          const p = (ring / WORMHOLE_RING_COUNT + flow * travelDirection + 1) % 1;
          const scaleX = (1 - p) ** 3;
          const scaleY = 2 ** (-10 * p);
          const area = scaleX * scaleY;
          let opacity = area < 0.01
            ? Math.min(area / 0.01, 1) ** 3
            : area > 0.2
              ? 1 - Math.min((area - 0.2) / 0.8, 1)
              : 1;
          opacity *= 0.56 + progress * 0.44;
          disc.progress = p;
          disc.width = width * scaleX;
          disc.height = height * scaleY;
          disc.centerY = baseY + p * height + disc.height;
          disc.area = area;
          disc.opacity = opacity;
          context.beginPath();
          context.ellipse(viewport.centerX + cameraX * 0.18, disc.centerY + cameraY * 0.12, disc.width, disc.height, 0, 0, Math.PI * 2);
          context.globalAlpha = opacity;
          context.strokeStyle = 'rgba(242,245,243,.64)';
          context.lineWidth = 0.8;
          context.stroke();
        }

        // Orbiting points belong to individual discs, as in the reference,
        // and remain grayscale to match the Stargate palette.
        for (const dot of wormholeDots) {
          const disc = wormholeDiscs[dot.ring];
          if (!disc || disc.opacity <= 0.01) continue;
          const angle = dot.angle + time * 0.00028 * dot.speed * travelDirection + progress * travelDirection * 0.65;
          const x = viewport.centerX + cameraX * 0.18 + Math.cos(angle) * disc.width;
          const y = disc.centerY + Math.sin(angle) * disc.height;
          context.globalAlpha = disc.opacity * dot.opacity;
          context.fillStyle = 'rgba(248,250,249,.86)';
          context.beginPath();
          context.arc(x, y, dot.size + disc.area * 0.5, 0, Math.PI * 2);
          context.fill();
        }
        context.restore();
      }

      for (let starIndex = 0; starIndex < stars.length && !wormholeActive; starIndex += 1) {
        const star = stars[starIndex];
        if (!star) continue;
        const oldDepth = star.depth;
        star.depth += speed * elapsed * (outbound ? -1 : 1);
        if ((outbound && star.depth < 0.055) || (!outbound && star.depth > 1.5)) {
          star.depth = outbound
            ? 1.32 + seededValue(time + star.radius * 913) * 0.22
            : 0.08 + seededValue(time + star.radius * 913) * 0.16;
          star.x = seededValue(time * 0.021 + star.radius * 227) * 2 - 1;
          star.y = seededValue(time * 0.017 + star.radius * 619) * 2 - 1;
          continue;
        }

        const point = project(star, lens);
        if (point.x < -20 || point.x > width + 20 || point.y < -20 || point.y > height + 20) continue;
        const depthLight = 1 - Math.min(star.depth / 1.5, 1);
        const accelerationBlend = accelerating || engaging ? Math.max(0, 1 - progress / 0.4) : 0;
        const ambientTrailBlend = Math.max(ambient ? .82 : 0, accelerationBlend);
        const ambientStreak = ambientTrailBlend > 0 && seededValue(starIndex + 4271) > 0.55;
        if (motionAllowed && ambientStreak) {
          const trailDepth = oldDepth + (outbound ? 1 : -1) * (0.12 + depthLight * 0.18);
          const tail = project(star, lens, Math.max(0.055, Math.min(trailDepth, 1.5)));
          context.strokeStyle = `rgba(236,240,237,${(0.22 + depthLight * 0.3) * ambientTrailBlend})`;
          context.lineWidth = Math.max(0.8, Math.min(1.8, star.radius * (0.75 + depthLight * 0.8)));
          if (starIndex % 3 === 0) {
            context.shadowColor = 'rgba(236,240,237,.62)';
            context.shadowBlur = 4.5;
          }
          context.beginPath();
          context.moveTo(tail.x, tail.y);
          context.lineTo(point.x, point.y);
          context.stroke();
          context.shadowBlur = 0;
        } else if (motionAllowed && (accelerating || engaging) && progress > 0.025) {
          const trailDepth = oldDepth + (outbound ? 1 : -1) * (0.12 + progress * (accelerating ? 0.28 : 0.08));
          const tail = project(star, lens, Math.max(0.055, Math.min(trailDepth, 1.5)));
          const alpha = Math.min(0.08 + progress * (accelerating ? 0.78 : 0.2), accelerating ? 0.92 : 0.28) * (0.46 + depthLight * 0.54);
          context.strokeStyle = `rgba(235,239,237,${alpha})`;
          context.lineWidth = star.radius * (0.5 + progress * 0.8);
          context.beginPath();
          context.moveTo(tail.x, tail.y);
          context.lineTo(point.x, point.y);
          context.stroke();
        } else {
          const alpha = 0.13 + depthLight * 0.34;
          context.fillStyle = `rgba(223,228,225,${alpha})`;
          context.beginPath();
          context.arc(point.x, point.y, star.radius * (0.5 + depthLight * 0.8), 0, Math.PI * 2);
          context.fill();
        }
      }
      if (running && fieldRef.current.enabled && !document.hidden && motionAllowed) frame = window.requestAnimationFrame(draw);
      else if (!motionAllowed) { running = false; frame = 0; }
    };

    const start = () => {
      if (running || document.hidden || !fieldRef.current.enabled) return;
      running = true;
      previousTime = 0;
      frame = window.requestAnimationFrame(draw);
    };
    const stop = () => {
      running = false;
      window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const onResize = () => {
      resize();
      if (!motionAllowed && fieldRef.current.enabled && !document.hidden) draw(performance.now());
    };
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else start();
    };
    const onMotionChange = (event: MediaQueryListEvent) => {
      motionAllowed = !event.matches;
      if (motionAllowed) start();
      else {
        window.cancelAnimationFrame(frame);
        running = false;
        frame = 0;
        if (fieldRef.current.enabled && !document.hidden) draw(performance.now());
      }
    };

    resize();
    startFrameRef.current = start;
    stopFrameRef.current = stop;
    start();
    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerDown, { passive: true, capture: true });
    window.addEventListener('pointerout', onPointerOut, { passive: true });
    window.addEventListener('wheel', onWheel, { passive: true, capture: true });
    document.addEventListener('visibilitychange', onVisibilityChange);
    motionPreference.addEventListener('change', onMotionChange);
    return () => {
      stop();
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerDown, true);
      window.removeEventListener('pointerout', onPointerOut);
      window.removeEventListener('wheel', onWheel, true);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      motionPreference.removeEventListener('change', onMotionChange);
      startFrameRef.current = null;
      stopFrameRef.current = null;
    };
  }, []);

  return <div className="hyperdrive" aria-live={active ? 'polite' : 'off'} aria-label={active ? `${direction === 'inbound' ? 'Returning through the Stargate to' : 'Traveling to'} ${destination}` : undefined}>
    <canvas ref={canvasRef} className="hyperdrive-canvas" aria-hidden="true" />
  </div>;
}
