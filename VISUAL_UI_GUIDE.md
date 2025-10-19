# Visual UI Guide - Error Management System

## Main Compare Page

```
┌─────────────────────────────────────────────────────────────────────┐
│ Breadcrumbs: Transformers > Inspections > Compare                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─── Transformer Details Card (Purple Gradient) ───────────┐      │
│  │  ⚡ Transformer ABC123                                     │      │
│  │  ID: 123 • Type: Distribution                             │      │
│  │  [Pole: P1] [Region: North] [Type: Distribution]          │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                       │
│  ┌───────────────────┐  ┌────────────────────────────────────┐     │
│  │ BASELINE IMAGE    │  │ MAINTENANCE IMAGE  (1/3)           │     │
│  │ ┌───────────────┐ │  │ ┌───────────────┐  [+ Add Error]  │     │
│  │ │               │ │  │ │    ┌────┐     │  [◀] [▶]        │     │
│  │ │               │ │  │ │    │ #1 │     │                  │     │
│  │ │   (No boxes)  │ │  │ │    └────┘     │                  │     │
│  │ │               │ │  │ │    ┌────┐     │                  │     │
│  │ │               │ │  │ │    │ #2 │     │                  │     │
│  │ └───────────────┘ │  │ └───────────────┘                  │     │
│  │ [AI: Disabled]    │  │ [AI: Done] [Faulty]                │     │
│  └───────────────────┘  └────────────────────────────────────┘     │
│                                                                       │
│  ┌─── Detected Errors ──────────────────────────────────────┐      │
│  │                                                            │      │
│  │  ┌────────────────────────────────────────────────────┐  │      │
│  │  │ [#1] [Faulty] [Hotspot] [Conf 95%] [Manual] 🔴     │  │      │
│  │  │ box • cx=450, cy=300, w=100, h=80                  │  │      │
│  │  │ [🔍] [✏️] [🗑️]                                      │  │      │
│  │  │ 💬 "Requires immediate attention"                   │  │      │
│  │  └────────────────────────────────────────────────────┘  │      │
│  │                                                            │      │
│  │  ┌────────────────────────────────────────────────────┐  │      │
│  │  │ [#2] [Potential] [Corrosion] [Conf 75%] 🟡         │  │      │
│  │  │ box • cx=550, cy=400, w=80, h=80                   │  │      │
│  │  │ [🔍] [✏️] [🗑️]                                      │  │      │
│  │  └────────────────────────────────────────────────────┘  │      │
│  │                                                            │      │
│  │  ┌────────────────────────────────────────────────────┐  │      │
│  │  │ [#3] [DELETED] [Faulty] [Leak] 🔴 (faded)          │  │      │
│  │  │ box • cx=350, cy=250, w=60, h=60                   │  │      │
│  │  │ Deleted on Oct 19, 2025 3:45 PM                    │  │      │
│  │  └────────────────────────────────────────────────────┘  │      │
│  │                                                            │      │
│  └────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Add Error Dialog (ErrorDrawDialog)

```
┌────────────────────────────────────────────────────────┐
│ Draw New Error                               [X]       │
├────────────────────────────────────────────────────────┤
│ Click and drag on the image to draw a rectangle       │
│                                                         │
│  ┌─────────────────────────────────────────────┐      │
│  │  ╔═══════════════════════════════╗           │      │
│  │  ║  Image with crosshair cursor  ║  [🔄]     │      │
│  │  ║                                ║           │      │
│  │  ║      ╔═══════════╗             ║  (Zoom)   │      │
│  │  ║      ║  Dragging ║  ← Dashed   ║  [➖][➕] │      │
│  │  ║      ║  Box here ║             ║  [↻]      │      │
│  │  ║      ╚═══════════╝             ║           │      │
│  │  ║                                ║  (Reset)  │      │
│  │  ╚═══════════════════════════════╝           │      │
│  └─────────────────────────────────────────────┘      │
│                                                         │
│  Status:        [Faulty ▼]                             │
│  Type/Label:    [Hotspot____________]                  │
│  Confidence:    [0.95___]                              │
│  Comment:       ┌─────────────────────┐                │
│                 │ Add notes here...   │                │
│                 └─────────────────────┘                │
│                                                         │
│                    [Cancel]  [Save Error]              │
└────────────────────────────────────────────────────────┘
```

---

## Edit Properties Dialog (ErrorEditDialog)

```
┌────────────────────────────────────────────────────────┐
│ Edit Error #1                                [X]       │
├────────────────────────────────────────────────────────┤
│  [Manual]                                              │
│                                                         │
│  Position:                                             │
│  Center: (450, 300) • Size: 100 × 80                   │
│                                                         │
│  Status:        [Potential ▼]         ← Changed        │
│  Type/Label:    [Hotspot____________]                  │
│  Confidence:    [0.95___]                              │
│  Comment:       ┌─────────────────────┐                │
│                 │ Updated comment     │                │
│                 └─────────────────────┘                │
│                                                         │
│  Created: Oct 19, 2025 2:30 PM                         │
│  Last modified: Oct 19, 2025 3:15 PM                   │
│                                                         │
│                    [Cancel]  [Save Changes]            │
└────────────────────────────────────────────────────────┘
```

---

## Edit Box Dialog (ErrorBoxEditDialog) - NEW! 🆕

```
┌──────────────────────────────────────────────────────────────┐
│ Edit Error Box #1                                  [X]       │
├──────────────────────────────────────────────────────────────┤
│ Drag the box to reposition, or drag handles to resize.      │
│ Click inside to move, or grab corners/edges to resize.      │
│                                                               │
│  ┌────────────────────────────────────────────────┐         │
│  │  ╔══════════════════════════════════╗           │         │
│  │  ║  Image with movable error box    ║  [🔄]     │         │
│  │  ║                                   ║           │         │
│  │  ║     ■──────────────────■          ║           │         │
│  │  ║     │  ← Drag handles  │          ║  (Reset)  │         │
│  │  ║     │                  │          ║           │         │
│  │  ║     │   #1  ← Badge    │          ║           │         │
│  │  ║     │                  │          ║           │         │
│  │  ║     │   Click to drag→ │          ║           │         │
│  │  ║     ■──────────────────■          ║           │         │
│  │  ║       ▲              ▲            ║           │         │
│  │  ║    Resize         Resize          ║           │         │
│  │  ║    handles        handles         ║           │         │
│  │  ╚══════════════════════════════════╝           │         │
│  └────────────────────────────────────────────────┘         │
│                                                               │
│  Center: (450, 300)  •  Size: 100 × 80  ← Live update       │
│                                                               │
│  Status:        [Faulty ▼]                                   │
│  Type/Label:    [Hotspot____________]                        │
│  Confidence:    [0.95___]                                    │
│  Comment:       ┌─────────────────────┐                      │
│                 │ Notes...            │                      │
│                 └─────────────────────┘                      │
│                                                               │
│                    [Cancel]  [Save Changes]                  │
└──────────────────────────────────────────────────────────────┘
```

### Interactive Features:

- **8 Resize Handles**: 4 corners + 4 edges
- **Drag to Move**: Click inside box and drag
- **Cursor Changes**:
  - `move` when over box
  - `nw-resize`, `ne-resize`, etc. when over handles
- **Visual Feedback**:
  - Box color matches status (red/yellow)
  - Semi-transparent fill
  - White center dot shows center point
- **Real-time Coordinates**: Updates as you drag

---

## Button Actions on Error List

```
┌──────────────────────────────────────────────────────┐
│ [#1] [Faulty] [Hotspot] [Conf 95%] [Manual] 🔴      │
│ box • cx=450, cy=300, w=100, h=80                    │
│ [🔍 Edit Box]  [✏️ Edit Props]  [🗑️ Delete]         │
│                                                       │
│    ↓              ↓                 ↓                 │
│    Opens      Opens             Soft               │
│    ErrorBox   Error           Deletes             │
│    Edit       Edit            Error               │
│    Dialog     Dialog                              │
│    (Full      (Quick                              │
│     editor)   edit)                               │
└──────────────────────────────────────────────────────┘
```

---

## Cursor States in Edit Box Dialog

```
┌─────────────────────────────────────────┐
│  Cursor over different areas:           │
│                                          │
│     nw-resize                            │
│       ↖                                  │
│      ■──n-resize──■                      │
│      │            │                      │
│  w-resize   move   e-resize              │
│      │            │                      │
│      ■──s-resize──■                      │
│                  ↘                       │
│              se-resize                   │
│                                          │
│  Outside box: default (arrow)            │
└─────────────────────────────────────────┘
```

---

## Error Box Rendering on Image

```
┌─────────────────────────────────────────┐
│  Maintenance Image                      │
│                                          │
│      ┏━━━━━━━━━━━━┓  ← Red box          │
│      ┃ ⭕ #1      ┃     (Faulty)        │
│      ┃            ┃     Numbered        │
│      ┗━━━━━━━━━━━━┛     badge           │
│                                          │
│      ┏━━━━━━━┓  ← Yellow box             │
│      ┃ ⭕ #2 ┃     (Potential)           │
│      ┗━━━━━━━┛                           │
│                                          │
│  (Error #3 not shown - deleted)          │
│                                          │
│  [AI: Done] [Faulty]                     │
└─────────────────────────────────────────┘
```

---

## Status Flow Diagram

```
User Action             UI Response                Backend Call
─────────────────────────────────────────────────────────────────
Click [+ Add Error]
                   →    ErrorDrawDialog opens
                        (shows image)
Draw rectangle
                   →    Rectangle appears
                        (dashed line)
Fill form
                   →    Form validation
Click [Save]
                   →    Show loading...        →  POST /api/.../errors
                   ←    Success message        ←  201 { id, ... }
                        Error appears on image
                        Error in list


Click [🔍 Edit Box]
                   →    ErrorBoxEditDialog opens
                        (shows image + box)
Drag box
                   →    Box moves in real-time
                        Coordinates update
Drag handle
                   →    Box resizes
                        Size updates
Click [Save]
                   →    Show loading...        →  PUT /api/.../errors/:id
                   ←    Success message        ←  200 { updated }
                        Box updates on image


Click [🗑️ Delete]
                   →    Confirm action
                        Show loading...        →  DELETE /api/.../errors/:id
                   ←    Warning message        ←  200 { deleted }
                        Box removed from image
                        Error grayed in list
```

---

## Color Coding

### Status Colors

- 🔴 **Red** = FAULTY
- 🟡 **Yellow** = POTENTIAL
- 🟢 **Green** = NORMAL

### UI Element Colors

- **Blue** = Active error (list background)
- **Red tint** = Deleted error (list background)
- **Purple** = Transformer header gradient
- **Gray** = Baseline (no AI analysis)

### Button Colors

- 🔵 **Primary** (Edit Box) = Blue
- ⚫ **Default** (Edit Props) = Gray
- 🔴 **Error** (Delete) = Red

---

## Responsive Behavior

### Desktop (>1200px)

```
┌────────────────┬────────────────┐
│   Baseline     │  Maintenance   │
│   Image        │  Image         │
│   (400x300)    │  (400x300)     │
└────────────────┴────────────────┘
       Error List (full width)
```

### Tablet (768-1200px)

```
┌────────────────┬────────────────┐
│   Baseline     │  Maintenance   │
│   (300x225)    │  (300x225)     │
└────────────────┴────────────────┘
       Error List (full width)
```

### Mobile (<768px)

```
┌────────────────┐
│   Baseline     │
│   (100% width) │
└────────────────┘
┌────────────────┐
│  Maintenance   │
│   (100% width) │
└────────────────┘
  Error List
  (full width)
```

---

## Loading States

### While Saving

```
[🔍 Edit Box]  → becomes → [⏳ Saving...]
Success: "Error updated and saved successfully" ✓
Error:   "Failed to save error to server" ✗
```

### While Loading Page

```
─────────────────────
    Loading...
─────────────────────
↓
Images appear
↓
AI analysis starts
↓
[AI: Running] ⏳
↓
Boxes appear
↓
[AI: Done] ✓
```

---

## Error States Display

### Active Error

```
┌──────────────────────────────────────┐
│ [#1] [Faulty] [Hotspot] [95%] 🔴    │ ← Full opacity
│ box • cx=450, cy=300, w=100, h=80    │
│ [🔍] [✏️] [🗑️]                       │ ← Buttons visible
│ 💬 "Comment text"                     │
└──────────────────────────────────────┘
```

### Deleted Error

```
┌──────────────────────────────────────┐
│ [#3] [DELETED] [Faulty] [Leak] 🔴   │ ← 60% opacity
│ box • cx=350, cy=250, w=60, h=60     │   Red tint
│ (No buttons)                          │   Dashed border
│ Deleted on Oct 19, 2025 3:45 PM      │
└──────────────────────────────────────┘
```

---

**Legend:**

- `┌─┐ └─┘` = Container borders
- `╔═╗ ╚═╝` = Image/canvas areas
- `[Button]` = Clickable buttons
- `🔍 ✏️ 🗑️` = Action icons
- `⭕` = Error badge number
- `→ ←` = Data flow direction
- `↓` = Process step
