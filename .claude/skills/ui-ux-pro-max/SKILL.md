# UI/UX Pro Max - Design Intelligence

```yaml
name: ui-ux-pro-max
description: "UI/UX design intelligence for web and mobile. Includes 50+ styles, 161 color palettes, 57 font pairings, 161 product types, 99 UX guidelines, and 25 chart types across 10 stacks (React, Next.js, Vue, Svelte, SwiftUI, React Native, Flutter, Tailwind, shadcn/ui, and HTML/CSS). Actions: plan, build, create, design, implement, review, fix, improve, optimize, enhance, refactor, and check UI/UX code. Projects: website, landing page, dashboard, admin panel, e-commerce, SaaS, portfolio, blog, and mobile app. Elements: button, modal, navbar, sidebar, card, table, form, and chart. Styles: glassmorphism, claymorphism, minimalism, brutalism, neumorphism, bento grid, dark mode, responsive, skeuomorphism, and flat design. Topics: color systems, accessibility, animation, layout, typography, font pairing, spacing, interaction states, shadow, and gradient. Integrations: shadcn/ui MCP for component search and examples."
```

## Overview

This is a comprehensive design intelligence system providing recommendations across "50+ styles, 161 color palettes, 57 font pairings, 161 product types with reasoning rules, 99 UX guidelines, and 25 chart types" for multiple technology stacks.

## When to Apply

**Must use** for UI structure, visual design decisions, interaction patterns, or user experience quality control. Specifically invoke when designing new pages, creating components, choosing design systems, reviewing UI code, implementing navigation, or making product-level design decisions.

**Skip** for pure backend logic, API/database design, performance optimization unrelated to interfaces, infrastructure work, or non-visual automation.

## Priority-Based Rule Framework (1-10)

The system organizes guidance by impact level:

1. **Accessibility** (CRITICAL) — contrast ratios, keyboard navigation, alt text, ARIA labels
2. **Touch & Interaction** (CRITICAL) — minimum touch targets (44×44px), spacing, feedback
3. **Performance** (HIGH) — image optimization, lazy loading, layout shift prevention
4. **Style Selection** (HIGH) — matching product type, consistency, avoiding emoji icons
5. **Layout & Responsive** (HIGH) — mobile-first, breakpoints, viewport configuration
6. **Typography & Color** (MEDIUM) — semantic tokens, readability, dark mode support
7. **Animation** (MEDIUM) — timing (150–300ms), meaningful motion, reduced-motion support
8. **Forms & Feedback** (MEDIUM) — visible labels, error placement, validation strategies
9. **Navigation Patterns** (HIGH) — depth limits, back behavior, deep linking
10. **Charts & Data** (LOW) — accessible color schemes, legends, tooltips

## Key Implementation Guidance

### Critical Do's
- "Minimum 44×44pt interactive area" for touch targets with expanded hit areas when needed
- Use "WebP/AVIF, responsive images (srcset/sizes), lazy load non-critical assets"
- Implement "transform/opacity only; avoid animating width/height/top/left"
- "Use font-display: swap/optional to avoid invisible text"
- Maintain "4.5:1 ratio for normal text (large text 3:1)"

### Critical Don'ts
- Remove focus rings or create icon-only buttons without labels
- Rely on hover-only interactions for primary actions
- Mix flat and skeuomorphic styles randomly
- Use "custom elements as primary controls without semantics"
- Place content behind notches, status bars, or gesture areas

## Workflow

### Step 1: Analyze Requirements
Extract product type, target audience, style keywords, and technology stack.

### Step 2: Generate Design System (Required)
Execute Python script with `--design-system` flag to receive comprehensive recommendations with reasoning across domains (product, style, color, typography).

### Step 3: Supplement with Domain Searches
Run targeted searches by domain (product, style, color, typography, chart, ux, google-fonts, react, web, prompt) for deeper exploration.

### Step 4: Implement Stack-Specific Guidelines
Apply technology-specific best practices (React Native, React, Next.js, Vue, etc.).

## Search Capabilities

**Available domains:** product, style, typography, color, landing, chart, ux, google-fonts, react, web, prompt

**Available stacks:** react-native, react, next, vue, svelte, swiftui, flutter, tailwind, shadcn-ui, html-css

## App UI Quality Standards

### Visual Excellence
- Vector icons only (no emojis for structural UI)
- Consistent icon sizing, stroke width, and fill treatment
- Proper brand asset usage with official clear space
- Layout-stable pressed states without bounds shifting

### Interaction Mastery
- "Provide visual response on tap within 80-150ms"
- Semantic native controls with proper accessibility roles
- Disabled states using native attributes and reduced emphasis
- Avoid conflicting gestures in overlapping regions

### Theme Consistency
- Light and dark mode tested independently
- Maintain semantic color tokens across themes
- "Primary text contrast ≥4.5:1 in both light and dark mode"
- Modal scrims calibrated for foreground legibility

### Layout Robustness
- Safe-area compliance for fixed headers and tab bars
- 4/8dp spacing rhythm maintained across all levels
- Adaptive gutters and typography scaling by breakpoint
- No scroll content hidden behind sticky elements

## Pre-Delivery Checklist

Verify: no emoji icons, consistent icon family, official brand assets, layout-stable interactions, "touch targets meet minimum size," screen reader label accuracy, semantic theme tokens, safe-area respect, spacing rhythm adherence, light/dark mode parity, reduced-motion support, and dynamic text scaling without breakage.
