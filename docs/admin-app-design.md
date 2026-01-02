# Admin App Design Document

## Overview

A modern, minimalist admin application for managing the multi-site multi-niche affiliate platform. Each user owns and manages their own sites through a clean, intuitive interface.

---

## Design Philosophy

### Aesthetic Direction
- **Modern Minimalist**: Clean layouts with generous white space
- **Professional**: Neutral color palette with purposeful accent colors
- **Functional**: Every element serves a purpose
- **Consistent**: Unified patterns across all pages

### Color System

```
Background:     #ffffff (white)
Surface:        #fafafa (gray-50)
Border:         #e5e5e5 (gray-200)
Text Primary:   #171717 (gray-900)
Text Secondary: #737373 (gray-500)
Text Muted:     #a3a3a3 (gray-400)

Primary:        #2563eb (blue-600)
Primary Hover:  #1d4ed8 (blue-700)
Primary Light:  #eff6ff (blue-50)

Success:        #16a34a (green-600)
Warning:        #ca8a04 (yellow-600)
Danger:         #dc2626 (red-600)
Info:           #0891b2 (cyan-600)
```

### Typography

```
Font Family:    Inter (system fallback: -apple-system, system-ui)
Font Sizes:
  - xs:   12px / 16px line-height
  - sm:   14px / 20px line-height
  - base: 16px / 24px line-height
  - lg:   18px / 28px line-height
  - xl:   20px / 28px line-height
  - 2xl:  24px / 32px line-height
  - 3xl:  30px / 36px line-height

Font Weights:
  - Regular: 400 (body text)
  - Medium:  500 (labels, emphasis)
  - Semibold: 600 (headings, buttons)
  - Bold:    700 (page titles)
```

### Spacing Scale

```
0:   0px
1:   4px
2:   8px
3:   12px
4:   16px
5:   20px
6:   24px
8:   32px
10:  40px
12:  48px
16:  64px
20:  80px
```

### Border Radius

```
none:   0px
sm:     4px   (badges, small elements)
base:   6px   (buttons, inputs)
md:     8px   (cards)
lg:     12px  (modals, panels)
xl:     16px  (large cards)
full:   9999px (avatars, pills)
```

### Shadows

```
sm:    0 1px 2px 0 rgb(0 0 0 / 0.05)
base:  0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)
md:    0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)
lg:    0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)
```

---

## Layout Structure

### Overall Layout

```
+------------------+----------------------------------------+
|                  |              Header                    |
|                  +----------------------------------------+
|     Sidebar      |                                        |
|    (240px)       |              Main Content              |
|                  |              (flexible)                |
|                  |                                        |
|                  |                                        |
+------------------+----------------------------------------+
```

### Sidebar (240px width)

```
+------------------+
|  [Logo]  Admin   |  <- Logo + Brand (h: 64px)
+------------------+
|  [v] Site Name   |  <- Site Selector dropdown
+------------------+
|                  |
|  Dashboard       |  <- Navigation items
|  Products        |
|  Articles        |
|  Categories      |
|  Media           |
|  Settings        |
|                  |
+------------------+
|  [Avatar] User   |  <- User menu (bottom)
|  admin@email.com |
+------------------+
```

#### Sidebar States
- **Expanded**: 240px with full labels
- **Collapsed**: 64px with icons only (optional for desktop)
- **Mobile**: Full-screen overlay with backdrop

### Header (64px height)

```
+--------------------------------------------------------------------+
|  Breadcrumbs                            [Search] [?] [Notifications]|
|  Dashboard > Products > Edit Product                               |
+--------------------------------------------------------------------+
```

### Content Area

```
+--------------------------------------------------------------------+
|  Page Header                                                        |
|  +----------------------------------------------------------------+ |
|  | [Back] Title                              [Secondary] [Primary]| |
|  | Description text                                               | |
|  +----------------------------------------------------------------+ |
|                                                                    |
|  Content Cards / Tables / Forms                                    |
|  +----------------------------------------------------------------+ |
|  |                                                                | |
|  |                                                                | |
|  +----------------------------------------------------------------+ |
+--------------------------------------------------------------------+
```

---

## Page Designs

### 1. Login Page

**Layout**: Centered card on subtle gradient background

