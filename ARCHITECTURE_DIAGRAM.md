# Error Management System Architecture

## Component Structure

```
ComparePage
├── ErrorDrawDialog (Add new errors)
├── ErrorEditDialog (Edit existing errors)
├── ZoomableImageWithBoxes (Display errors on image)
└── AIFaultList (Display error list)
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         ComparePage                              │
│                                                                   │
│  State:                                                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ boxesById: { imageId: [error1, error2, ...] }          │   │
│  │ drawDialogOpen: boolean                                  │   │
│  │ editDialogOpen: boolean                                  │   │
│  │ selectedErrorIndex: number                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │                    User Actions                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│    [Add Error]         [Edit Error]        [Delete Error]       │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────────┐   │
│  │ ErrorDraw   │    │ ErrorEdit    │    │ handleDelete    │   │
│  │ Dialog      │    │ Dialog       │    │ Error()         │   │
│  └─────────────┘    └──────────────┘    └─────────────────┘   │
│         │                    │                    │              │
│         ▼                    ▼                    ▼              │
│  handleAddError()   handleSaveEditedError()   Mark deleted      │
│         │                    │                    │              │
│         └────────────────────┴────────────────────┘              │
│                              │                                    │
│                              ▼                                    │
│                 Update boxesById state                           │
│                              │                                    │
│         ┌────────────────────┴────────────────────┐             │
│         ▼                                          ▼             │
│  ┌──────────────────┐                    ┌─────────────────┐   │
│  │ Zoomable Image   │                    │  AIFaultList    │   │
│  │ WithBoxes        │                    │  Component      │   │
│  │                  │                    │                 │   │
│  │ • Renders boxes  │                    │ • Lists errors  │   │
│  │ • Skips deleted  │                    │ • Shows all     │   │
│  │ • Shows numbers  │                    │ • Edit/Delete   │   │
│  └──────────────────┘                    └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Error Object Lifecycle

```
1. CREATION (AI or Manual)
   ↓
   ┌─────────────────────────────┐
   │ New Error Object            │
   │ {                           │
   │   cx, cy, w, h              │
   │   status: "FAULTY"          │
   │   label: "Hotspot"          │
   │   comment: ""               │
   │   isManual: true/false      │
   │   timestamp: ISO date       │
   │ }                           │
   └─────────────────────────────┘
   ↓
2. ACTIVE STATE
   ├─ Visible on image ✅
   ├─ Visible in list ✅
   ├─ Can be edited ✅
   └─ Can be deleted ✅
   ↓
   ┌─────────────────────┐
   │   User edits error  │
   └─────────────────────┘
   ↓
3. MODIFIED STATE
   ├─ Properties updated
   ├─ lastModified: ISO date
   └─ Still active
   ↓
   ┌─────────────────────┐
   │  User deletes error │
   └─────────────────────┘
   ↓
4. DELETED STATE
   ├─ isDeleted: true
   ├─ deletedAt: ISO date
   ├─ Not visible on image ❌
   ├─ Visible in list (grayed) ✅
   └─ Cannot be edited ❌
```

## User Interaction Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User on Compare Page                       │
└──────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ View Errors  │    │ Add Error    │    │ Manage       │
│ on Image     │    │              │    │ Errors       │
└──────────────┘    └──────────────┘    └──────────────┘
        │                   │                     │
        │                   │            ┌────────┴────────┐
        │                   │            │                 │
        │                   ▼            ▼                 ▼
        │          ┌─────────────┐  ┌────────┐    ┌──────────┐
        │          │ Click "Add  │  │ Edit   │    │ Delete   │
        │          │ Error" btn  │  │ Error  │    │ Error    │
        │          └─────────────┘  └────────┘    └──────────┘
        │                   │            │              │
        │                   ▼            │              │
        │          ┌─────────────────┐   │              │
        │          │ Draw rectangle  │   │              │
        │          │ on canvas       │   │              │
        │          └─────────────────┘   │              │
        │                   │            │              │
        │                   ▼            │              │
        │          ┌─────────────────┐   │              │
        │          │ Fill in form:   │   │              │
        │          │ • Status        │   │              │
        │          │ • Label         │   │              │
        │          │ • Confidence    │   │              │
        │          │ • Comment       │   │              │
        │          └─────────────────┘   │              │
        │                   │            │              │
        │                   ▼            ▼              ▼
        │          ┌──────────────────────────────────────┐
        │          │      Update boxesById state          │
        │          └──────────────────────────────────────┘
        │                            │
        └────────────────────────────┼────────────────────┘
                                     │
                                     ▼
                          ┌────────────────────┐
                          │   UI Re-renders    │
                          │                    │
                          │ • Image overlays   │
                          │ • Error list       │
                          │ • Status badges    │
                          └────────────────────┘
```

