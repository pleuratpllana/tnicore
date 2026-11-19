import { useCallback, useEffect, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import gsap from 'gsap';
import { destinations, onboardingHub, portalNodes, type Destination, type DestinationId } from './destinations';
import StargateWheel, { StargateGlyphIcon, type StargateWheelHandle } from './StargateWheel';
import Hyperdrive from './Hyperdrive';
import PrecisionCursor from './PrecisionCursor';
import brandLogo from '../references/Images/logo.png';

const onboardingOptions = destinations.filter((item) => item.group === 'onboarding');
const localDestinations = [onboardingHub, ...destinations];
const comingSoonDestinations = new Set<DestinationId>([
  'onboarding', 'customer', 'client', 'technician', 'projects', 'email', 'payment',
]);

function readDestination(path: string): Destination | null {
  return localDestinations.find((item) => item.href === path) ?? null;
}

function navigationIdFor(destination: Destination | null): DestinationId | null {
  if (!destination) return null;
  return portalNodes.some((item) => item.id === destination.id) ? destination.id : 'onboarding';
}

export default function PortalPage() {
  const [routeDestination, setRouteDestination] = useState<Destination | null>(() => readDestination(window.location.pathname));
  const [destinationVisible, setDestinationVisible] = useState(() => Boolean(readDestination(window.location.pathname)));
  const [selected, setSelected] = useState<DestinationId | null>(() => navigationIdFor(routeDestination));
  const [dialing, setDialing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [jumping, setJumping] = useState(false);
  const [jumpLabel, setJumpLabel] = useState('');
  const selectedDestination = selected ? portalNodes.find((item) => item.id === selected) ?? null : null;
  const gateStatus = selectedDestination ? `LOCKED · ${selectedDestination.label.toUpperCase()}` : 'GATE READY';
  const gateRef = useRef<StargateWheelHandle>(null);
  const transitionTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const transitionGenerationRef = useRef(0);
  const arrivedGenerationRef = useRef(0);
  const travelProgressRef = useRef({ value: 0 });
  const transitionLockRef = useRef(false);
  const pendingDestinationRef = useRef<Destination | null>(null);
  const pendingDirectionRef = useRef<'outbound' | 'inbound'>('outbound');
  const pendingHistoryModeRef = useRef<'push' | 'none'>('push');
  const wheelAccumulatorRef = useRef(0);
  const wheelResetTimerRef = useRef<number | null>(null);
  const wheelGestureConsumedRef = useRef(false);
  const wheelGestureDirectionRef = useRef(0);
  const hoveredChevronRef = useRef<SVGGElement | null>(null);
  const gateDestination = transitionLockRef.current ? pendingDestinationRef.current : routeDestination;

  const setHoveredChevron = useCallback((chevron: SVGGElement | null) => {
    if (hoveredChevronRef.current === chevron) return;
    hoveredChevronRef.current?.classList.remove('is-hovered');
    hoveredChevronRef.current = chevron;
    hoveredChevronRef.current?.classList.add('is-hovered');
  }, []);

  const handleGateSurfacePointerMove = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    const directChevron = (event.target as Element).closest<SVGGElement>('.gate-chevron');
    if (directChevron) {
      setHoveredChevron(directChevron);
      return;
    }
    const chevrons = Array.from(event.currentTarget.querySelectorAll<SVGGElement>('.gate-chevron'));
    const nearest = chevrons.map((chevron) => {
      const bounds = chevron.querySelector<SVGCircleElement>('.chevron-hit')?.getBoundingClientRect();
      if (!bounds) return { chevron, distance: Number.POSITIVE_INFINITY };
      const dx = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
      const dy = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);
      return { chevron, distance: Math.hypot(dx, dy) };
    }).sort((a, b) => a.distance - b.distance)[0];
    setHoveredChevron(nearest && nearest.distance <= 1 ? nearest.chevron : null);
  }, [setHoveredChevron]);

  useEffect(() => {
    const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    intro.fromTo('.topbar', { y: -16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.72 })
      .fromTo('.portal-heading > *', { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.09 }, '-=0.3')
      .fromTo('.gate-stage', { autoAlpha: 0, scale: 0.96 }, { autoAlpha: 1, scale: 1, duration: 0.75, ease: 'power2.out' }, '-=0.15')
      .fromTo('.gate-console, .portal-footer', { autoAlpha: 0, y: 9 }, { autoAlpha: 1, y: 0, duration: 0.48, stagger: 0.08 }, '-=0.18');
    const finishIntroForReducedMotion = (event?: MediaQueryListEvent) => {
      if (event?.matches ?? motionPreference.matches) intro.progress(1);
    };
    finishIntroForReducedMotion();
    motionPreference.addEventListener('change', finishIntroForReducedMotion);
    return () => {
      motionPreference.removeEventListener('change', finishIntroForReducedMotion);
      intro.kill();
    };
  }, []);

  const arrive = useCallback((generation: number) => {
    if (generation !== transitionGenerationRef.current || generation === arrivedGenerationRef.current) return;
    arrivedGenerationRef.current = generation;
    const destination = pendingDestinationRef.current;
    if (pendingHistoryModeRef.current === 'push') {
      window.history.pushState(destination ? { destination: destination.id } : {}, '', destination?.href ?? '/');
    }
    setRouteDestination(destination);
    setDestinationVisible(Boolean(destination));
    setJumping(false);
    setBusy(false);
    setDialing(false);
    setSelected(navigationIdFor(destination));
    setJumpLabel('');
    travelProgressRef.current.value = 0;
    pendingDirectionRef.current = 'outbound';
    pendingHistoryModeRef.current = 'push';
    transitionLockRef.current = false;
    pendingDestinationRef.current = null;
  }, []);

  const travelTo = useCallback((destination: Destination | null, historyMode: 'push' | 'none' = 'push', replaceCurrent = false) => {
    if (transitionLockRef.current && !replaceCurrent) return;
    const replacingTransition = transitionLockRef.current;
    const generation = ++transitionGenerationRef.current;
    setHoveredChevron(null);
    transitionTimelineRef.current?.kill();
    transitionTimelineRef.current = null;
    travelProgressRef.current.value = 0;
    transitionLockRef.current = true;
    pendingDestinationRef.current = destination;
    pendingDirectionRef.current = destination ? 'outbound' : 'inbound';
    pendingHistoryModeRef.current = historyMode;
    // Remove outgoing content now; mount the incoming page once on arrival.
    setDestinationVisible(false);
    if (!replacingTransition) setJumping(false);
    setSelected(navigationIdFor(destination));
    setBusy(true);
    setDialing(true);
    setJumpLabel(destination?.label ?? 'HOME GATE');

    if (!gateRef.current) {
      arrive(generation);
      return;
    }
    const dialTimeline = gateRef.current.dial(destination, pendingDirectionRef.current);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const travelTimeline = gsap.timeline({ onComplete: () => arrive(generation) });
    transitionTimelineRef.current = travelTimeline;
    travelTimeline.add(dialTimeline, 0)
      .to(travelProgressRef.current, {
        value: 0.22,
        duration: reducedMotion ? 0.08 : 0.3,
        ease: 'power3.inOut',
      }, 0)
      .call(() => setJumping(true))
      .to(travelProgressRef.current, {
        value: 1,
        duration: reducedMotion ? 0.1 : 0.74,
        ease: 'power2.inOut',
      }, '+=0.04')
      .to(travelProgressRef.current, {
        value: 0,
        duration: reducedMotion ? 0.1 : 0.38,
        ease: 'power2.inOut',
      });
  }, [arrive, setHoveredChevron]);

  const depart = useCallback((destination: Destination) => travelTo(destination), [travelTo]);

  const handleGateSurfaceClick = useCallback((event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as Element;
    if (target.closest('.gate-chevron')) return;
    const chevrons = Array.from(event.currentTarget.querySelectorAll<SVGGElement>('.gate-chevron'));
    const nearest = chevrons
      .map((chevron, index) => {
        const hitArea = chevron.querySelector<SVGCircleElement>('.chevron-hit');
        const bounds = hitArea?.getBoundingClientRect();
        if (!bounds) return { index, distance: Number.POSITIVE_INFINITY };
        const dx = (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2);
        const dy = (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2);
        return { index, distance: Math.hypot(dx, dy) };
      })
      .sort((a, b) => a.distance - b.distance)[0];
    const destination = nearest && nearest.distance <= 1 ? portalNodes[nearest.index] : undefined;
    if (destination) depart(destination);
  }, [depart]);

  const returnToGate = useCallback(() => {
    if (!routeDestination || transitionLockRef.current) return;
    travelTo(null);
  }, [routeDestination, travelTo]);

  useEffect(() => {
    const onPopState = () => {
      const destination = readDestination(window.location.pathname);
      const currentTarget = transitionLockRef.current ? pendingDestinationRef.current : routeDestination;
      if (destination?.href === currentTarget?.href || (!destination && !currentTarget)) return;
      travelTo(destination, 'none', true);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [routeDestination, travelTo]);

  const handleWheel = useCallback((event: WheelEvent) => {
    if (event.ctrlKey) return;
    event.preventDefault();
    const resetWheelGesture = () => {
      wheelAccumulatorRef.current = 0;
      wheelGestureConsumedRef.current = false;
      wheelGestureDirectionRef.current = 0;
      wheelResetTimerRef.current = null;
    };
    const armWheelGestureReset = () => {
      if (wheelResetTimerRef.current !== null) window.clearTimeout(wheelResetTimerRef.current);
      wheelResetTimerRef.current = window.setTimeout(resetWheelGesture, 280);
    };
    if (transitionLockRef.current) {
      wheelAccumulatorRef.current = 0;
      wheelGestureConsumedRef.current = true;
      wheelGestureDirectionRef.current = event.deltaY > 0 ? 1 : -1;
      armWheelGestureReset();
      return;
    }
    const unit = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 16 : event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? window.innerHeight : 1;
    wheelAccumulatorRef.current = Math.max(-720, Math.min(720, wheelAccumulatorRef.current + event.deltaY * unit));
    armWheelGestureReset();

    // Standard mice emit one to three lines per notch; low-resolution and
    // high-resolution wheels should both advance on a single deliberate tick.
    if (Math.abs(wheelAccumulatorRef.current) < 12) return;
    const step = wheelAccumulatorRef.current > 0 ? 1 : -1;
    wheelAccumulatorRef.current = 0;
    if (wheelGestureConsumedRef.current && wheelGestureDirectionRef.current === step) return;
    wheelGestureConsumedRef.current = true;
    wheelGestureDirectionRef.current = step;

    const activeTarget = transitionLockRef.current ? pendingDestinationRef.current : routeDestination;
    const currentId = (activeTarget ? navigationIdFor(activeTarget) : selected) ?? null;
    const currentIndex = currentId
      ? Math.max(0, portalNodes.findIndex((item) => item.id === currentId))
      : Math.max(0, portalNodes.findIndex((item) => item.id === 'projects'));
    const nextIndex = (currentIndex + step + portalNodes.length) % portalNodes.length;
    const destination = portalNodes[nextIndex];
    if (destination) travelTo(destination, 'push', transitionLockRef.current);
  }, [routeDestination, selected, travelTo]);

  useEffect(() => {
    window.addEventListener('wheel', handleWheel, { capture: true, passive: false });
    return () => window.removeEventListener('wheel', handleWheel, true);
  }, [handleWheel]);

  useEffect(() => () => {
    if (wheelResetTimerRef.current !== null) window.clearTimeout(wheelResetTimerRef.current);
    transitionGenerationRef.current += 1;
    transitionTimelineRef.current?.kill();
  }, []);

  return <main className={`portal-shell ${dialing ? 'is-dialing' : ''} ${jumping ? 'is-jumping' : ''}`}>
    <div className="ambient-grain" aria-hidden="true" />
    <header className="topbar">
      <a href="/" className="brand" aria-label="Return to TNICore portal" onClick={(event) => { if (routeDestination) { event.preventDefault(); returnToGate(); } }}>
        <img src={brandLogo} alt="" className="brand-mark" />
        <span>TNICORE</span>
      </a>
      {routeDestination ? <button type="button" className="portal-state is-control return-button" onClick={returnToGate} disabled={busy}>
        <span>RETURN TO GATE</span>
      </button> : <div className="portal-state" aria-live="polite"><span /> {gateStatus}</div>}
    </header>

    <section className="portal-layout">
      <div className={`gate-world ${gateDestination ? 'is-inner-page' : ''}`}>
        <div className="portal-heading">
          <div className="eyebrow">TNICORE NETWORK <span> | </span> DESTINATION SELECTOR</div>
          <h1 className="text-4xl">Choose a <em>destination</em></h1>
          <p>Select a chevron or scroll to dial.</p>
        </div>

        <div className="gate-stage" onClickCapture={handleGateSurfaceClick} onPointerMove={handleGateSurfacePointerMove} onPointerLeave={() => setHoveredChevron(null)}>
          <StargateWheel ref={gateRef} selectedId={selected} dialing={dialing} onSelect={depart} />
          <div className="stage-register register-west" aria-hidden="true"><span>ROTATING SYMBOL TRACK</span><i /></div>
          <div className="stage-register register-east" aria-hidden="true"><i /><span>FIVE ACCESS NODES</span></div>
        </div>

      </div>

      {routeDestination && destinationVisible && <DestinationPage key={routeDestination.id} destination={routeDestination} onReturn={returnToGate} onNavigate={depart} />}
    </section>

    <footer className="portal-footer"><span>{routeDestination ? '© 2026 TNICORE' : ''}</span></footer>
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {routeDestination ? `Current destination: ${routeDestination.label}.` : 'Stargate homepage active.'}
    </div>
    <div className={`hyperdrive-host ${jumping ? 'is-active' : ''} ${!routeDestination && !busy && !dialing && !jumping ? 'is-home-ambient' : ''} ${routeDestination && !busy && !jumping ? 'is-inner-ambient' : ''}`} aria-hidden={!jumping}>
      <Hyperdrive destination={jumpLabel} ambient={!busy && !jumping} engaged={dialing} active={jumping} direction={pendingDirectionRef.current} travelProgress={travelProgressRef.current} />
    </div>
    <PrecisionCursor />
  </main>;
}

function DestinationPage({ destination, onReturn, onNavigate }: {
  destination: Destination;
  onReturn: () => void;
  onNavigate: (destination: Destination) => void;
}) {
  const content: Record<DestinationId, { heading: string; copy: string; details: string[] }> = {
    onboarding: { heading: 'Onboarding', copy: 'Choose the profile that matches your request.', details: ['Customer', 'Client', 'Technician'] },
    customer: { heading: 'Customer onboarding', copy: 'The customer onboarding form will be connected when its destination is supplied.', details: ['Customer profile', 'Contact details', 'TNICore email provisioned after onboarding'] },
    client: { heading: 'Client onboarding', copy: 'The client onboarding form will be connected when its destination is supplied.', details: ['Client profile', 'Company details', 'TNICore email provisioned after onboarding'] },
    technician: { heading: 'Technician onboarding', copy: 'The technician onboarding form will be connected when its destination is supplied.', details: ['Technician profile', 'Qualifications', 'TNICore email provisioned after onboarding'] },
    projects: { heading: 'Projects', copy: 'Project workspace destination · SharePoint access requires your organization login.', details: ['SharePoint', 'Organization sign-in required', 'Destination URL to be configured'] },
    bicsi: { heading: 'BICSI', copy: 'Training and certified staff by certification level.', details: ['RCDD — XXX', 'Technician — XXX', 'Training'] },
    email: { heading: 'TNICore webmail', copy: 'Roundcube webmail destination. The custom email skin is not connected in this preview.', details: ['Roundcube', 'TNICore email', 'No credentials requested here'] },
    payment: { heading: 'Payment Portal', copy: 'The approved payment destination will be connected when its URL is supplied.', details: ['Payment portal', 'No payment processing is connected', 'No payment details are collected here'] },
  };
  const page = content[destination.id];
  const isOnboarding = destination.id === 'onboarding';
  const isComingSoon = comingSoonDestinations.has(destination.id);

  return <section className="destination-view" aria-labelledby="destination-heading">
    <div className="destination-kicker"><StargateGlyphIcon className="destination-symbol" symbolIndex={destination.gateSymbol} /><span>TNICORE NETWORK</span><i /> DESTINATION {destination.routeNumber}</div>
    <h2 id="destination-heading">{page.heading}</h2>
    {isComingSoon && <div className="destination-availability">COMING SOON</div>}
    <p>{page.copy}</p>
    {isOnboarding ? <div className="onboarding-routes" aria-label="Onboarding profiles">
      {onboardingOptions.map((option) => <button type="button" key={option.id} onClick={() => onNavigate(option)}>
        <StargateGlyphIcon className="route-symbol" symbolIndex={option.gateSymbol} /><span>{option.routeNumber}</span><strong>{option.label}</strong>
      </button>)}
    </div> : <ul>{page.details.map((detail) => <li key={detail}><span />{detail}</li>)}</ul>}
    <button className="return-button" type="button" onClick={onReturn}><span>RETURN TO GATE</span></button>
  </section>;
}
