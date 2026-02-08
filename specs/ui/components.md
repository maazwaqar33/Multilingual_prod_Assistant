# Feature: UI Components

## Phase
Phase II: Full-Stack Web App

## Design System
- **Font**: Geist (Sans/Mono)
- **Primary Color**: Indigo 500 (`#6366F1`)
- **Border Radius**: `rounded-lg` (0.5rem) or `rounded-xl` (0.75rem)
- **Shadows**: `shadow-sm` for cards, `shadow-md` for hover

## Components

### 1. TaskCard
Displays a single task.
- **Props**: `task: Task`, `onComplete: (id) => void`, `onDelete: (id) => void`
- **Visuals**:
  - Background: White (light) / Gray-900 (dark)
  - Border: Gray-200 (light) / Gray-800 (dark)
  - Layout: Flex row with checkbox, content, and actions
  - Priority badge: Top right or inline
  - Tags: Bottom row
- **Interaction**:
  - Hover: Slight lift and border color change
  - Checkbox: Toggles completion state (strikethrough title)

### 2. TaskList
Container for task cards.
- **Props**: `tasks: Task[]`, `loading: boolean`
- **Visuals**:
  - Grid layout (1 col mobile, 2 col tablet, 3 col desktop)
  - Empty state illustration when no tasks
  - Loading skeleton state

### 3. TaskForm (Inline)
Input for creating tasks.
- **Props**: `onSubmit: (task) => void`
- **Visuals**:
  - Input field with minimal border
  - "Add" button with primary color
  - Expandable for details (desc, priority, tags)

### 4. PriorityBadge
Visual indicator for priority.
- **Variants**:
  - High: Red/Rose bg + text
  - Medium: Yellow/Amber bg + text
  - Low: Blue/Sky bg + text
  - None: Gray

### 5. TagPill
Small rounded badge for categories.
- **Visuals**:
  - `rounded-full`
  - `text-xs`
  - Gray or hashed color background

### 6. LangToggle
Switch between English and Urdu.
- **Visuals**:
  - Segmented control or simple button
  - Active state highlighted

## Mobile Responsiveness
- All touch targets > 44px
- Padding > 16px on edges
- Font size > 16px for inputs (prevent zoom)
