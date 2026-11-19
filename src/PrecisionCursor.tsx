import { useEffect, useRef } from 'react';

export default function PrecisionCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    if (!cursor || !finePointer.matches) return;

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let targetX = x;
    let targetY = y;

    const render = () => {
      x += (targetX - x) * 0.34;
      y += (targetY - y) * 0.34;
      // The reference cursor's tip sits at roughly 69% / 25% of its bounds.
      // Keep that point under the real pointer so clicks stay pixel-accurate.
      cursor.style.transform = `translate3d(${x - cursor.offsetWidth * 0.3125}px, ${y - cursor.offsetHeight * 0.25}px, 0)`;
      frame = window.requestAnimationFrame(render);
    };
    const onMove = (event: PointerEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursor.classList.add('is-visible');
      const interactive = (event.target as Element | null)?.closest('a,button,[role="button"],[tabindex]:not([tabindex="-1"])');
      cursor.classList.toggle('is-interactive', Boolean(interactive));
      const selectable = (event.target as Element | null)?.closest('p,li,h1,h2,[contenteditable="true"],input,textarea');
      cursor.classList.toggle('is-text', Boolean(selectable));
      document.documentElement.classList.toggle('precision-text-cursor', Boolean(selectable));
    };
    const onDown = () => cursor.classList.add('is-pressed');
    const onUp = () => cursor.classList.remove('is-pressed');
    const onLeave = () => {
      cursor.classList.remove('is-visible', 'is-interactive', 'is-text', 'is-pressed');
      document.documentElement.classList.remove('precision-text-cursor');
    };

    document.documentElement.classList.add('has-precision-cursor');
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('blur', onLeave);
    document.documentElement.addEventListener('pointerleave', onLeave);
    frame = window.requestAnimationFrame(render);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('blur', onLeave);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      document.documentElement.classList.remove('has-precision-cursor', 'precision-text-cursor');
    };
  }, []);

  return <div ref={cursorRef} className="precision-cursor" aria-hidden="true">
    <svg className="precision-cursor-mark" viewBox="0 0 512 512" focusable="false">
      <g transform="translate(512 0) scale(-1 1)">
        <path className="precision-cursor-rays" d="M352 28V72M226 32L271 78M480 32L432 79M466 160H493M432 241L480 289" />
        <path className="precision-cursor-pointer" d="M350 128Q374 127 384 149L247 479Q236 506 218 495Q212 491 208 478L165 347L35 307Q7 298 16 274Q19 265 31 260L339 131Q345 128 350 128Z" />
      </g>
    </svg>
  </div>;
}
