# Stargate Portal Improvement Roadmap

## Purpose

This document defines a practical improvement roadmap for the existing
Stargate inspired portal.

The goal is to bring the current implementation much closer to the
original creative brief, especially its defining experience: a
recognizable Stargate mechanism that dials a destination, locks its
chevrons, activates an event horizon, and carries the user through a
convincing portal transition.

This is an improvement plan for the existing project, not a request to
replace the application or rebuild it from scratch.

## Source of truth and priorities

Use the original project brief as the primary source of requirements.

Use this document as the improvement roadmap for addressing the gaps
identified in the current implementation.

Preserve the existing application structure, working functionality,
navigation destinations, supplied assets, and visual direction unless a
specific change is necessary to meet the original brief.

The current implementation has a useful foundation:

-   A custom SVG wheel.
-   Five clickable destinations: Onboarding, Projects, BICSI, Webmail,
    and Payment Portal.
-   Onboarding choices for Customer, Client, and Technician.
-   A rotating symbol track.
-   Sequenced chevron illumination.
-   A shared Canvas starfield.
-   GSAP driven navigation and transition timing.
-   Keyboard and mouse wheel navigation.
-   A dark, monochromatic, metallic visual direction.
-   Reduced motion handling.
-   Clearly identified placeholder destinations where integrations or
    real URLs are not available.

The main gap is that these elements currently read more like a stylized
navigation interface than one coherent, physical Stargate mechanism and
experience.

## Overall target experience

The finished portal should communicate the following sequence clearly
and convincingly:

1.  The user selects a destination.
2.  The Stargate begins dialing.
3.  The inner ring rotates and settles on the appropriate glyph or
    address position.
4.  The chevrons engage mechanically and illuminate in sequence.
5.  The final chevron locks.
6.  The event horizon activates inside the gate.
7.  The portal and surrounding environment react to the activation.
8.  The user appears to travel through the portal.
9.  The destination is revealed after arrival.

The sequence should feel like one coordinated experience. It should not
feel like unrelated interface animations playing at the same time.

The visual result should be recognizably inspired by the Stargate SG1
mechanism, rather than simply looking like a futuristic circular menu.

## Improvement roadmap

The phases below are ordered by priority. Complete and review one phase
before moving to the next.

## Phase 1: Mechanical construction and Stargate visual accuracy

**Priority: Highest**

**Impact: High**

**Feasibility: High**

### Current gap

The current wheel uses layered SVG rings, metallic gradients, and
decorative details. However, the overall construction still reads as a
stylized circular interface rather than a recognizable Stargate
mechanism.

The main issue is not necessarily the rendering technology. It is the
definition, proportion, and relationship of the physical components.

### Recommended improvements

1.  Study the supplied Stargate reference material and use the
    recognizable SG1 gate as the visual reference.
2.  Establish clearly defined physical layers:
    -   A stationary outer frame.
    -   A rotating inner symbol ring.
    -   A fixed central opening or hub.
    -   Chevrons mounted at consistent positions around the outer frame.
3.  Improve the proportions and spacing between the stationary and
    rotating components.
4.  Give each mechanical layer its own geometry, surface treatment, and
    lighting behavior.
5.  Make the chevrons appear physically integrated into the outer frame,
    rather than appearing as interface indicators placed around a
    circle.
6.  Improve metallic depth through controlled highlights, shadows,
    bevels, material variation, and restrained reflections.
7.  Ensure the stationary frame remains visually stable while the
    rotating component moves.
8.  Preserve the existing application layout, destinations, and working
    navigation.

### Intended result

The gate should have a recognizable mechanical silhouette and a
convincing distinction between stationary and rotating parts.

A viewer should be able to understand that this is a physical machine
before any animation begins.

### Technical direction

Keep the existing SVG approach initially. The current portal is
primarily front facing, so carefully constructed SVG geometry and GSAP
animation should be sufficient for this phase.

Do not introduce Three.js simply for the sake of using 3D technology.
Consider it only if the desired visual result genuinely requires camera
movement, substantial perspective, or geometry that cannot be
represented convincingly with SVG.

## Phase 2: Rotating ring and authentic glyph system

**Priority: Highest**

