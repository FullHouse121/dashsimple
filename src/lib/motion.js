// Motion, as a small set of decisions rather than a number typed at each site.
//
// The dashboard had 222 animated components and no shared vocabulary: eleven
// used 0.6s, nine used 0.5s, sixteen used 0.2s, and list items staggered at
// `idx * 0.08` — which means the twentieth row of a list waits 1.6 seconds
// before it appears.
//
// It also spent that budget in the wrong place. Panels faded in over 600ms on
// a page load nobody is waiting on, while the registry tables — pixels,
// domains, accounts — had no animation at all. Adding a row made it appear
// instantly and removing one made every row below it jump up in a single
// frame. That snap is what reads as something crashing: the eye sees a jump
// it cannot follow, so it reads as breakage rather than as movement.
//
// Two rules follow from that:
//   1. The closer a change is to something the user just did, the faster it
//      resolves. A row they deleted should be gone in ~160ms; a panel they
//      never asked for can take 300ms.
//   2. Anything that changes position gets animated, or it snaps.

// One easing everywhere: a decelerating curve that starts fast and settles.
export const EASE = [0.22, 1, 0.36, 1];

export const DURATION = {
  // Direct feedback — a row entering or leaving, a chip toggling.
  instant: 0.16,
  // Menus, popovers, anything summoned by a click.
  quick: 0.2,
  // Section and panel entrances.
  settle: 0.3,
};

// Panels: one transition, applied the same way everywhere.
export const panelIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.settle, ease: EASE },
};

// Rows in a mutable list.
//
// `layout` is what stops the snap: when a row is removed, framer measures the
// survivors' old and new positions and animates between them instead of
// letting the browser jump. Paired with AnimatePresence mode="popLayout", the
// exiting row leaves the flow immediately so the others start moving at once
// rather than after it finishes fading.
export const rowMotion = {
  layout: true,
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: DURATION.instant, ease: EASE },
};

// A stagger that cannot run away.
//
// `idx * 0.08` is fine for four cards and absurd for forty rows. This keeps
// the cascade but caps the total, so the last item of a long list is never
// more than `max` behind the first.
export const stagger = (index, step = 0.05, max = 0.24) =>
  Math.min(index * step, max);

// Cards and tiles that appear as a group.
export const cardIn = (index) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.settle, delay: stagger(index), ease: EASE },
});