```
+--------------------------------------------------------------------+
|                                                                    |
|                      +------------------------+                    |
|                      |      [Logo]            |                    |
|                      |      Admin Portal      |                    |
|                      |                        |                    |
|                      |  Email                 |                    |
|                      |  [________________]    |                    |
|                      |                        |                    |
|                      |  Password              |                    |
|                      |  [________________]    |                    |
|                      |                        |                    |
|                      |  [   Sign In     ]     |                    |
|                      |                        |                    |
|                      |  Forgot password?      |                    |
|                      +------------------------+                    |
|                                                                    |
+--------------------------------------------------------------------+
```

**Details**:
- Card: white bg, shadow-lg, rounded-xl, max-w-md
- Logo: 40px, centered
- Inputs: 48px height, gray border, focus:blue ring
- Button: Primary blue, full width, 48px height
- Link: text-sm, gray-500, hover:blue

---

### 2. Dashboard

**Layout**: Welcome message + Stats grid + Quick actions + Recent activity

```
+--------------------------------------------------------------------+
|  Welcome back, Brandon                               December 2024 |
|  Here's what's happening with your sites                          |
+--------------------------------------------------------------------+
|                                                                    |
|  +------------+  +------------+  +------------+  +------------+   |
|  | Products   |  | Articles   |  | Published  |  | Drafts     |   |
|  |    124     |  |     45     |  |    156     |  |     13     |   |
|  | +5 today   |  | +2 today   |  | 93%        |  | 7%         |   |
|  +------------+  +------------+  +------------+  +------------+   |
|                                                                    |
|  Quick Actions                                                     |
|  +--------------------+  +--------------------+  +--------------+  |
|  | [+] New Product    |  | [+] New Article    |  | [^] Upload   |  |
|  +--------------------+  +--------------------+  +--------------+  |
|                                                                    |
|  Recent Activity                                                   |
|  +----------------------------------------------------------------+|
|  | [Avatar] Brandon updated "Gaming Mouse XYZ"      2 minutes ago ||
|  | [Avatar] Brandon published "Best GPUs 2024"      1 hour ago    ||
|  | [Avatar] Brandon created "Wireless Headset"      3 hours ago   ||
|  +----------------------------------------------------------------+|
+--------------------------------------------------------------------+
```

**Stat Card Design**:
- White background, rounded-lg, border
- Icon with colored background (primary-50)
- Large number (2xl, semibold)
- Label (sm, gray-500)
- Trend indicator (sm, green/red)

---

### 3. Products List

**Layout**: Page header + Toolbar + Data table

```
+--------------------------------------------------------------------+
|  Products                                        [+ New Product]   |
|  Manage your product catalog                                       |
+--------------------------------------------------------------------+
|                                                                    |
|  +----------------------------------------------------------------+|
|  | [Search...          ]  Status [All v]  Category [All v]  [Grid]||
|  +----------------------------------------------------------------+|
|  +----------------------------------------------------------------+|
|  | [ ] Image  Title           Category    Status    Rating  ...   ||
|  +----------------------------------------------------------------+|
|  | [ ] [img]  Gaming Mouse    Peripherals  Published  4.8   [...] ||
|  | [ ] [img]  Mechanical KB   Peripherals  Draft      -     [...] ||
|  | [ ] [img]  Gaming Chair    Furniture    Published  4.5   [...] ||
|  | [ ] [img]  Monitor 27"     Displays     Archived   4.2   [...] ||
|  +----------------------------------------------------------------+|
|  | Showing 1-10 of 124 products        [<] [1] [2] [3] ... [>]    ||
|  +----------------------------------------------------------------+|
+--------------------------------------------------------------------+
```

**Table Row Design**:
- Row height: 64px
- Checkbox: 16px
- Image: 48x36px, rounded-md, object-cover
- Title: medium weight, truncate
- Status badges: pill style, colored
- Actions: dropdown with Edit, View, Duplicate, Delete

**Status Badge Colors**:
- Draft: gray-100 bg, gray-700 text
- Published: green-100 bg, green-700 text
- Archived: amber-100 bg, amber-700 text

---

### 4. Product Edit

**Layout**: Header with actions + Tabbed form