**Impact: High**

**Feasibility: High**

### Current gap

The current glyph marks are procedurally generated. They do not form a
deliberate, coherent symbol system and weaken the impression that the
gate has a real addressing mechanism.

The rotating track also needs a clearer relationship between its
selected glyph, its final position, and the chosen destination.

### Recommended improvements

1.  Replace arbitrary generated marks with a deliberate set of distinct
    Stargate inspired glyphs.
2.  Use visual references to guide the design and proportions of the
    glyphs.
3.  Keep the glyphs consistent in stroke weight, scale, visual
    complexity, and spacing.
4.  Arrange the glyphs in one ordered system around the rotating ring.
5.  Ensure each glyph has a stable position and identity.
6.  Make the selected glyph align precisely with one clearly defined
    active point on the gate.
7.  Synchronize the final ring position with the selected destination.
8.  Ensure the ring settles naturally and does not stop at an arbitrary
    angle.
9.  Preserve crisp rendering at different viewport sizes.

### Intended result

The rotating ring should look like an intentional addressing mechanism
rather than a decorative track of random symbols.

The user should be able to understand that the ring is dialing a
specific destination and that the final glyph position has meaning.

### Technical direction

Use SVG paths or other crisp vector artwork for the glyphs. Keep their
positions and ordering deterministic.

Use GSAP to control rotation and settling. Avoid generating a new random
symbol arrangement on each render or interaction.

## Phase 3: Chevron mechanics and activation sequence

**Priority: High**

**Impact: High**

**Feasibility: High**

### Current gap

The existing chevrons illuminate in sequence, which provides a useful
activation cue. However, the movement is limited, so the chevrons do not
convincingly communicate physical engagement or locking.

### Recommended improvements

1.  Make each chevron look like a physical mechanical component attached
    to the gate.
2.  Give each chevron a short, believable engagement movement, such as a
    forward press followed by a return or locking motion.
3.  Synchronize the mechanical movement with its illumination.
4.  Use a consistent sequence and rhythm for the chevrons.
5.  Make each activation visually distinct without relying only on
    stronger glow.
6.  Give the final chevron a clearly identifiable locking moment.
7.  Ensure the full sequence communicates dialing, engagement, and
    readiness to open.
8.  Coordinate the sequence with the final position of the rotating
    ring.
9.  Prevent overlapping or conflicting activation sequences when the
    user changes destinations.

### Intended result

The chevrons should feel like mechanical locks engaging one by one, not
ordinary interface elements being highlighted.

The final lock should provide a clear visual signal that the gate is
ready to activate.

### Technical direction

Use SVG transforms and GSAP timelines for controlled mechanical movement
and lighting.

Prioritize convincing movement, timing, and physical attachment over
extra sparks, excessive glow, or decorative effects.

## Phase 4: Event horizon and portal activation

**Priority: High**

**Impact: High**

**Feasibility: Medium**

### Current gap

The center of the existing gate remains a dark logo hub. There is no
visible event horizon, which is one of the most recognizable and
important elements of the Stargate experience.

### Recommended improvements

1.  Introduce a visible portal surface inside the gate.
2.  Keep the event horizon hidden or inactive until the final chevron
    has locked.
3.  Reveal the event horizon as part of a distinct activation moment.
4.  Create a liquid energy surface with convincing depth, ripples,
    reflections, and movement.
5.  Use restrained displacement and turbulence to avoid a flat gradient
    or generic glowing circle.
6.  Make the portal surface fit naturally within the inner opening of
    the gate.
7.  Coordinate the event horizon with the surrounding ring and chevron
    lighting.
8.  Make the portal visually dominant once activated, without allowing
    the logo to compete with it.
9.  Consider the visual behavior of the portal during activation,
    travel, and arrival.

### Intended result

The center should visibly become an active portal rather than remain a
static dark area.

The event horizon should feel integrated into the gate and should
clearly respond to the activation sequence.

### Technical direction

Start with an SVG implementation using clipping, masks, gradients, and
restrained displacement or turbulence effects. This may be sufficient
for a mostly front facing view.

Consider a custom WebGL shader if SVG effects cannot deliver the desired
fluid depth, reflections, or surface movement.

