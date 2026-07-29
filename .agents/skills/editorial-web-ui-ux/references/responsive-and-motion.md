# Responsive Design and Motion

Use these rules when adapting editorial compositions across screen sizes or
defining interaction and motion.

## Contents

1. Continuous visual-stage scaling
2. Structural breakpoints
3. Interaction
4. Motion budget
5. Mobile and reduced motion

## 1. Continuous visual-stage scaling

- Start from the actual design baseline, commonly `1920 × 1080`.
- Treat visually connected desktop elements as one stage.
- Scale the stage continuously across desktop and laptop widths.
- Share the scale across large imagery, frames, cards, decorations, section
  spacing, internal padding, labels, icons, arrows, offsets, and stage-bound
  motion distances.
- Give display text readable minimum and maximum limits.
- Keep body text and interface labels independently readable.
- Clamp the stage scale so it does not become too large or too small.

Do not scale only the main card while leaving side cards, controls, labels,
padding, or hover offsets on fixed values. Avoid unrelated `vw` rules on every
element.

## 2. Structural breakpoints

Use breakpoints for genuine structural transformation rather than laptop-size
patches.

- Keep desktop and laptop composition on one continuous system where practical.
- Simplify the grid for tablet.
- Reorder and stack content by semantic priority on mobile.
- Remove decorative offsets, tiny side labels, and vertical text when they
  reduce clarity.
- Convert collages into ordered vertical sequences or controlled galleries.
- Crop images independently at each structural state.
- Replace hover dependencies with touch-friendly controls.
- Avoid accidental horizontal overflow.
- Keep important controls in comfortable touch reach.

Mobile is not a miniature desktop. Preserve content priority, not desktop
coordinates.

## 3. Interaction

- Use interaction to reinforce hierarchy and orientation.
- Keep essential information visible without hover.
- Provide equivalent touch behavior.
- Avoid precise cursor requirements, scroll hijacking, and disabled native
  scrolling.
- Keep clickable regions visually identifiable.
- Use a small recurring set of interaction patterns.

Suitable patterns include subtle image scaling, underline movement, controlled
image reveals, project preview transitions, navigation-state transitions, and
visible gallery controls.

## 4. Motion budget

Use no more than four recurring patterns:

1. Fade and translate reveal
2. Image mask reveal
3. Link or underline hover
4. Page or project transition

Use these starting ranges:

- Micro interaction: `120–200ms`
- Standard UI transition: `200–350ms`
- Section reveal: `400–700ms`
- Major page transition: `600–1000ms`
- Text translation: up to `24px`
- Standard image scale: `1.00–1.03`
- Hover image scale: up to `1.05`
- Rotation: up to `2deg` unless conceptually required
- Stagger: about `40–100ms`

- Run no more than two major motion groups simultaneously.
- Give each section one primary entrance pattern.
- Avoid word-by-word body animation.
- Avoid combining scale, rotation, blur, and translation on one element.
- Do not delay navigation, actions, or reading.
- Avoid replaying entrances every time an element re-enters the viewport.

## 5. Mobile and reduced motion

On mobile:

- Reduce translation and parallax.
- Remove cursor-dependent effects.
- Avoid long pinned sequences.
- Preserve native scrolling.

When reduced motion is requested:

- Remove parallax and scroll-linked transforms.
- Replace complex masks with immediate visibility or simple opacity.
- Keep content and navigation fully usable.
- Preserve state feedback without decorative movement.
