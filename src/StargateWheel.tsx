import { forwardRef, useEffect, useImperativeHandle, useRef, type KeyboardEvent } from 'react';
import gsap from 'gsap';
import { portalNodes, type Destination, type DestinationId } from './destinations';
import brandLogo from '../references/Images/logo.png';

export interface StargateWheelHandle {
  dial: (destination: Destination | null, direction?: 'outbound' | 'inbound') => gsap.core.Timeline;
}

interface StargateWheelProps {
  selectedId: DestinationId | null;
  dialing: boolean;
  onSelect: (destination: Destination) => void;
}

const CENTER = 450;
const RING_ORIENTATION = 18;
const CHEVRON_LABEL_GAP = 23;
const GLYPH_RADIUS = 310;
const GLYPH_PATHS = [
  'M0 -12 V12 M0 -7 L-7 -1 M0 -7 L7 -1 M0 2 L-6 8 M0 2 L6 8',
  'M0 -12 V12 M0 -8 H-8 M0 -2 H7 M0 5 H-6 M0 -8 L6 -12',
  'M0 -12 V12 M0 -9 L7 -3 M0 -3 L-7 3 M0 3 L7 9 M-7 -12 H7',
  'M-8 -10 L0 -4 L8 -10 M0 -4 V12 M-7 6 H7',
  'M0 -12 V12 M0 -8 L-7 -3 M0 -3 L7 2 M0 2 L-7 7 M0 7 L6 11',
  'M-8 -9 H8 M0 -9 V12 M-7 -2 L0 3 L7 -2 M-6 9 H6',
  'M0 -12 L-7 -5 L0 1 L7 -5 M0 1 V12 M-7 7 H7',
  'M-8 -10 L0 -4 L8 -10 M0 -4 L-7 3 L0 9 L7 3 M0 9 V12',
  'M0 -12 V12 M0 -8 H7 M0 -2 H-7 M0 4 H7 M0 10 H-5',
  'M-8 -10 L0 -3 L8 -10 M-8 1 L0 8 L8 1 M0 -3 V12',
  'M0 -12 V12 M0 -7 L-7 -1 M0 -1 L7 5 M0 5 L-6 11 M-7 -9 H7',
  'M-8 -11 L0 -5 L8 -11 M-8 0 L0 6 L8 0 M0 -5 V12 M-6 11 H6',
  'M0 -12 V12 M0 -8 L7 -2 M0 -2 L-7 4 M0 4 L7 10 M-7 -12 L7 -6',
  'M-8 -10 H8 M-8 -10 L0 -3 L8 -10 M0 -3 V12 M-7 7 H7',
  'M0 -12 V12 M0 -9 H-7 M0 -4 H7 M0 1 H-7 M0 6 H7 M0 11 H-5',
  'M0 -12 L-8 -5 L0 2 L8 -5 M0 2 V12 M-7 8 L0 2 L7 8',
  'M-8 -10 L0 -4 L8 -10 M-8 -1 L0 5 L8 -1 M0 -4 V12 M-6 10 H6',
  'M0 -12 V12 M0 -7 L-7 -2 M0 -2 L7 3 M0 3 L-7 8 M0 8 L6 12 M-7 -11 H7',
  'M-8 -11 H8 M-8 -11 L0 -4 L8 -11 M-7 2 H7 M0 -4 V12',
  'M0 -12 V12 M0 -8 L-7 -2 L0 3 L7 -2 M0 3 L-7 9 M0 3 L7 9',
  'M-8 -10 L0 -4 L8 -10 M-7 0 L0 6 L7 0 M-6 10 H6 M0 -4 V12',
  'M0 -12 V12 M0 -9 H7 M0 -4 H-7 M0 1 H7 M0 6 H-7 M0 11 H6',
  'M-8 -9 L0 -3 L8 -9 M-8 3 L0 9 L8 3 M0 -3 V12 M-6 -12 H6',
  'M0 -12 L-7 -6 L0 0 L7 -6 M0 0 V12 M-7 6 L0 0 L7 6 M-5 11 H5',
  'M-8 -11 H8 M-8 -11 L0 -4 L8 -11 M0 -4 L-7 3 L0 10 L7 3 M0 10 V12',
  'M0 -12 V12 M0 -8 L7 -2 M0 -2 L-7 4 M0 4 L7 10 M-7 -12 H7 M-6 12 H6',
  'M-8 -10 L0 -4 L8 -10 M0 -4 V12 M-7 0 H7 M-6 8 H6',
  'M0 -12 V12 M0 -8 L-7 -3 M0 -3 L7 2 M0 2 L-7 7 M0 7 L7 12 M-6 -12 H6',
  'M-8 -10 L0 -3 L8 -10 M-8 0 L0 7 L8 0 M-6 11 H6 M0 -3 V12',
  'M0 -12 V12 M0 -9 H-7 M0 -4 H7 M0 1 H-7 M0 6 H7 M0 11 H-7 M-6 -12 H6',
  'M-8 -11 L0 -5 L8 -11 M-7 -1 L0 5 L7 -1 M-6 10 H6 M0 -5 V12',
  'M0 -12 L-7 -5 L0 1 L7 -5 M-7 4 L0 10 L7 4 M0 1 V12',
  'M-8 -10 H8 M0 -10 V12 M0 -5 L-7 1 M0 1 L7 7 M-6 10 H6',
  'M0 -12 V12 M0 -8 L7 -2 L0 4 L-7 -2 M0 4 L7 10 M-6 11 H6',
  'M-8 -11 L0 -5 L8 -11 M0 -5 V12 M-7 1 H7 M-6 8 H6',
  'M0 -12 V12 M0 -8 H7 M0 -2 H-7 M0 4 H7 M0 10 H-7 M-6 -12 L6 -6',
  'M-8 -10 L0 -4 L8 -10 M-8 1 L0 7 L8 1 M0 -4 L-6 11 M0 7 L6 12',
  'M0 -12 L-7 -5 L0 2 L7 -5 M-7 2 L0 9 L7 2 M0 9 V12',
  'M-8 -11 H8 M-7 -3 L0 3 L7 -3 M0 3 V12 M-6 9 H6',
] as const;
const GLYPH_COUNT = GLYPH_PATHS.length;