Do not add a separate rendering system without a clear visual need. If
the portal and starfield eventually move to WebGL, consider a shared,
managed renderer to avoid unnecessary independent canvases, layering
problems, or lifecycle conflicts.

## Phase 5: Dialing, activation, hyperspace, and arrival choreography

**Priority: High**

**Impact: High**

**Feasibility: Medium**

### Current gap

The existing starfield communicates movement and travel, and the wheel
and starfield already animate. However, the complete sequence does not
yet read as a clearly staged journey from dialing through portal
activation to arrival.

The main issue is the relationship and timing between the individual
effects.

### Recommended improvements

Coordinate the experience as a sequence of distinct, connected stages:

1.  **Destination selection:** Acknowledge the selected destination and
    establish the intended direction of travel.
2.  **Dialing:** Rotate the inner ring toward the selected glyph or
    address position.
3.  **Ring settlement:** Make the ring decelerate and settle precisely
    into its final position.
4.  **Chevron engagement:** Activate the chevrons in sequence, with
    visible mechanical locking movement.
5.  **Final lock:** Clearly communicate that the gate has completed
    dialing.
6.  **Portal activation:** Reveal and activate the event horizon.
7.  **Environmental reaction:** Coordinate portal energy, lighting, and
    the starfield.
8.  **Travel:** Accelerate the surrounding starfield and create a
    convincing sense of movement through the portal.
9.  **Arrival:** Decelerate the motion and reveal the selected
    destination.
10. **Destination state:** Present the destination clearly and ensure
    the navigation remains usable.

### Recommended animation approach

1.  Use one GSAP master timeline to coordinate the major stages.
2.  Keep the existing shared Canvas starfield renderer unless there is a
    demonstrated reason to replace it.
3.  Make the individual animations serve the same sequence rather than
    compete for attention.
4.  Use deliberate easing and timing for mechanical movement,
    activation, acceleration, and arrival.
5.  Make the sequence feel cinematic without becoming unnecessarily
    long.
6.  Avoid triggering multiple conflicting timelines when the user
    changes destinations.
7.  Provide a coherent return or inbound transition, adapting direction
    and deceleration while retaining the same visual language.
8.  Ensure that cancellation, interruption, and repeated navigation
    cannot leave the gate in an inconsistent visual state.

### Intended result

The user should perceive a complete journey rather than a wheel
animation followed by a starfield effect.

The mechanical dialing, chevron locking, event horizon, travel, and
destination reveal should feel like parts of one continuous experience.

### Technical direction

GSAP should coordinate the overall sequence. SVG can handle the gate
geometry and mechanical animation. The existing Canvas can continue
rendering the starfield.

Use Three.js or custom shaders selectively if a specific visual
requirement cannot be achieved to the required standard with the current
rendering approach.

## Phase 6: Scroll and click navigation

**Priority: High**

**Impact: High**

**Feasibility: Medium**

### Current gap

The existing mouse wheel handler advances discretely between
destinations. It does not make the ring rotation track scroll progress
continuously.

This differs from an interaction where scrolling physically turns the
gate and then settles on a destination.

### Recommended improvements

1.  Use one shared navigation model for mouse wheel input, trackpad
    input, keyboard input, and direct destination clicks.
2.  Map accumulated scroll movement to the target rotation of the inner
    ring.
3.  Make the ring respond progressively to scroll input where practical.
4.  Introduce momentum and controlled deceleration.
5.  Snap the ring to the nearest valid destination position when the
    user stops scrolling.
6.  Ensure each destination corresponds to a stable ring position.
7.  Allow clicking a destination to target the same ring position
    directly.
8.  Keep the active destination label synchronized with the selected
    ring position.
9.  Keep the selected glyph and relevant chevron state synchronized with
    navigation.
10. Prevent accidental multiple transitions from rapid wheel events.
11. Define how navigation behaves while the gate is dialing, activating,
    travelling, or arriving.
12. Keep keyboard navigation accessible and consistent with the same
    destination model.

### Intended result

Scrolling should feel like physically turning the gate rather than
pressing a next or previous button.

Clicking and scrolling should lead to the same destination state and use
the same dialing and activation experience.

