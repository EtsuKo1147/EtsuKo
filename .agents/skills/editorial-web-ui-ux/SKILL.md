---
name: editorial-web-ui-ux
description: >
  Apply editorial and art-directed visual principles to portfolios, creative
  studios, architecture, fashion, photography, cultural, and premium brand
  websites. Use when planning, reviewing, or implementing magazine-inspired
  layouts with asymmetric composition, strong typography, image-led
  storytelling, intentional whitespace, responsive transformation, and
  restrained motion. This skill supplies visual-design constraints and does
  not by itself authorize code or file changes.
---

# Editorial Web UI/UX

Apply a coherent editorial visual language without sacrificing clarity,
accessibility, responsive behavior, or performance.

## 1. Role and authority

Treat this skill as a visual-direction layer.

- Use it to decide how an editorial website should look and behave.
- Do not use it to decide whether file changes are authorized.
- When `ui-ux-discussion` is active, discuss and plan without writing code or
  modifying files.
- When `ui-ux-implementation` is active and the user has approved
  implementation, apply these rules through minimal, project-appropriate
  changes.
- When a design judgment depends on rendered appearance, inspect the live page
  with the Browser skill before relying only on source-code analysis.
- Reuse an accessible existing local preview or a local URL supplied by the
  user.
- If no usable preview can be reached, start exactly one development server
  with the project's existing development script without requesting additional
  permission.
- Treat local preview as read-only inspection. Do not modify source files,
  configuration, assets, package files, or lockfiles unless implementation is
  explicitly authorized.
- Stop only the server process started for the current analysis. Never stop a
  server that was already running.
- Respect explicit user constraints and existing project rules above this
  skill.
- Do not force an editorial treatment onto data-heavy tools, complex
  administration systems, dense forms, or accessibility-critical public
  services when it reduces usability.

## 2. Design goal

Create an experience that feels:

- Art-directed rather than template-generated
- Minimal but not empty
- Expressive but not chaotic
- Experimental but still usable
- Premium but not generic
- Structured but not rigid

Make layout, typography, imagery, interaction, and motion support the content
and user journey. Do not treat editorial styling as decoration alone.

## 3. Constraint priority

Resolve conflicts in this order:

1. Content clarity
2. Usability and accessibility
3. Responsive behavior
4. Visual hierarchy
5. Brand expression
6. Motion and decoration

Remove novelty when users cannot identify what is clickable, where they are,
or what to do next. Remove motion when it delays access to content or actions.

## 4. Working process

When the design direction is not yet approved:

1. Identify the audience, primary user goal, primary action, content types,
   available imagery, brand tone, and technical constraints.
2. Classify content as primary, secondary, supporting, or optional.
3. Define page structure, navigation, section order, and user flow.
4. Establish the grid, spacing logic, typography roles, color palette, image
   direction, interaction principles, and motion budget.
5. Assign each section a density and one focal element.
6. Define desktop composition, tablet transformation, mobile reading order,
   image cropping, motion, and reduced-motion behavior.
7. Validate usability, accessibility, responsive behavior, and performance.
8. Remove elements that do not support content, hierarchy, navigation, brand,
   or usability.

When the user has already approved a direction:

- Do not restart a full design exercise.
- Inspect only the relevant project context.
- Confirm the smallest implementation boundary.
- Preserve the approved hierarchy and editorial intent.
- Implement structure before complex motion.
- Do not add unrequested pages, sections, dependencies, or decorative systems.

## 5. Cross-system contract

Design typography, imagery, page rhythm, responsive behavior, and motion as one
system.

For every major section, define:

- Purpose
- Density: sparse, balanced, dense, immersive, or transitional
- One focal element
- One layout pattern
- Limited typography roles
- Explicit image roles and ratios
- Desktop, tablet, and mobile transformation
- One motion pattern or an explicit no-motion decision
- Reduced-motion behavior

Do not consider a complex section complete when one of these decisions is
missing.

## 6. Responsive baseline

Use a hybrid responsive system.

