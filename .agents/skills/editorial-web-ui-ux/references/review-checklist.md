# Editorial Design Review

Read this file before presenting a complete design proposal or finishing an
implementation.

## Contents

1. Anti-template review
2. Automatic revision triggers
3. Section specification
4. Final checklist

## 1. Anti-template review

Avoid adding these patterns by default:

- Centered hero with gradient headline
- Pill-shaped navigation
- Three identical feature cards
- Repeated rounded rectangles
- Excessive glassmorphism
- Purple-blue gradients and blurred circles
- Uniform card or image grids
- Fake logos, arbitrary badges, or unnecessary pricing sections
- Generic dashboard styling on editorial sites
- Random blobs, decorative charts, or stock illustrations
- Identical spacing, ratios, and animation on every section
- Centered body paragraphs
- Multiple competing calls to action
- Excessive shadows and over-rounded containers

Keep a trend only when it supports content, brand, hierarchy, navigation, user
journey, or interaction clarity.

## 2. Automatic revision triggers

Revise before presenting when any of these occurs:

- Three consecutive sections use the same alignment.
- More than two sections use the same image/text split.
- Every image uses the same ratio.
- Mobile preserves confusing desktop overlaps.
- Essential information depends on hover.
- More than four motion patterns appear.
- Multiple large animations compete.
- Body text drops below readable limits.
- Navigation or content waits for animation.
- Every section uses the same padding or density.
- Background colors alternate mechanically.
- Decorations outnumber functional elements.
- Hierarchy is unclear without animation.
- DOM order and mobile reading order conflict.
- Contrast or focus states are insufficient.
- The result resembles a generic AI landing page.

## 3. Section specification

Use this structure when a section requires a full design definition:

```md
## Section: [Name]

Purpose:
[What this section communicates or enables]

Density:
[Sparse / Balanced / Dense / Immersive / Transitional]

Focal element:
[One dominant visual or message]

Layout type:
[Offset hero / Asymmetric grid / Split / Narrow text / Full-width visual / Indexed list / Other]

Typography:
- Primary:
- Secondary:
- Body:
- Metadata:

Images:
- Primary role and ratio:
- Supporting role and ratio:
- Crop behavior:

Desktop and laptop:
[Grid, alignment, continuous stage scaling, overlap]

Tablet:
[Structural simplification]

Mobile:
[Semantic reading order and stacking]

Motion:
[One primary pattern or explicit no-motion decision]

Reduced motion:
[Behavior without complex movement]
```

## 4. Final checklist

### Composition and rhythm

- Does each major section have one focal point?
- Does asymmetry follow visible anchors?
- Do consecutive sections vary composition and density?
- Does a visual reset appear every two or three sections?
- Is whitespace intentional?

### Typography and imagery

- Is hierarchy immediately understandable?
- Is body copy readable?
- Does every image have a role?
- Does the primary image remain dominant?
- Are ratios varied but controlled?
- Are crops safe across responsive states?

### Responsive behavior

- Do desktop and laptop stages scale as one system?
- Do text and controls remain readable?
- Does tablet simplify structure?
- Does mobile preserve semantic priority?
- Are touch interactions independent of hover?

### UX and accessibility

- Is the primary action clear?
- Is navigation predictable?
- Is the page understandable without animation?
- Are focus, contrast, labels, and keyboard behavior sufficient?
- Is reduced-motion behavior defined?

### Motion and consistency

- Are there no more than four recurring motion patterns?
- Does each section use at most one primary entrance?
- Does motion support hierarchy?
- Are color, borders, corners, shadows, and photography coherent?

### Final decision

Revise when three or more answers expose weak hierarchy, repetition, unclear
usability, or unnecessary decoration. Remove decoration before adding another
system.
