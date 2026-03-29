# Design System Specification (UE/UI)

## 1. Overview
This document defines the unified User Experience (UE) and User Interface (UI) standards for the SSQ-Predict platform, specifically aligning the "Smart Prediction" and "Traditional Numerology" modules.

## 2. Interaction Principles
*   **Consistency**: Similar actions must yield similar results across modules.
*   **Feedback**: System status must be visible (loading states, success messages, error alerts).
*   **Efficiency**: Minimize clicks for primary actions (e.g., selecting algorithms and predicting).
*   **Responsiveness**: Layouts must adapt gracefully to mobile, tablet, and desktop.

## 3. Color System
Based on the Tailwind configuration, we enforce the following usage:

| Color Name | Variable | Usage |
| :--- | :--- | :--- |
| **Primary** | `hsl(var(--primary))` | Main actions, active states, key brand elements. |
| **Secondary** | `hsl(var(--secondary))` | Backgrounds for less important elements, hover states. |
| **Ball Red** | `hsl(var(--ball-red))` | Red lottery balls, hot numbers. |
| **Ball Blue** | `hsl(var(--ball-blue))` | Blue lottery balls. |
| **Success** | `hsl(var(--success))` | High confidence scores, positive outcomes. |
| **Warning** | `hsl(var(--warning))` | Medium confidence, caution alerts. |
| **Destructive** | `hsl(var(--destructive))` | Errors, critical warnings. |
| **Muted** | `hsl(var(--muted))` | Secondary text, disabled states. |

**Gradient Standard**:
*   **Headings**: `bg-gradient-to-r from-primary to-purple-500` (or unified brand gradient).
*   **Cards**: Subtle gradients `from-card to-primary/5`.

## 4. Typography
*   **Font Family**: `Inter` (Sans), `JetBrains Mono` (Numbers/Code).
*   **Page Title**: `text-4xl font-bold tracking-tight`.
*   **Section Title**: `text-2xl font-bold` with Icon.
*   **Body Text**: `text-base` or `text-sm` for dense information.

## 5. Component Standards

### 5.1 Buttons
*   **Primary Action**: `Button` (size="lg", rounded="full") with Icon.
*   **Secondary Action**: `Button` (variant="outline" or "ghost").
*   **Loading State**: Must replace icon with `RefreshCw` spin animation.

### 5.2 Algorithm Selection Cards
*   **Container**: `Card` or `div` with border.
*   **State**:
    *   *Default*: `border-muted bg-card`.
    *   *Hover*: `border-primary/50 bg-secondary/50`.
    *   *Selected*: `border-primary bg-primary/5 shadow-sm`.
*   **Content**: Icon (left/top), Title (bold), Description (muted, small).
*   **Interaction**: Click whole card to toggle.

### 5.3 Lottery Balls
*   **Animation**: `framer-motion` spring animation on entry.
*   **Shape**: Perfect circle (`rounded-full`).
*   **Shadow**: `shadow-lg`.
*   **Size**: Responsive (`w-12 h-12` mobile, `w-16 h-16` desktop).
*   **Font**: `font-mono font-bold`.

### 5.4 Charts
*   **Library**: `recharts`.
*   **Responsive**: Always wrap in `ResponsiveContainer`.
*   **Colors**: Use CSS variables for fills/strokes to match theme.

## 6. Layout Structure
1.  **Page Header**: Title + Icon + Description (Centered).
2.  **Configuration Panel**: Card containing inputs/selectors.
3.  **Action Area**: Centered primary button.
4.  **Results Area**:
    *   Main Numbers (Prominent).
    *   Details/Charts (Grid layout).

## 7. Responsive Rules
*   **Grid**: `grid-cols-1` (Mobile) -> `md:grid-cols-2` -> `lg:grid-cols-3`.
*   **Spacing**: `space-y-6` (Mobile) -> `space-y-10` (Desktop).
*   **Padding**: `p-4` (Mobile) -> `p-8` (Desktop).