- Treat a large editorial composition as one visual stage.
- When the design baseline is `1920 × 1080`, scale the desktop and laptop stage
  continuously instead of creating separate designs for 14-inch and 16-inch
  screens.
- Make large images, frames, decorative elements, internal spacing, offsets,
  hover movement, and stage-bound motion share the same scale logic.
- Scale display typography within readable minimum and maximum limits.
- Keep body text and interface labels readable rather than preserving a
  screenshot-perfect ratio.
- Use breakpoints mainly for structural changes such as desktop-to-tablet or
  tablet-to-mobile transformation.
- Reorder, stack, simplify, or remove nonessential offsets on mobile.
- Preserve content priority and semantic reading order instead of desktop
  coordinates.
- Avoid using `vw` independently on every element.

Do not scale only the dominant image while leaving secondary cards, labels,
buttons, arrows, padding, or motion distances on unrelated sizing rules.

## 7. Reference routing

Read only the references needed for the current task:

- Read [layout-and-rhythm.md](references/layout-and-rhythm.md) for information
  architecture, grids, asymmetry, whitespace, navigation, heroes, content
  modules, and section rhythm.
- Read
  [typography-images-color.md](references/typography-images-color.md) for type
  roles, scale, image roles, cropping, visual weight, and palette decisions.
- Read [responsive-and-motion.md](references/responsive-and-motion.md) for
  continuous stage scaling, structural breakpoints, interaction, motion
  budgets, touch behavior, and reduced motion.
- Read
  [usability-and-performance.md](references/usability-and-performance.md) for
  actions, forms, keyboard access, contrast, semantic structure, media loading,
  and performance.
- Read [review-checklist.md](references/review-checklist.md) before presenting a
  complete design proposal or finishing an implementation.

For a full-page design or full-page review, read all five references.

## 8. Design proposal output

When the user requests a complete design proposal, provide:

1. Design concept and intended feeling
2. Target audience, primary user goal, and primary action
3. Information architecture and section list
4. Page rhythm map
5. Grid, typography, image, and color systems
6. Section-by-section specifications
7. Responsive transformation plan
8. Motion budget and reduced-motion behavior
9. Accessibility and performance considerations
10. Explanation of major design decisions

Scale the output to the request. Do not produce the full list for a small,
single-section question.

## 9. Implementation contract

When implementation is explicitly authorized:

- Follow the existing framework, component structure, styling approach, and
  animation utilities.
- Use semantic HTML and preserve logical DOM reading order.
- Reuse components where repetition is real, without forcing every section into
  one template.
- Preserve asymmetric composition through stable layout primitives.
- Avoid absolute positioning for essential content unless a responsive fallback
  exists.
- Define media dimensions to prevent layout shift.
- Include visible hover, focus, active, and disabled states where relevant.
- Provide touch-friendly equivalents for hover behavior.
- Respect reduced-motion preferences.
- Prefer simple CSS motion when an animation library is unnecessary.
- Avoid placeholder content that changes the intended composition.

## 10. Core anti-template rules

Do not automatically add centered gradient heroes, pill navigation, repeated
rounded cards, uniform feature grids, glassmorphism, decorative blobs, fake
logos, unnecessary badges, generic stock imagery, or identical section
spacing.

Require every major visual element to support at least one of:

- Content
- Brand
- Hierarchy
- Navigation
- User journey
- Interaction clarity

Remove an element when it supports none of them.

## 11. Final decision rule

Before presenting or finishing work, verify that:

- Each major section has one clear focal point.
- The composition remains understandable without animation.
- Asymmetry follows visible alignment relationships.
- Dense and quiet sections create intentional rhythm.
- Typography and imagery have clear roles.
- Desktop and laptop proportions scale coherently.
- Tablet and mobile layouts preserve content priority.
- Essential information does not depend on hover.
- Navigation and actions remain predictable.
- Motion remains restrained and optional.
- The result does not resemble a generic AI landing-page template.

Revise the weak area before adding more decoration.