### Technical direction

Use a shared navigation controller that owns the target angle, active
destination, selected glyph, and transition state.

GSAP can animate the ring toward the target angle and handle snapping.
Avoid separate, competing navigation logic for wheel and click
interactions.

## Phase 7: Destination functionality and integration

**Priority: Dependent on available URLs and services**

**Impact: High**

**Feasibility: Dependent on external systems**

### Current gap

The existing destinations are intentionally marked as Coming Soon where
actual URLs or integrations are unavailable.

This is appropriate for a prototype, but placeholder destinations do not
fulfil the operational purpose of the portal.

### Recommended improvements

1.  Preserve the five existing destinations:
    -   Onboarding.
    -   Projects.
    -   BICSI.
    -   Webmail.
    -   Payment Portal.
2.  Preserve the Customer, Client, and Technician choices under
    Onboarding.
3.  Connect each destination to its correct supplied URL or working
    application when those details are available.
4.  Confirm whether each destination should open internally, in a new
    tab, or through an external authentication flow.
5.  Do not invent URLs, credentials, integrations, or service behavior.
6.  Keep unavailable destinations clearly identified as unavailable or
    Coming Soon.
7.  Avoid presenting a placeholder as a working service.
8.  Test each actual destination and its expected navigation behavior
    once connected.

### Intended result

The portal should ultimately serve as a working gateway to the intended
services, not only as a visual navigation prototype.

## Phase 8: Responsive behavior, accessibility, and verification

**Priority: High before completion**

**Impact: High**

**Feasibility: High**

### Current verification gap

The implementation includes responsive and reduced motion
considerations, but these behaviors have not been confirmed across
devices in the browser.

A successful production build does not prove that the visual experience,
interactions, and animations work correctly at runtime.

### Recommended improvements and checks

1.  Verify the complete portal in an actual browser at desktop, laptop,
    tablet, and mobile viewport sizes.
2.  Confirm that the gate remains legible and proportionate at different
    sizes.
3.  Confirm that glyphs, chevrons, and the event horizon do not become
    clipped or distorted.
4.  Test mouse wheel and trackpad behavior.
5.  Test direct destination clicks.
6.  Test keyboard navigation and visible focus states.
7.  Test reduced motion behavior.
8.  Check animation performance and avoid unnecessary rendering work.
9.  Check for console errors, failed assets, and animation conflicts.
10. Test rapid repeated input and navigation during transitions.
11. Confirm that the application can recover cleanly from interrupted or
    completed transitions.
12. Verify that all destination states remain synchronized with the
    gate.
13. Test the actual production build as well as the development preview.

### Completion standard

Do not consider a phase complete merely because the code compiles or the
production build passes.

A phase should be considered complete only when:

-   The intended visual result is visible in the browser.
-   The relevant interactions work as expected.
-   Existing functionality has not been unintentionally broken.
-   The implementation has been checked at relevant viewport sizes.
-   There are no known critical runtime errors.
-   The result has been compared against the original brief and this
    roadmap.

## Technology recommendations

Use the simplest technology that can achieve the required visual
quality.

### SVG

Use SVG for:

-   Stargate ring geometry.
-   Stationary and rotating mechanical layers.
-   Glyph artwork and positioning.
-   Chevron construction.
-   Vector masks and clipping.
-   Crisp rendering at different viewport sizes.

### GSAP

Use GSAP for:

-   Inner ring rotation and settling.
-   Chevron engagement and illumination.
-   Coordinated activation sequences.
-   Master timeline orchestration.
-   Scroll driven rotation and snapping.
-   Travel and arrival choreography.
-   Consistent animation state management.

### Canvas

Preserve the existing shared Canvas starfield renderer unless there is a
clear technical reason to change it.

Use it for ambient space effects, star movement, acceleration, and the
sense of travel.

### SVG filters and shader effects

Start with SVG masks, gradients, and restrained displacement or
turbulence for the event horizon.

Move to a custom WebGL shader only if the required surface quality
cannot be achieved convincingly with SVG.

### Three.js

Three.js is optional, not a default requirement.

Consider it only if the final visual direction requires meaningful
camera movement, perspective, dimensional geometry, or more advanced 3D
portal effects.