## Error Rendering Logic

```
For each error in boxesById[currentImageId]:

┌─────────────────────┐
│ Check isDeleted     │
└─────────────────────┘
         │
    ┌────┴────┐
    ▼         ▼
  true      false
    │         │
    │         └──→ ┌──────────────────────┐
    │              │ Render on Image:     │
    │              │ • Draw box/point     │
    │              │ • Add number badge   │
    │              │ • Apply colors       │
    │              └──────────────────────┘
    │
    └──→ ┌──────────────────────┐
         │ Skip image render    │
         └──────────────────────┘
              │
         Always render in list
              │
              ▼
      ┌─────────────────┐
      │ List Appearance │
      └─────────────────┘
              │
    ┌─────────┴─────────┐
    ▼                   ▼
 Deleted             Active
    │                   │
    ├─ Red tint        ├─ Blue tint
    ├─ 60% opacity     ├─ 100% opacity
    ├─ Dashed border   ├─ Solid border
    ├─ "DELETED" badge ├─ Status badges
    └─ No buttons      └─ Edit/Delete btns
```

## State Updates

```
Add Error:
┌────────────────────────────────────────────┐
│ Current State:                             │
│ boxesById = {                              │
│   "img123": [error1, error2]              │
│ }                                          │
└────────────────────────────────────────────┘
                   │
                   ▼ handleAddError(newError)
┌────────────────────────────────────────────┐
│ New State:                                 │
│ boxesById = {                              │
│   "img123": [error1, error2, newError]    │
│ }                                          │
└────────────────────────────────────────────┘

Edit Error:
┌────────────────────────────────────────────┐
│ Current State:                             │
│ boxesById["img123"][1] = {                │
│   status: "FAULTY",                       │
│   comment: "Old comment"                  │
│ }                                          │
└────────────────────────────────────────────┘
                   │
                   ▼ handleSaveEditedError(updated)
┌────────────────────────────────────────────┐
│ New State:                                 │
│ boxesById["img123"][1] = {                │
│   status: "POTENTIAL",                    │
│   comment: "New comment",                 │
│   lastModified: "2025-10-19T..."          │
│ }                                          │
└────────────────────────────────────────────┘

Delete Error:
┌────────────────────────────────────────────┐
│ Current State:                             │
│ boxesById["img123"][0] = {                │
│   status: "FAULTY",                       │
│   isDeleted: undefined                    │
│ }                                          │
└────────────────────────────────────────────┘
                   │
                   ▼ handleDeleteError(0)
┌────────────────────────────────────────────┐
│ New State:                                 │
│ boxesById["img123"][0] = {                │
│   status: "FAULTY",                       │
│   isDeleted: true,                        │
│   deletedAt: "2025-10-19T..."             │
│ }                                          │
└────────────────────────────────────────────┘
```

## Integration Points

```
┌─────────────────────────────────────────────────────────┐
│                    Backend API (Future)                  │
│                                                          │
│  POST   /api/errors          → Create new error        │
│  PUT    /api/errors/:id      → Update error            │
│  DELETE /api/errors/:id      → Soft delete error       │
│  GET    /api/errors/:imageId → Load errors for image   │
│                                                          │
└─────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Current)                    │
│                                                          │
│  State Management:    boxesById object                  │
│  Persistence:         None (in-memory only)             │
│  Sync:                Not implemented                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## File Dependencies

```
ComparePage.jsx
├── imports
│   ├── React hooks (useState, useEffect, useRef, useMemo)
│   ├── React Router (useParams, useNavigate, useLocation)
│   ├── Material-UI components
│   ├── Material-UI icons
│   ├── transformerService (API calls)
│   ├── useSnackbar hook
│   ├── ErrorDrawDialog
│   └── ErrorEditDialog
│
└── exports
    └── ComparePage (default export)

ErrorDrawDialog.jsx
├── imports
│   ├── React hooks
│   ├── Material-UI components
│   └── Material-UI icons
│
└── exports
    └── ErrorDrawDialog (default export)

ErrorEditDialog.jsx
├── imports
│   ├── React hooks
│   ├── Material-UI components
│   └── Material-UI icons
│
└── exports
    └── ErrorEditDialog (default export)
```

---

**Note**: This architecture supports future enhancements like:

- Backend persistence
- Real-time collaboration
- Undo/redo functionality
- Batch operations
- Export capabilities