function ringSegmentPath(index: number, count: number, innerRadius: number, outerRadius: number): string {
  const step = (Math.PI * 2) / count;
  const start = index * step + step * 0.045;
  const end = (index + 1) * step - step * 0.045;
  const point = (radius: number, angle: number) => [CENTER + Math.cos(angle) * radius, CENTER + Math.sin(angle) * radius] as const;
  const [outerStartX, outerStartY] = point(outerRadius, start);
  const [outerEndX, outerEndY] = point(outerRadius, end);
  const [innerEndX, innerEndY] = point(innerRadius, end);
  const [innerStartX, innerStartY] = point(innerRadius, start);
  return `M${outerStartX} ${outerStartY} A${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY} L${innerEndX} ${innerEndY} A${innerRadius} ${innerRadius} 0 0 0 ${innerStartX} ${innerStartY} Z`;
}

function shortestRotation(current: number, target: number, preferredDirection: -1 | 1 = 1): number {
  const normalized = ((target - (current % 360) + 540) % 360) - 180;
  const delta = Math.abs(normalized + 180) < 0.001 ? preferredDirection * 180 : normalized;
  return current + delta;
}

function lockCountForDestination(id: DestinationId | null): number {
  if (!id) return 0;
  const index = portalNodes.findIndex((item) => item.id === id);
  return Math.max(0, index + 1);
}

export function StargateGlyphIcon({ symbolIndex, className }: { symbolIndex: number; className?: string }) {
  const index = ((Math.floor(symbolIndex) % GLYPH_COUNT) + GLYPH_COUNT) % GLYPH_COUNT;
  return <svg className={className} viewBox="-14 -14 28 28" aria-hidden="true" focusable="false">
    <path d={GLYPH_PATHS[index]} />
  </svg>;
}

function rotationForDestination(id: DestinationId | null): number {
  const destination = id ? portalNodes.find((item) => item.id === id) : undefined;
  return destination ? -destination.angle : RING_ORIENTATION;
}

function GateGlyphs() {
  return <g className="gate-glyph-band">
    {GLYPH_PATHS.map((path, index) => {
      const angle = (360 / GLYPH_COUNT) * index;
      return <g key={index} className="gate-glyph" data-glyph-index={index} transform={`rotate(${angle} ${CENTER} ${CENTER}) translate(${CENTER} ${CENTER - GLYPH_RADIUS})`}>
        <path d={path} />
      </g>;
    })}
  </g>;
}