Avoid adding rendering complexity without a specific benefit.

## General implementation rules for Codex

These rules apply to every phase.

1.  Read the original project brief and this roadmap before making
    changes.
2.  Inspect the existing code and understand how the relevant components
    work before editing them.
3.  Treat the original brief as the primary requirements document and
    this file as the improvement roadmap.
4.  Work through the roadmap in priority order, one phase at a time.
5.  Before implementing a phase, explain briefly what currently exists,
    what needs to change, and the intended technical approach.
6.  Do not modify unrelated pages, components, or application
    functionality.
7.  Do not replace the existing project with a new implementation.
8.  Preserve working functionality, existing destinations, supplied
    assets, and the established visual direction unless a change is
    necessary to meet the brief.
9.  Avoid unnecessary dependencies and unnecessary rewrites.
10. Do not substitute generic glow, gradients, particles, or decorative
    effects for convincing mechanical construction and meaningful
    animation.
11. Do not claim that an interaction or visual effect works without
    verifying it in the browser.
12. Do not treat a successful build as proof that the experience is
    complete.
13. After each phase, run the application and verify the result in the
    browser.
14. Report what changed, what was verified, what remains incomplete, and
    any known limitations.
15. Stop after completing each phase and wait for approval before
    proceeding to the next phase.
16. If a requirement is ambiguous, identify the ambiguity and ask for
    clarification rather than inventing behavior.
17. If a technical limitation prevents the intended result, explain the
    limitation and propose alternatives before making a major
    architectural change.

## Recommended execution order

  -----------------------------------------------------------------------
  Order                   Phase                   Main deliverable
  ----------------------- ----------------------- -----------------------
  1                       Mechanical construction A more recognizable and
                                                  physically coherent
                                                  Stargate

  2                       Glyph system            A deliberate, stable
                                                  glyph set and accurate
                                                  ring alignment

  3                       Chevron mechanics       Visible mechanical
                                                  engagement and
                                                  sequential locking

  4                       Event horizon           An animated portal
                                                  surface inside the gate

  5                       Hyperspace choreography A coordinated dialing,
                                                  activation, travel, and
                                                  arrival sequence

  6                       Navigation              Shared scroll and click
                                                  navigation with
                                                  rotation and snapping

  7                       Destination integration Working links and
                                                  services when the
                                                  required details are
                                                  available

  8                       Verification            Browser tested visual
                                                  quality, functionality,
                                                  responsiveness, and
                                                  accessibility
  -----------------------------------------------------------------------

## First instruction to Codex

Read the original project brief and this IMPROVEMENTS.md file in full.

Inspect the existing implementation and identify how the current SVG
wheel, glyph track, chevrons, Canvas starfield, GSAP animations, and
navigation are structured.

Treat the original brief as the primary source of requirements and this
document as the improvement roadmap.

Start with Phase 1 only: Mechanical construction and Stargate visual
accuracy.

Before changing files, briefly explain what you found in the current
implementation and what you intend to change for Phase 1.

Implement only Phase 1. Preserve existing functionality and avoid
unrelated changes.

After implementation, run the application and verify the result in the
browser. Compare the visual result against the original brief and the
Phase 1 requirements in this document.

Report what changed, what was verified, and anything that remains
incomplete.

Stop after Phase 1 and wait for my review and approval before proceeding
to Phase 2.

Do not implement the entire roadmap in one pass.

## Additional visual refinement: Inner-page readability and iconography

Apply these refinements to the inner destination pages and navigation
UI:

-   **Background blur and content readability:** On inner pages, blur
    and visually subdue the Stargate and space background substantially
    so the page content remains fully readable. The background should be
    barely visible through the blur. Keep the active destination label,
    selected ring segment, and relevant navigation details noticeably
    sharper and more visible than the background.
-   **Space-style iconography:** Introduce a consistent set of
    space-inspired icons where they improve clarity or navigation. Keep
    icons purposeful, restrained, and visually consistent with the
    Stargate aesthetic. Do not add decorative icons where they do not
    help the interface.

These refinements must preserve clear content hierarchy and must not
reduce text contrast or accessibility.
