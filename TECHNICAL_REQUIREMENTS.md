# Technical Requirements — Interactive Portal Website

## Implementation approach

Inspect the existing repository before choosing or changing the stack. Preserve its established framework, conventions, dependencies and build setup where practical.

If this is a new project with no existing application, the preferred starting point is:

- React
- TypeScript
- Vite
- Tailwind CSS, if useful for the project
- GSAP for the primary animation system
- CSS and SVG for the wheel geometry and interface graphics
- Lucide icons only where icons materially improve clarity

Do not replace an existing working stack simply to match this suggested list.

## Animation architecture

### Primary engine: GSAP

Use GSAP as the primary engine for coordinated motion, including:
- Continuous wheel and ring rotation.
- Different rotation rates and directions for layered elements.
- Hover, focus and selection responses.
- The hyperdrive departure sequence.
- Transition timing and final navigation.

Use GSAP timelines to choreograph the transition as a coherent sequence. Define reusable animation functions and keep animation responsibilities organised.

### Motion library

Do not add Framer Motion / Motion by default. GSAP can handle the full experience. Add a second animation library only if a specific requirement justifies it and the responsibilities do not overlap unnecessarily.

### Three.js / WebGL

Do not introduce Three.js by default. First determine whether CSS, SVG and GSAP can achieve the required visual quality.

Consider Three.js only if the approved direction genuinely requires real-time 3D geometry, camera movement, shader effects or other capabilities that cannot be achieved cleanly with the simpler approach. Explain the benefit and added complexity before introducing it.

## Wheel implementation

- Build the wheel from real interface elements, CSS and/or SVG.
- Do not use a single static screenshot or flattened image as the interactive wheel.
- Keep navigation labels and controls accessible and independently interactive.
- Separate decorative rotating geometry from readable navigation controls where needed.
- Keep the wheel geometry responsive.
- Ensure rotation does not make labels unreadable or controls difficult to select.
- Avoid unnecessary DOM complexity and expensive per-frame React state updates.

## Navigation and interaction

Implement the two primary destinations:
- Onboarding, with Customer, Client and Technician choices.
- Payment Portal.

Keep destination URLs in a central configuration rather than scattering them throughout components.

Use temporary routes or clearly labelled placeholders until the client supplies final URLs. Do not invent external URLs.

Interaction requirements:
- Support mouse, touch and keyboard input.
- Provide visible focus states.
- Prevent multiple transition sequences from starting simultaneously.
- Prevent accidental repeated navigation while a transition is running.
- Ensure the destination is communicated before departure.
- Handle missing or unavailable destination URLs gracefully.
- Ensure browser navigation behaves sensibly.

## Accessibility

- Use semantic buttons or links for interactive destinations.
- Provide accessible names for controls.
- Maintain sufficient text and control contrast.
- Support keyboard navigation.
- Respect `prefers-reduced-motion`.
- Provide a reduced-motion path that does not depend on a long animation to complete navigation.
- Do not communicate selection using animation or brightness alone.

## Performance

- Prefer transforms and opacity for animation.
- Avoid unnecessary layout-triggering animation.
- Keep continuous motion subtle and efficient.
- Avoid large, unnecessary video or texture assets.
- Optimise images and other assets.
- Avoid excessive blur, filters and particle effects, especially on mobile.
- Test performance on a representative mobile device or throttled profile where practical.

## Code quality

- Use clear component boundaries and descriptive names.
- Keep destination configuration separate from presentation.
- Keep animation setup and cleanup explicit.
- Clean up GSAP timelines, event listeners and other side effects when components unmount.
- Avoid unnecessary dependencies and abstractions.
- Do not add unrelated features or refactor unrelated production code.
- Do not leave broken links, dead controls or misleading placeholder functionality.

## Suggested component boundaries

Adapt these to the existing repository rather than creating unnecessary files:

- `PortalPage` — page composition.
- `PortalWheel` — wheel structure and navigation controls.
- `WheelRing` — reusable ring or mechanical layer, if useful.
- `DestinationSelector` — onboarding and payment destination selection.
- `HyperdriveTransition` — coordinated transition experience.
- `destinationConfig` — destination labels, options and URLs.

## Verification

Perform only relevant, proportionate verification:
- Run the project's existing build or typecheck commands where available.
- Check the wheel at desktop and mobile breakpoints.
- Verify all destinations and interaction states.
- Verify that the transition cannot be triggered repeatedly while active.
- Verify keyboard navigation and reduced-motion behaviour.
- Check browser console errors and obvious animation or layout issues.

Do not introduce a large test suite or unrelated refactors for this initial visual experience.

## Decisions requiring client input

Keep these configurable or use clearly identified placeholders until confirmed:
- Final logo and brand assets.
- Final Onboarding URL or whether Customer, Client and Technician each have separate URLs.
- Final Payment Portal URL.
- Whether the portal should open in the same tab or a new tab.
- Whether the client has a preferred reference for the wheel or hyperdrive effect.