function GateChevron({ item, selected, locked, index, initialRotation, onSelect, onFocusIndex, onFocusItem, chevronRef, captionRef, tabIndex }: {
  item: Destination;
  selected: boolean;
  locked: boolean;
  index: number;
  initialRotation: number;
  onSelect: () => void;
  onFocusIndex: (index: number) => void;
  onFocusItem: (index: number) => void;
  chevronRef: (node: SVGGElement | null) => void;
  captionRef: (node: SVGGElement | null) => void;
  tabIndex: number;
}) {
  const onKeyDown = (event: KeyboardEvent<SVGCircleElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (event.repeat) return;
      onSelect();
      return;
    }
    const nextIndex = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? (index + 1) % portalNodes.length
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? (index - 1 + portalNodes.length) % portalNodes.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? portalNodes.length - 1 : null;
    if (nextIndex !== null) {
      event.preventDefault();
      onFocusIndex(nextIndex);
    }
  };
  const labelWidth = Math.max(76, item.label.length * 9.4);
  return <g
    ref={chevronRef}
    className={`gate-chevron ${selected ? 'is-selected' : ''} ${locked ? 'is-locked' : ''}`}
    data-chevron={index}
    transform={`translate(${CENTER} ${CENTER}) rotate(${item.angle})`}
    onClick={onSelect}
  >
    <title>{`Dial ${item.label}`}</title>
    <g className="chevron-mechanism">
      <g transform="rotate(180 0 -372)">
      <path className="chevron-foot" d="M-38 -337 L-30 -365 L-14 -394 L0 -412 L14 -394 L30 -365 L38 -337 L27 -326 L-27 -326 Z" />
      <path className="chevron-mount" d="M-25 -397 L-17 -402 L17 -402 L25 -397 L21 -386 L-21 -386 Z" fill={locked ? '#737877' : '#25292a'} stroke={locked ? '#c5cac7' : '#626867'} strokeWidth="1.1" strokeLinejoin="bevel" />
      <path d="M-17 -399 H17 M-20 -391 H20" fill="none" stroke={locked ? '#d6dad7' : '#858b89'} strokeWidth=".8" opacity={locked ? '.78' : '.48'} />
      <path d="M-27 -385 H-18 V-378 H-30 Z M27 -385 H18 V-378 H30 Z" fill={locked ? '#555a59' : '#1c2021'} stroke="#858b89" strokeWidth=".85" strokeLinejoin="bevel" />
      <path className="chevron-shell" d="M-31 -339 L-24 -365 L-11 -388 L0 -404 L11 -388 L24 -365 L31 -339 L21 -331 L-21 -331 Z" />
      <g className="chevron-fasteners" aria-hidden="true" fill={locked ? '#8b908e' : '#373c3c'} stroke={locked ? '#e0e3e0' : '#b8bcba'} strokeWidth=".7">
        <circle cx="-31.5" cy="-350" r="1.7" /><circle cx="31.5" cy="-350" r="1.7" />
        <path d="M-32.3 -350h1.6 M30.7 -350h1.6" fill="none" stroke="#d3d6d3" strokeWidth=".55" />
      </g>
      <path className="chevron-bevel" d="M-23 -342 L-17 -364 L-7 -383 L0 -394 L7 -383 L17 -364 L23 -342 L14 -338 L-14 -338 Z" />
      <path className="chevron-lens" d="M0 -393 L13 -374 L0 -354 L-13 -374 Z" />
      <path className="chevron-glint" d="M0 -390 L6 -374 L0 -361 L-6 -374 Z" />
      <path className="chevron-rail" d="M-29 -360 L-21 -379 M29 -360 L21 -379" />
      </g>
    </g>
    <g ref={captionRef} className="chevron-caption" transform={`rotate(${-item.angle - initialRotation} 0 ${-427 - CHEVRON_LABEL_GAP})`}>
      <text className="chevron-number" x="0" y={-446 - CHEVRON_LABEL_GAP} textAnchor="middle">{String(index + 1).padStart(2, '0')}</text>
      <text x="0" y={-425 - CHEVRON_LABEL_GAP} textAnchor="middle" style={{ letterSpacing: item.label.length > 10 ? '1px' : '1.7px' }}>{item.label.toUpperCase()}</text>
      <path d={`M${-labelWidth / 2} ${-416 - CHEVRON_LABEL_GAP} H${labelWidth / 2}`} />
    </g>
    <circle className="chevron-hit" cx="0" cy="-372" r="68" role="button" tabIndex={tabIndex} aria-label={`Dial ${item.label}`} aria-current={selected ? 'true' : undefined} onKeyDown={onKeyDown} onFocus={() => onFocusItem(index)} />
  </g>;
}