```
+--------------------------------------------------------------------+
|  [<] Gaming Mouse Pro X                                            |
|                                      [Save Draft] [Preview] [Publish]|
+--------------------------------------------------------------------+
|                                                                    |
|  +-------+--------+-----+---------+                                |
|  |Content| Pricing| SEO | Settings|                                |
|  +-------+--------+-----+---------+                                |
|                                                                    |
|  Title *                                                           |
|  +----------------------------------------------------------------+|
|  | Gaming Mouse Pro X                                             ||
|  +----------------------------------------------------------------+|
|                                                                    |
|  Slug                                                              |
|  +----------------------------------------------------------------+|
|  | gaming-mouse-pro-x                                  [Generate] ||
|  +----------------------------------------------------------------+|
|                                                                    |
|  Excerpt                                                           |
|  +----------------------------------------------------------------+|
|  | Professional gaming mouse with...                              ||
|  +----------------------------------------------------------------+|
|                                                                    |
|  Content                                                           |
|  +----------------------------------------------------------------+|
|  | [B][I][H2][H3][UL][OL]["][Link][Img][Shortcode]                ||
|  +----------------------------------------------------------------+|
|  | [Rich text editor content area...]                             ||
|  |                                                                ||
|  |                                                                ||
|  +----------------------------------------------------------------+|
|                                                                    |
|  Featured Image                                                    |
|  +------------------------+                                        |
|  |   [Upload or drag]     |  [Change] [Remove]                     |
|  |   [image preview]      |                                        |
|  +------------------------+                                        |
+--------------------------------------------------------------------+
```

**Form Field Design**:
- Label: sm, medium weight, gray-700
- Input: 44px height, border, rounded-md
- Focus: blue ring (ring-2 ring-blue-500)
- Error: red border, error message below
- Required: asterisk in red

**Tab Design**:
- Underline style tabs
- Active: blue text, blue underline
- Inactive: gray-500, no underline
- Hover: gray-700

---

### 5. Rich Text Editor

**Toolbar Layout**:

```
+--------------------------------------------------------------------+
| [B] [I] [S] | [H2] [H3] | [UL] [OL] | ["] [Code] | [Link] [Img] [SC]|
+--------------------------------------------------------------------+
```

**Toolbar Button Design**:
- Size: 32x32px
- Background: transparent
- Hover: gray-100
- Active: blue-100, blue icon
- Border radius: 4px
- Grouped with subtle separators

**Shortcode Button**:
- Opens popover with options:
  - Insert Product
  - Insert Products (by category)
  - Insert Comparison

**Shortcode Display in Editor**:
```
+--------------------------------------------------------------------+
| [Product: Gaming Mouse Pro X]                              [x] [Edit]|
+--------------------------------------------------------------------+
```
- Blue-50 background
- Rounded-lg
- Shows product name
- Edit/remove icons on hover

---

### 6. Media Library

**Layout**: Grid of media items with upload area

```
+--------------------------------------------------------------------+
|  Media Library                                        [Upload Files]|
|  Manage your images and files                                      |
+--------------------------------------------------------------------+
|                                                                    |
|  +----------------------------------------------------------------+|
|  |  +--+--+--+  or drag and drop files here                       ||
|  |  [Upload]    Supports: JPG, PNG, GIF, WEBP (max 10MB)         ||
|  +----------------------------------------------------------------+|
|                                                                    |
|  [Search...]  Type [All v]  Sort [Newest v]                        |
|                                                                    |
|  +--------+  +--------+  +--------+  +--------+  +--------+       |
|  |  [img] |  |  [img] |  |  [img] |  |  [img] |  |  [img] |       |
|  |        |  |        |  |        |  |        |  |        |       |
|  | name   |  | name   |  | name   |  | name   |  | name   |       |
|  | 1.2MB  |  | 800KB  |  | 2.1MB  |  | 500KB  |  | 1.8MB  |       |
|  +--------+  +--------+  +--------+  +--------+  +--------+       |
+--------------------------------------------------------------------+
```

**Media Card Design**:
- Square aspect ratio
- Image: object-cover
- Overlay on hover with actions
- Name truncated, size below
- Selection checkbox top-left

---

### 7. Site Selector

**Dropdown Design**:

```
+------------------------+
| [v] The Gaming Hub     |
+------------------------+
        |
        v
+------------------------+
| Your Sites             |
+------------------------+
| [G] The Gaming Hub   v |  <- Current (checkmark)
| [T] TechFlow           |
| [H] Home Essentials    |
+------------------------+
| [+] Add New Site       |  <- Admin only
+------------------------+
```

**Site Item Design**:
- Avatar: First letter, colored background
- Name: medium weight
- Checkmark for current selection

---

### 8. User Management (Admin Only)

**Layout**: Similar to products list

