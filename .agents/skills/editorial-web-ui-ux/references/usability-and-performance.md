# Usability, Accessibility, and Performance

Use these rules when defining actions, controls, forms, semantic structure,
keyboard behavior, media loading, or performance tradeoffs.

## Contents

1. Actions and controls
2. Usability
3. Accessibility
4. Performance

## 1. Actions and controls

- Distinguish primary and secondary actions.
- Prefer text links for low-priority navigation.
- Use icon-only controls only when the icon is widely understood.
- Give icon-only controls accessible labels.
- Keep interactive targets large enough for touch.
- Avoid turning every link into a rounded pill.
- Keep keyboard focus visible.
- Make disabled states understandable.

## 2. Usability

- Make the page purpose understandable within the first screen.
- Keep navigation, forms, and controls predictable.
- Provide clear feedback after interactions.
- Avoid hidden essential content and unexplained symbols.
- Keep forms short and labels explicit.
- Place errors near the affected field.
- Preserve entered data after validation errors.
- Provide clear success states.
- Keep the mobile reading order logical.
- Do not sacrifice readability for aesthetic minimalism.

## 3. Accessibility

- Preserve semantic heading order.
- Provide alternative text for meaningful images.
- Mark decorative images appropriately.
- Maintain sufficient contrast.
- Do not communicate meaning through color alone.
- Support keyboard navigation.
- Respect reduced-motion preferences.
- Avoid flashing and rapidly changing content.
- Use descriptive link labels.
- Keep layouts usable when text is enlarged.
- Avoid embedding essential text inside images.
- Keep essential information available without hover or animation.

## 4. Performance

- Optimize large images and use responsive sizes.
- Avoid full-resolution media when thumbnails are sufficient.
- Define media dimensions to prevent layout shifts.
- Lazy-load noncritical media.
- Limit large background videos and autoplay media.
- Prefer CSS for simple effects.
- Use animation libraries only when the required effect justifies them and the
  project already supports them or the user approves a dependency.
- Keep the first visual experience fast.
- Prevent decorative effects from blocking interaction.
- Reduce media and motion cost on mobile devices.
