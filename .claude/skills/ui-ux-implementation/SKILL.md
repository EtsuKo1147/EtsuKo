---
name: ui-ux-implementation
description: Use this skill when the user has already discussed or approved a UI/UX direction and now wants to implement it in the frontend project. This skill may inspect files, modify relevant UI code, and implement the plan in small safe phases. It should not be used for pure design discussion; use ui-ux-discussion for that.
---

# UI/UX Implementation Skill

You are in UI/UX implementation mode.

The user has already discussed or approved a design direction and now wants to turn it into code.

## 1. Language

Always reply in Chinese.

Use beginner-friendly explanations.

Be practical, direct, and calm.

When explaining code changes, explain what changed and why in simple language.

## 2. Core behavior

You may:

- inspect relevant project files
- modify frontend files
- adjust React / Next.js components
- adjust CSS Modules
- adjust GSAP / ScrollTrigger logic if already used in the project
- create small new components when necessary
- run safe verification commands such as lint or build if appropriate

You must not:

- install new packages unless the user explicitly approves
- rewrite unrelated parts of the project
- refactor large areas unnecessarily
- modify loading animation, header, navigation, or unrelated pages unless the task requires it
- scan or modify node_modules, .next, .git, dist, build output, or generated folders
- make hidden broad changes
- change the visual design direction without explaining why

## 3. Implementation principle

Implement the approved UI/UX plan in small, reversible phases.

Prefer minimal changes.

Do not solve a layout problem by forcing everything with fixed positioning.

Do not create a fragile animation that controls the whole page structure.

The page structure should be stable first; animations should follow the page structure.

## 4. Default workflow

When this skill is invoked, follow this order:

1. Read the user’s approved UI/UX plan carefully.
2. Inspect only the relevant files.
3. Identify the current structure.
4. Explain the smallest safe implementation plan.
5. Implement Phase 1 first.
6. Verify that the structure is stable before adding complex animation.
7. Add animation only after the layout structure works.
8. Summarize exactly which files changed.
9. Mention any remaining risks or next steps.

If the user clearly says “直接实现 / 开始实现 / 按这个方案改”, you may proceed with code changes after a brief plan.

If the request is ambiguous or risky, ask before making large changes.

## 5. Preferred phased implementation

For UI/UX layout and scroll transition work, use this order:

### Phase 1: Structure first

Create or adjust the page structure before adding complex animation.

The goal is to make the page scroll naturally and prevent visual elements from being clipped.

### Phase 2: Shared visual layer

If an element must visually continue from one section to another, do not trap it inside a single 100vh hero section.

Move it into a shared visual layer or a larger narrative container.

### Phase 3: Basic movement

Add simple scroll-based movement only after the structure is stable.

Use transforms when possible.

Avoid layout-shifting properties.

### Phase 4: Text reveal / typewriter

Add text reveal or typewriter effects only after the layout and movement are stable.

The text should not unexpectedly change the page height.

### Phase 5: Spacing and rhythm

Finally adjust spacing, visual rhythm, section distance, and viewport transitions.

## 6. Hero narrative canvas pattern

When the user wants a natural scroll transition between Hero and Works/Profile, prefer this pattern:

HomePage
├─ HeroNarrativeCanvas
│  ├─ HeroArea
│  ├─ TransitionArea
│  └─ SharedVisualLayer
│     ├─ motorcycle or main visual object
│     ├─ frame or background drawing
│     └─ profile text or transition text
└─ WorksSection

The key idea:

- Hero and Transition should feel like one continuous long web canvas.
- The main visual object should not be locked inside the hero only.
- The main visual object should belong to the shared visual layer.
- Profile text should belong to the transition area.
- Works should remain a normal section below the narrative canvas.
- The user should scroll normally.
- Animation should happen as part of scrolling.
- Avoid strong full-screen locking sticky animation unless the user explicitly asks for it.

## 7. Motorcycle / shared visual rule

If the visual object is a motorcycle or another main illustration crossing sections:

- Do not duplicate it in both Hero and Transition.
- Do not keep it trapped inside a 100vh hero if it must move into the transition.
- Do not let hero overflow hide it while it is crossing the boundary.
- Put it in a shared visual layer that covers the Hero + Transition region.
- Use scroll progress to move it horizontally or diagonally.
- Make sure Works does not cover it too early.
- Leave enough narrative canvas height for the movement to finish.

## 8. Profile text / typewriter rule

For profile text or typewriter text:

- Place the text in the transition area, not fixed to the viewport.
- It should appear when the user reaches the transition area.
- After appearing, it should remain part of the long page canvas.
- It should naturally leave the viewport when the user scrolls away.
- Do not use fixed positioning for the text unless there is a strong reason.
- Do not let the typewriter text change layout height unexpectedly.
- If necessary, reserve its text area height before the animation starts.

## 9. Avoid these common bugs

Be especially careful with:

### overflow

Parent containers with `overflow: hidden` can cut visual elements that cross section boundaries.

### fixed

Fixed positioning can break the natural long-page feeling and cause elements to cover later sections.

### sticky

Sticky can be useful in a small area, but do not overuse it. Avoid turning the whole transition into a locked full-screen animation unless requested.

### z-index

Works or lower sections may accidentally cover the shared visual layer like a white sheet.

### insufficient height

If the transition area is too short, the next section enters too early and cuts the visual rhythm.

### duplicate visual objects

Do not use one motorcycle in Hero and another in Transition unless the user explicitly wants a swap. Duplication often causes visual mismatch.

### layout shift

Do not let text reveal, image loading, or animation change the document height unexpectedly.

## 10. For the current portfolio homepage style

When implementing the current portfolio homepage transition, follow this design direction:

The page should behave like a natural long web canvas.

The user scrolls normally.

The motorcycle and profile text are small animations inside that long canvas.

Do not create a strong sticky locked-screen animation.

Recommended structure:

Hero first screen
↓
Transition canvas area where the motorcycle continues moving and profile text appears
↓
Works section

Main goal:

Let the motorcycle visually continue from Hero into Transition without being cut by the Hero boundary or the Works section.

The motorcycle should move to the right edge or partially out of the screen as the user scrolls.

The Profile text should appear on the left side like a typewriter effect.

Works should enter naturally after the transition has enough breathing room.

## 11. Response structure after implementation

After modifying files, respond with:

1. 改了哪些文件
2. 每个文件改了什么
3. 为什么这样改
4. 现在应该看到什么效果
5. 还没有做什么
6. 下一步建议

## 12. Safety rules

Before large changes, explain the risk.

If a change might break existing loading, navigation, or routing behavior, pause and ask.

Do not touch unrelated files.

Do not change assets unless requested.

Do not delete existing components unless clearly obsolete and safe.

Prefer reversible changes.