const StargateWheel = forwardRef<StargateWheelHandle, StargateWheelProps>(function StargateWheel({ selectedId, dialing, onSelect }, ref) {
  const initialRotation = useRef(rotationForDestination(selectedId)).current;
  const rotorRef = useRef<SVGGElement>(null);
  const assemblyRef = useRef<SVGGElement>(null);
  const horizonRef = useRef<SVGGElement>(null);
  const fieldRef = useRef<SVGGElement>(null);
  const chevronsRef = useRef<Array<SVGGElement | null>>([]);
  const captionsRef = useRef<Array<SVGGElement | null>>([]);
  const initialFocusIndex = Math.max(0, selectedId ? portalNodes.findIndex((item) => item.id === selectedId) : 0);
  const ringRotationRef = useRef(initialRotation);
  const lockedCountRef = useRef(lockCountForDestination(selectedId));
  const dialRef = useRef<gsap.core.Timeline | null>(null);

  const setRovingTabStop = (index: number) => {
    chevronsRef.current.forEach((chevron, chevronIndex) => {
      const hitArea = chevron?.querySelector<SVGCircleElement>('.chevron-hit');
      if (hitArea) hitArea.tabIndex = chevronIndex === index ? 0 : -1;
    });
  };

  const focusChevron = (index: number) => {
    setRovingTabStop(index);
    chevronsRef.current[index]?.querySelector<SVGCircleElement>('.chevron-hit')?.focus();
  };

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finishDialForReducedMotion = () => {
      if (motionPreference.matches && dialRef.current?.isActive()) {
        dialRef.current.progress(1).kill();
        dialRef.current = null;
      }
    };
    finishDialForReducedMotion();
    motionPreference.addEventListener('change', finishDialForReducedMotion);
    return () => {
      motionPreference.removeEventListener('change', finishDialForReducedMotion);
    };
  }, []);

  useEffect(() => {
    const horizon = horizonRef.current;
    if (!horizon || selectedId !== null || dialing || !horizon.classList.contains('is-active')) return;
    const closeHorizon = gsap.to(horizon, {
      opacity: 0,
      scale: 0.985,
      svgOrigin: `${CENTER} ${CENTER}`,
      duration: 0.26,
      ease: 'power2.in',
      onComplete: () => horizon.classList.remove('is-active'),
    });
    return () => { closeHorizon.kill(); };
  }, [selectedId, dialing]);

  useEffect(() => () => { dialRef.current?.kill(); }, []);

  useImperativeHandle(ref, () => ({
    dial: (destination, direction = 'outbound') => {
      const rotor = rotorRef.current;
      const assembly = assemblyRef.current;
      const field = fieldRef.current;
      const chevrons = chevronsRef.current;
      dialRef.current?.kill();
      if (!rotor || !assembly || !field || !chevrons.length) {
        const fallback = gsap.timeline();
        fallback.to({}, { duration: 0.25 });
        return fallback;
      }
      chevrons.forEach((chevron) => {
        const mechanism = chevron?.querySelector<SVGGElement>('.chevron-mechanism');
        if (mechanism) gsap.set(mechanism, { clearProps: 'transform' });
      });
      gsap.killTweensOf(rotor, 'rotation');
      const current = Number(gsap.getProperty(rotor, 'rotation')) || 0;
      const targetNode = portalNodes.find((node) => node.id === destination?.id) ?? portalNodes[0];
      const targetRingRotation = destination && targetNode ? -targetNode.angle : RING_ORIENTATION;
      const symbolAngle = ((destination?.gateSymbol ?? 0) / GLYPH_COUNT) * 360;
      const target = -symbolAngle - targetRingRotation;
      const preferredDirection = direction === 'inbound' ? -1 : 1;
      const finalRotation = shortestRotation(current, target, preferredDirection);
      const foundIndex = targetNode ? portalNodes.findIndex((node) => node.id === targetNode.id) : 0;
      const chosenIndex = Math.max(foundIndex, 0);
      const ringCurrent = ringRotationRef.current;
      const ringFinal = shortestRotation(ringCurrent, targetRingRotation, preferredDirection);
      const targetLockedCount = destination ? chosenIndex + 1 : 0;
      const currentLockedCount = lockedCountRef.current;
      const applyRingRotation = (rotation: number) => {
        assembly.setAttribute('transform', `rotate(${rotation} ${CENTER} ${CENTER})`);
        field.setAttribute('transform', `rotate(${rotation} ${CENTER} ${CENTER})`);
        captionsRef.current.forEach((caption, index) => {
          const item = portalNodes[index];
          if (caption && item) caption.setAttribute('transform', `rotate(${-item.angle - rotation} 0 ${-427 - CHEVRON_LABEL_GAP})`);
        });
      };
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        ringRotationRef.current = ringFinal;
        lockedCountRef.current = targetLockedCount;
        applyRingRotation(ringFinal);
        gsap.set(rotor, { rotation: target, svgOrigin: `${CENTER} ${CENTER}` });
        chevrons.forEach((chevron, index) => {
          const mechanism = chevron?.querySelector<SVGGElement>('.chevron-mechanism');
          const lens = chevron?.querySelector<SVGElement>('.chevron-lens');
          const glint = chevron?.querySelector<SVGElement>('.chevron-glint');
          const locked = index < targetLockedCount;
          chevron?.classList.toggle('is-locked', locked);
          if (mechanism) gsap.set(mechanism, { clearProps: 'transform' });
          if (lens) gsap.set(lens, { opacity: locked ? 1 : 0.74 });
          if (glint) gsap.set(glint, { opacity: locked ? 0.72 : 0.1 });
        });
        if (horizonRef.current) {
          gsap.killTweensOf(horizonRef.current);
          horizonRef.current.classList.add('is-active');
          gsap.set(horizonRef.current, { opacity: 1, scale: 1, svgOrigin: `${CENTER} ${CENTER}` });
        }
        const reducedTimeline = gsap.timeline();
        return reducedTimeline;
      }
      const timeline = gsap.timeline();
      dialRef.current = timeline;
      timeline.to(rotor, { rotation: finalRotation, svgOrigin: `${CENTER} ${CENTER}`, duration: 1.05, ease: 'power3.inOut' }, 0);
      const ringMotion = { rotation: ringCurrent };
      timeline.to(ringMotion, { rotation: ringFinal, duration: 0.82, ease: 'power3.inOut', onUpdate: () => {
        ringRotationRef.current = ringMotion.rotation;
        applyRingRotation(ringMotion.rotation);
      } }, 0);
      chevrons.forEach((chevron, index) => {
        const locked = index < currentLockedCount;
        const lens = chevron?.querySelector<SVGElement>('.chevron-lens');
        const glint = chevron?.querySelector<SVGElement>('.chevron-glint');
        chevron?.classList.toggle('is-locked', locked);
        if (lens) gsap.set(lens, { opacity: locked ? 1 : 0.74 });
        if (glint) gsap.set(glint, { opacity: locked ? 0.72 : 0.1 });
      });

      const lockSteps = targetLockedCount > currentLockedCount
        ? Array.from({ length: targetLockedCount - currentLockedCount }, (_, index) => ({ index: currentLockedCount + index, lock: true }))
        : Array.from({ length: currentLockedCount - targetLockedCount }, (_, index) => ({ index: currentLockedCount - index - 1, lock: false }));
      lockSteps.forEach(({ index, lock }, step) => {
        const chevron = chevrons[index];
        if (!chevron) return;
        const at = 0.12 + step * 0.145;
        const isFinalLock = lock && step === lockSteps.length - 1;
        const pressDepth = isFinalLock ? 4 : 2.5;
        const mechanism = chevron.querySelector<SVGGElement>('.chevron-mechanism');
        const lens = chevron.querySelector('.chevron-lens');
        const glint = chevron.querySelector('.chevron-glint');
        if (mechanism) {
          if (lock) {
            timeline.to(mechanism, { y: pressDepth, duration: isFinalLock ? 0.07 : 0.05, ease: 'power2.in' }, at);
            timeline.to(mechanism, { y: 0, duration: isFinalLock ? 0.14 : 0.1, ease: 'power3.out' }, at + (isFinalLock ? 0.07 : 0.05));
          } else {
            timeline.to(mechanism, { y: -2, duration: 0.08, ease: 'power2.out' }, at);
            timeline.to(mechanism, { y: 0, duration: 0.12, ease: 'power3.inOut' }, at + 0.08);
          }
        }
        if (lens) timeline.to(lens, { opacity: lock ? 1 : 0.74, duration: 0.13, ease: 'power1.out' }, at + 0.05);
        if (glint) timeline.to(glint, { opacity: lock ? 0.9 : 0.1, duration: 0.15 }, at + 0.07);
        timeline.call(() => {
          chevron.classList.toggle('is-locked', lock);
          lockedCountRef.current = lock ? Math.max(lockedCountRef.current, index + 1) : Math.min(lockedCountRef.current, index);
        }, [], at + 0.2);
      });
      const horizon = horizonRef.current;
      if (horizon) {
        const finalLockAt = lockSteps.length ? 0.12 + (lockSteps.length - 1) * 0.145 + 0.2 : 0.12;
        timeline.call(() => horizon.classList.add('is-active'), [], finalLockAt);
        timeline.fromTo(horizon,
          { opacity: 0, scale: 0.965, svgOrigin: `${CENTER} ${CENTER}` },
          { opacity: 1, scale: 1, svgOrigin: `${CENTER} ${CENTER}`, duration: 0.28, ease: 'power2.out', immediateRender: false },
          finalLockAt,
        );
      }
      timeline.eventCallback('onComplete', () => { lockedCountRef.current = targetLockedCount; });
      return timeline;
    },
  }), []);

  return <svg className={`stargate-svg ${dialing ? 'is-dialing' : ''}`} viewBox="0 0 900 900" role="group" aria-label="TNICore Stargate navigation. Use the arrow keys to move between destinations, then press Enter or Space to dial.">
    <defs>
      <linearGradient id="gate-outer-steel" x1="0" y1="0" x2="0.82" y2="1">
        <stop offset="0" stopColor="#737777" /><stop offset=".12" stopColor="#25292a" /><stop offset=".26" stopColor="#777b7b" />
        <stop offset=".41" stopColor="#202425" /><stop offset=".59" stopColor="#515657" /><stop offset=".74" stopColor="#191c1d" /><stop offset=".9" stopColor="#686c6c" /><stop offset="1" stopColor="#242829" />
      </linearGradient>
      <linearGradient id="gate-ring-face" x1="0" y1="0" x2="1" y2=".7">
        <stop offset="0" stopColor="#141718" /><stop offset=".2" stopColor="#555a5a" /><stop offset=".39" stopColor="#242829" />
        <stop offset=".56" stopColor="#737878" /><stop offset=".72" stopColor="#25292a" /><stop offset=".9" stopColor="#565a5b" /><stop offset="1" stopColor="#111314" />
      </linearGradient>
      <linearGradient id="gate-engraved-panel" x1="0" y1="0" x2=".86" y2="1">
        <stop offset="0" stopColor="#858a88" /><stop offset=".16" stopColor="#3e4342" /><stop offset=".5" stopColor="#686d6b" />
        <stop offset=".78" stopColor="#303535" /><stop offset="1" stopColor="#777c7a" />
      </linearGradient>
      <linearGradient id="gate-engraved-panel-reverse" x1="0" y1="1" x2=".86" y2="0">
        <stop offset="0" stopColor="#858a88" /><stop offset=".16" stopColor="#3e4342" /><stop offset=".5" stopColor="#686d6b" />
        <stop offset=".78" stopColor="#303535" /><stop offset="1" stopColor="#777c7a" />
      </linearGradient>
      <linearGradient id="gate-glyph-track-face" x1="0" y1="1" x2="1" y2=".25">
        <stop offset="0" stopColor="#111314" /><stop offset=".2" stopColor="#565a5b" /><stop offset=".39" stopColor="#25292a" />
        <stop offset=".56" stopColor="#737878" /><stop offset=".72" stopColor="#242829" /><stop offset=".9" stopColor="#555a5a" /><stop offset="1" stopColor="#141718" />
      </linearGradient>
      <linearGradient id="gate-chevron-shell" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#171a1b" /><stop offset=".25" stopColor="#888c8b" /><stop offset=".49" stopColor="#303435" />
        <stop offset=".72" stopColor="#a6aaa8" /><stop offset="1" stopColor="#151819" />
      </linearGradient>
      <linearGradient id="gate-chevron-lens" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#e2e4e1" /><stop offset=".35" stopColor="#7e8382" /><stop offset=".75" stopColor="#383c3d" /><stop offset="1" stopColor="#141617" />
      </linearGradient>
      <radialGradient id="gate-horizon-depth" cx="46%" cy="40%" r="72%">
        <stop offset="0" stopColor="#656b6b" /><stop offset=".22" stopColor="#373c3d" /><stop offset=".58" stopColor="#111415" /><stop offset=".82" stopColor="#272c2d" /><stop offset="1" stopColor="#858a88" />
      </radialGradient>
      <linearGradient id="gate-horizon-sheen" x1=".12" y1=".18" x2=".86" y2=".9">
        <stop offset="0" stopColor="#f0f2ee" stopOpacity=".72" /><stop offset=".24" stopColor="#b9bfbc" stopOpacity=".16" /><stop offset=".58" stopColor="#070909" stopOpacity=".04" /><stop offset="1" stopColor="#d8dcda" stopOpacity=".38" />
      </linearGradient>
      <clipPath id="gate-horizon-clip"><circle cx={CENTER} cy={CENTER} r="244" /></clipPath>
      <filter id="gate-horizon-fluid" x="-8%" y="-8%" width="116%" height="116%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency=".014 .026" numOctaves="2" seed="7" result="horizon-noise" />
        <feDisplacementMap in="SourceGraphic" in2="horizon-noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="gate-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="13" /></filter>
    </defs>

    <ellipse cx={CENTER} cy="858" rx="300" ry="19" fill="#000" opacity=".76" filter="url(#gate-shadow)" />
    <g ref={assemblyRef} className="gate-assembly" transform={`rotate(${initialRotation} ${CENTER} ${CENTER})`}>
    <circle cx={CENTER} cy={CENTER} r="378" fill="none" stroke="#050606" strokeWidth="86" opacity=".9" />
    <circle cx={CENTER} cy={CENTER} r="378" fill="none" stroke="url(#gate-outer-steel)" strokeWidth="73" />
    <circle cx={CENTER} cy={CENTER} r="416" fill="none" stroke="#8b8f8e" strokeWidth="2.2" opacity=".72" />
    <circle cx={CENTER} cy={CENTER} r="406" fill="none" stroke="#080a0a" strokeWidth="5" />
    <circle cx={CENTER} cy={CENTER} r="346" fill="none" stroke="#0b0d0e" strokeWidth="7" />
    <circle cx={CENTER} cy={CENTER} r="340" fill="none" stroke="#aeb1af" strokeWidth="1.5" opacity=".72" />

    <g className="gate-engraved-panels" aria-hidden="true">
      {Array.from({ length: GLYPH_COUNT }, (_, index) => <g key={index}>
        <path d={ringSegmentPath(index, GLYPH_COUNT, 349, 406)} fill={index % 2 ? 'url(#gate-engraved-panel)' : 'url(#gate-engraved-panel-reverse)'} stroke="#171a1b" strokeWidth="1.25" />
        <path d={ringSegmentPath(index, GLYPH_COUNT, 357, 358.5)} fill="#c1c5c2" opacity=".24" />
        <path d={ringSegmentPath(index, GLYPH_COUNT, 393, 394.5)} fill="#080a0b" opacity=".68" />
      </g>)}
    </g>

    <g className="gate-outer-plates">
      {Array.from({ length: 40 }, (_, index) => <path key={index} d="M-3 -348 L-7 -378 L-2 -401 L2 -401 L7 -378 L3 -348 Z" transform={`translate(${CENTER} ${CENTER}) rotate(${index * 9})`} fill={index % 2 ? 'url(#gate-ring-face)' : 'url(#gate-outer-steel)'} stroke="#151819" strokeWidth="1.4" />)}
    </g>
    <circle cx={CENTER} cy={CENTER} r="392" fill="none" stroke="#c6c9c7" strokeWidth="1" strokeDasharray="1 8" opacity=".45" />
    <circle cx={CENTER} cy={CENTER} r="362" fill="none" stroke="#090b0c" strokeWidth="5" />
    <circle cx={CENTER} cy={CENTER} r="357" fill="none" stroke="#777c7c" strokeWidth="2" />
    <g className="gate-rivets">
      {Array.from({ length: 48 }, (_, index) => <circle key={index} cx={CENTER} cy="72" r={index % 4 === 0 ? 3.25 : 2.3} transform={`rotate(${index * 7.5} ${CENTER} ${CENTER})`} />)}
    </g>

    <g className="gate-rotor" ref={rotorRef}>
      <circle cx={CENTER} cy={CENTER} r="310" fill="none" stroke="#080a0b" strokeWidth="62" />
      <circle cx={CENTER} cy={CENTER} r="310" fill="none" stroke="url(#gate-glyph-track-face)" strokeWidth="52" />
      <circle cx={CENTER} cy={CENTER} r="339" fill="none" stroke="#929695" strokeWidth="1.6" />
      <circle cx={CENTER} cy={CENTER} r="336" fill="none" stroke="#111415" strokeWidth="2.4" />
      <circle cx={CENTER} cy={CENTER} r="284" fill="none" stroke="#c3c6c4" strokeWidth="1.1" strokeDasharray="1 5.1" opacity=".84" />
      <circle cx={CENTER} cy={CENTER} r="282" fill="none" stroke="#090b0c" strokeWidth="2" />
      <g className="rotor-seams">{Array.from({ length: GLYPH_COUNT }, (_, index) => <path key={index} d="M450 287 V333" transform={`rotate(${(index + 0.5) * (360 / GLYPH_COUNT)} ${CENTER} ${CENTER})`} />)}</g>
      <GateGlyphs />
    </g>

    <circle cx={CENTER} cy={CENTER} r="264" fill="none" stroke="#121516" strokeWidth="14" />
    <circle cx={CENTER} cy={CENTER} r="256" fill="none" stroke="url(#gate-outer-steel)" strokeWidth="8" />
    <circle cx={CENTER} cy={CENTER} r="248" fill="#0c0e0f" stroke="#090b0c" strokeWidth="3" />
    </g>
    <g className="brand-core">
      {selectedId === null && !dialing && <image href={brandLogo} x="340" y="340" width="220" height="220" preserveAspectRatio="xMidYMid meet" className="gate-brand-emblem" />}
    </g>

    <g ref={horizonRef} className="event-horizon" aria-hidden="true" opacity="0" clipPath="url(#gate-horizon-clip)">
      <circle className="horizon-depth" cx={CENTER} cy={CENTER} r="244" fill="url(#gate-horizon-depth)" />
      <circle className="horizon-rim" cx={CENTER} cy={CENTER} r="241" fill="none" stroke="#d8dcda" strokeWidth="1.4" opacity=".62" />
      <g className="horizon-fluid" filter="url(#gate-horizon-fluid)">
        <path d="M215 434 C286 392 328 406 374 438 C420 470 464 472 509 430 C556 386 602 393 685 442" fill="none" stroke="url(#gate-horizon-sheen)" strokeWidth="11" opacity=".44" />
        <path d="M222 486 C294 448 343 456 386 482 C435 512 473 509 522 474 C571 439 620 446 678 486" fill="none" stroke="#e1e4e0" strokeWidth="2.2" opacity=".24" />
        <path d="M270 370 C330 337 375 355 419 379 C462 403 502 395 539 371 C579 345 618 351 652 378" fill="none" stroke="#f0f2ee" strokeWidth="1.5" opacity=".31" />
        <ellipse className="horizon-ripple horizon-ripple-outer" cx={CENTER} cy={CENTER} rx="208" ry="130" fill="none" stroke="#dce0dc" strokeWidth="1.4" opacity=".2" />
        <ellipse className="horizon-ripple horizon-ripple-middle" cx={CENTER} cy={CENTER} rx="164" ry="98" fill="none" stroke="#c9cecb" strokeWidth="1.1" opacity=".18" />
        <ellipse className="horizon-ripple horizon-ripple-inner" cx={CENTER} cy={CENTER} rx="112" ry="66" fill="none" stroke="#eef0ed" strokeWidth=".9" opacity=".14" />
        <ellipse cx="430" cy="414" rx="125" ry="36" transform="rotate(-13 430 414)" fill="url(#gate-horizon-sheen)" opacity=".17" />
      </g>
    </g>

    <g ref={fieldRef} className="gate-chevron-field" transform={`rotate(${initialRotation} ${CENTER} ${CENTER})`}>
      {portalNodes.map((item, index) => <GateChevron key={item.id} item={item} index={index} selected={selectedId === item.id} locked={index < lockCountForDestination(selectedId)} initialRotation={initialRotation} chevronRef={(node) => { chevronsRef.current[index] = node; }} captionRef={(node) => { captionsRef.current[index] = node; }} onFocusIndex={focusChevron} onFocusItem={setRovingTabStop} onSelect={() => onSelect(item)} tabIndex={index === initialFocusIndex ? 0 : -1} />)}
    </g>
  </svg>;
});

export default StargateWheel;