```
+--------------------------------------------------------------------+
|  Users                                              [+ Invite User] |
|  Manage platform users and site access                             |
+--------------------------------------------------------------------+
|                                                                    |
|  +----------------------------------------------------------------+|
|  | Avatar  Name            Email             Role    Sites  Status||
|  +----------------------------------------------------------------+|
|  | [BR]    Brandon Obias   brandon@...       Admin   3     Active ||
|  | [JD]    Jane Doe        jane@...          Owner   2     Active ||
|  | [MS]    Mike Smith      mike@...          Owner   1     Inactive||
|  +----------------------------------------------------------------+|
+--------------------------------------------------------------------+
```

**User Edit Page**:
- Basic info (name, email, avatar)
- Role selector (Admin/Owner)
- Site assignment (multi-select)
- Status toggle
- Password reset button

---

## Component Specifications

### Button Variants

```tsx
// Primary
bg-blue-600 text-white hover:bg-blue-700
shadow-sm active:shadow-none

// Secondary
bg-white text-gray-700 border border-gray-300
hover:bg-gray-50

// Ghost
bg-transparent text-gray-700
hover:bg-gray-100

// Danger
bg-red-600 text-white hover:bg-red-700

// Sizes
sm:  h-8  px-3 text-sm
md:  h-10 px-4 text-sm
lg:  h-12 px-6 text-base
```

### Input Fields

```tsx
// Default
h-10 px-3 border border-gray-300 rounded-md
focus:ring-2 focus:ring-blue-500 focus:border-blue-500
placeholder:text-gray-400

// Error
border-red-500 focus:ring-red-500

// Disabled
bg-gray-50 text-gray-500 cursor-not-allowed
```

### Cards

```tsx
// Default Card
bg-white rounded-lg border border-gray-200 shadow-sm

// Interactive Card
hover:shadow-md hover:border-gray-300 transition-all

// Selected Card
ring-2 ring-blue-500
```

### Badges

```tsx
// Pill style
px-2.5 py-0.5 text-xs font-medium rounded-full

// Status colors
draft:     bg-gray-100 text-gray-700
published: bg-green-100 text-green-700
archived:  bg-amber-100 text-amber-700
```

### Tables

```tsx
// Header
bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase

// Row
border-b border-gray-200 hover:bg-gray-50

// Cell
px-6 py-4 text-sm text-gray-900
```

---

## Responsive Breakpoints

```
sm:  640px   (mobile landscape)
md:  768px   (tablet)
lg:  1024px  (desktop)
xl:  1280px  (large desktop)
2xl: 1536px  (extra large)
```

### Mobile Adaptations

1. **Sidebar**: Hidden by default, hamburger menu to open
2. **Tables**: Horizontal scroll or card view
3. **Forms**: Stack all fields vertically
4. **Buttons**: Full width on mobile
5. **Modals**: Full screen on mobile

---

## Icons

Using **Lucide React** for consistent iconography.

**Common Icons**:
- Navigation: Home, Package, FileText, FolderOpen, Image, Settings
- Actions: Plus, Pencil, Trash2, Copy, Eye, EyeOff
- Status: Check, X, AlertCircle, Info, Clock
- Media: Upload, Download, ExternalLink
- UI: ChevronDown, ChevronRight, Search, Menu, X

---

## Animation & Transitions

```css
/* Default transition */
transition-all duration-200 ease-in-out

/* Fade in */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up */
@keyframes slideUp {
  from { transform: translateY(8px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Scale in (modals) */
@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

---

## Accessibility Guidelines

1. **Focus States**: Visible focus rings on all interactive elements
2. **Color Contrast**: Minimum 4.5:1 for text, 3:1 for UI components
3. **Keyboard Navigation**: All actions accessible via keyboard
4. **ARIA Labels**: Descriptive labels for icons and actions
5. **Form Errors**: Associated with fields via aria-describedby
6. **Screen Reader**: Proper heading hierarchy, skip links

---

## Dark Mode (Future)

Reserved for future implementation. Variables prepared:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --text-primary: #171717;
  --text-secondary: #737373;
}

.dark {
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --text-primary: #fafafa;
  --text-secondary: #a3a3a3;
}
```

---

## File Structure Reference

```
apps/admin/
├── app/
│   ├── globals.css          # Tailwind + custom styles
│   ├── layout.tsx           # Root layout
│   ├── (auth)/              # Auth pages (no sidebar)
│   └── (dashboard)/         # Dashboard pages (with sidebar)
├── components/
│   ├── layout/              # Sidebar, Header, etc.
│   ├── forms/               # Form components
│   ├── editor/              # Rich editor
│   └── data-tables/         # Table components
└── lib/
    ├── auth.ts              # Auth config
    └── validations/         # Zod schemas
```
