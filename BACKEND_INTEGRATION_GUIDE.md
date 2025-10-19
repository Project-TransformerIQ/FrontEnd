# Backend Integration & Error Box Editing - Implementation Guide

## Overview

This update adds **backend persistence** for all error management operations and introduces a new **interactive error box editor** that allows users to reposition and resize error boxes directly on the image.

## New Features

### 1. **Error Box Position/Size Editor** 🆕

A new interactive dialog (`ErrorBoxEditDialog`) that allows visual editing of error boxes:

#### Features:

- **Drag to Move**: Click inside the box and drag to reposition
- **Resize Handles**: 8 resize handles (4 corners + 4 edges)
  - Corner handles: Resize both width and height
  - Edge handles: Resize only width or height
- **Real-time Preview**: See changes as you drag
- **Reset Button**: Restore original position/size
- **Live Coordinates**: Display current center point and dimensions
- **Edit Properties**: Modify status, label, confidence, and comment in the same dialog
- **Visual Feedback**: Box color changes based on status

#### How to Access:

1. In the "Detected Errors" list, look for the **🔍 (ZoomIn)** icon
2. Click it to open the interactive editor
3. Drag the box or handles to adjust
4. Click "Save Changes" to persist

### 2. **Backend Persistence** 🆕

All error operations now save to the server:

#### API Integration:

```javascript
// Save new error
POST /api/transformers/images/{imageId}/errors
Body: { cx, cy, w, h, status, label, comment, confidence, ... }

// Update existing error
PUT /api/transformers/images/{imageId}/errors/{errorId}
Body: { cx, cy, w, h, status, label, comment, confidence, ... }

// Soft delete error
DELETE /api/transformers/images/{imageId}/errors/{errorId}

// Load errors for image
GET /api/transformers/images/{imageId}/errors
Response: [{ id, cx, cy, w, h, status, label, comment, ... }]
```

#### Error Data Structure:

```javascript
{
  id: "unique-error-id",           // Server-assigned
  cx: 450,                          // Center X (pixels)
  cy: 300,                          // Center Y (pixels)
  w: 100,                           // Width (pixels)
  h: 80,                            // Height (pixels)
  status: "FAULTY",                 // FAULTY | POTENTIAL | NORMAL
  label: "Hotspot",                 // Error type
  comment: "Requires inspection",   // User notes
  confidence: 0.95,                 // 0-1
  colorRgb: [255, 0, 0],           // [r, g, b]
  isManual: true,                   // User-added vs AI-detected
  isDeleted: false,                 // Soft delete flag
  timestamp: "2025-10-19T...",      // Creation time
  lastModified: "2025-10-19T...",   // Last edit time
  deletedAt: null,                  // Deletion time (if deleted)
  regionId: "ai-region-123"         // Original AI detection ID (if applicable)
}
```

### 3. **Enhanced Error List UI** 🔄

Updated error list with new button:

```
[#1] [Faulty] [Hotspot] [Conf 95%] [Manual] • box • cx=450, cy=300, w=100, h=80
  [🔍 Edit Box] [✏️ Edit Props] [🗑️ Delete]
```

- **🔍 Edit Box**: Opens interactive position/size editor
- **✏️ Edit Props**: Opens quick property editor (no visual editing)
- **🗑️ Delete**: Soft deletes the error

## Technical Implementation

### New Component: ErrorBoxEditDialog

**Location**: `src/components/dialogs/ErrorBoxEditDialog.jsx`

**Key Features**:

- Canvas-based interactive editing
- Mouse event handling for drag and resize
- 8 resize handles (corners + edges)
- Cursor changes based on hover position
- Constraint checking (minimum size 20px)
- Real-time rendering with visual feedback

**Event Handling**:

```javascript
handleMouseDown(e)  → Start drag/resize operation
handleMouseMove(e)  → Update box during drag/resize
handleMouseUp()     → Finalize changes
getHandle(mx, my)   → Detect which handle user clicked
getCursor(handle)   → Change cursor based on handle type
```

**Coordinate System**:

- Natural image coordinates (actual pixels)
- Canvas render coordinates (scaled for display)
- Automatic conversion between the two

### Updated Service: transformerService.js

**New API Functions**:

```javascript
saveError(imageId, errorData); // Create new error
updateError(imageId, errorId, data); // Update error
deleteError(imageId, errorId); // Delete error
getErrors(imageId); // Load all errors
```

### Updated Page: ComparePage.jsx

**New State**:

```javascript
const [boxEditDialogOpen, setBoxEditDialogOpen] = useState(false);
const [savingError, setSavingError] = useState(false);
```

**Enhanced Functions**:

```javascript
handleAddError()     → Now async, saves to backend
handleEditError()    → Opens property editor
handleEditBox()      → Opens box editor (new)
handleSaveEditedError() → Now async, saves to backend
handleDeleteError()  → Now async, saves to backend
loadDetections()     → Loads both AI detections + user errors
```

**Data Flow**:

1. User modifies error → Handler called
2. `setSavingError(true)` → Show loading state
3. API call to backend → Persist changes
4. Update local state → Reflect changes in UI
5. `setSavingError(false)` → Hide loading state
6. Show success/error message

## User Workflows

### Workflow 1: Adjust Error Box Position

```
1. User sees error box is slightly misaligned
2. Clicks 🔍 button on error in list
3. ErrorBoxEditDialog opens with image
4. User drags box to correct position
5. Clicks "Save Changes"
6. → API: PUT /api/.../errors/{id}
7. Box updates on maintenance image
8. Success message shown
```

### Workflow 2: Resize Error Box

```
1. User wants to expand error area
2. Clicks 🔍 button on error
3. Grabs corner handle (cursor changes to resize icon)
4. Drags to resize box
5. Sees real-time preview
6. Clicks "Save Changes"
7. → API: PUT /api/.../errors/{id}
8. Box updates with new size
```

### Workflow 3: Add New Error

```
1. User clicks "Add Error" button
2. Draws rectangle on image
3. Fills in form (status, label, comment)
4. Clicks "Save Error"
5. → API: POST /api/.../errors
6. Server returns error with ID
7. Error appears in list and on image
8. Error is persisted (survives page refresh)
```

### Workflow 4: Edit Existing AI Detection

```
1. AI detects an error
2. User wants to adjust the box
3. Clicks 🔍 button
4. Repositions/resizes the box
5. Changes status from FAULTY → POTENTIAL
6. Adds comment
7. Clicks "Save Changes"
8. → API: PUT /api/.../errors/{regionId}
9. Modified error replaces AI detection in local state
10. Changes persisted to server
```

### Workflow 5: Load Page with Existing Errors

```
1. User navigates to Compare page
2. Page loads maintenance images
3. For each image:
   a. Load AI detections (anomaly-results API)
   b. Load user errors (GET /api/.../errors)
   c. Merge: User errors override AI detections
4. Display combined results on image
5. All manual errors have "Manual" badge
6. All edited AI detections show modifications
```

## Error Merging Logic

When loading errors, the system merges AI detections with user modifications:

```javascript
// 1. Load AI detections
const aiBoxes = await fetchDetections(imageId);

// 2. Load user errors
const userErrors = await getErrors(imageId);

// 3. Merge logic
userErrors.forEach((userErr) => {
  const existingIdx = aiBoxes.findIndex(
    (ai) => ai.regionId === userErr.regionId
  );

  if (existingIdx >= 0) {
    // User modified an AI detection → override
    aiBoxes[existingIdx] = { ...aiBoxes[existingIdx], ...userErr };
  } else {
    // User added a new error → append
    aiBoxes.push({ ...userErr, isManual: true });
  }
});
```

**Result**:

- AI detections that weren't modified → shown as-is
- AI detections that were modified → show user's changes
- User-added errors → shown with "Manual" badge

## Backend Requirements

### Database Schema (Suggested)

```sql
CREATE TABLE image_errors (
  id VARCHAR(36) PRIMARY KEY,
  image_id VARCHAR(36) NOT NULL,
  region_id VARCHAR(36),           -- Link to AI detection if applicable
  cx FLOAT NOT NULL,
  cy FLOAT NOT NULL,
  w FLOAT NOT NULL,
  h FLOAT NOT NULL,
  status ENUM('FAULTY', 'POTENTIAL', 'NORMAL') NOT NULL,
  label VARCHAR(255),
  comment TEXT,
  confidence FLOAT,
  color_rgb VARCHAR(20),           -- "255,0,0"
  is_manual BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE
);

CREATE INDEX idx_image_errors_image_id ON image_errors(image_id);
CREATE INDEX idx_image_errors_region_id ON image_errors(region_id);
```

### API Endpoints to Implement

#### 1. Create Error

```http
POST /api/transformers/images/:imageId/errors
Content-Type: application/json

Request:
{
  "cx": 450,
  "cy": 300,
  "w": 100,
  "h": 80,
  "status": "FAULTY",
  "label": "Hotspot",
  "comment": "Visible heat signature",
  "confidence": 0.95,
  "isManual": true
}

Response: 201 Created
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cx": 450,
  "cy": 300,
  ... (all fields)
  "timestamp": "2025-10-19T14:30:00Z"
}
```

#### 2. Update Error

```http
PUT /api/transformers/images/:imageId/errors/:errorId
Content-Type: application/json

Request:
{
  "cx": 460,           // Changed
  "cy": 310,           // Changed
  "w": 120,            // Changed
  "h": 90,             // Changed
  "status": "POTENTIAL",
  "label": "Hotspot",
  "comment": "Updated after review"
}

Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  ... (updated fields)
  "lastModified": "2025-10-19T15:45:00Z"
}
```

#### 3. Delete Error (Soft Delete)

```http
DELETE /api/transformers/images/:imageId/errors/:errorId

Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "isDeleted": true,
  "deletedAt": "2025-10-19T16:00:00Z"
}
```

#### 4. Get Errors

```http
GET /api/transformers/images/:imageId/errors

Response: 200 OK
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "cx": 450,
    "cy": 300,
    "w": 100,
    "h": 80,
    "status": "FAULTY",
    "label": "Hotspot",
    "comment": "Requires attention",
    "confidence": 0.95,
    "isManual": true,
    "isDeleted": false,
    "timestamp": "2025-10-19T14:30:00Z",
    "lastModified": "2025-10-19T15:45:00Z"
  },
  ...
]
```

## Error Handling

### Frontend Error Handling

```javascript
try {
  const response = await saveError(imageId, errorData);
  show("Error saved successfully", "success");
} catch (error) {
  console.error("Failed to save error:", error);
  show(
    error?.response?.data?.error ||
      error?.message ||
      "Failed to save error to server",
    "error"
  );
}
```

### Backend Error Responses

```javascript
// Validation error
400 Bad Request
{
  "error": "Invalid error data",
  "details": {
    "cx": "must be a number",
    "status": "must be FAULTY, POTENTIAL, or NORMAL"
  }
}

// Not found
404 Not Found
{
  "error": "Error not found",
  "errorId": "550e8400-..."
}

// Server error
500 Internal Server Error
{
  "error": "Failed to save error",
  "message": "Database connection error"
}
```

## Testing Guide

### Test Case 1: Edit Box Position

1. Navigate to Compare page with errors
2. Click 🔍 on any error
3. Drag the box to a new position
4. Verify coordinates update in real-time
5. Click "Save Changes"
6. Verify success message
7. Refresh page
8. Verify box is in new position

### Test Case 2: Resize Box

1. Open box editor
2. Grab corner handle (cursor changes)
3. Drag to resize
4. Verify minimum size constraint (20px)
5. Grab edge handle
6. Resize only one dimension
7. Save and verify persistence

### Test Case 3: Combined Edit

1. Open box editor
2. Reposition the box
3. Resize it
4. Change status to POTENTIAL
5. Update comment
6. Save
7. Verify all changes persist

### Test Case 4: Error Merging

1. Let AI detect errors on image
2. Edit one AI detection (change box + status)
3. Add a new manual error
4. Refresh page
5. Verify:
   - Unmodified AI detections appear as-is
   - Modified AI detection shows changes
   - Manual error appears with "Manual" badge

### Test Case 5: Network Failure

1. Disconnect network
2. Try to save an error
3. Verify error message shown
4. Reconnect network
5. Retry save
6. Verify success

## Migration Notes

### For Existing Deployments

If you have existing data without the errors API:

1. **Backward Compatible**: Frontend gracefully handles missing user errors
2. **AI Detections Still Work**: System continues to show AI detections even if errors API fails
3. **Progressive Enhancement**: As backend is implemented, features automatically activate

### Database Migration Script

```sql
-- Create the errors table
CREATE TABLE IF NOT EXISTS image_errors (
  -- schema from above
);

-- Migrate existing AI detections to errors table (optional)
INSERT INTO image_errors (
  id, image_id, region_id, cx, cy, w, h,
  status, label, confidence, is_manual, created_at
)
SELECT
  UUID(),
  fr.image_id,
  fr.id as region_id,
  fr.centroid_x as cx,
  fr.centroid_y as cy,
  fr.bbox_width as w,
  fr.bbox_height as h,
  fr.tag as status,
  fr.type as label,
  fr.confidence,
  FALSE as is_manual,
  fr.created_at
FROM fault_regions fr
WHERE fr.created_at > '2025-01-01';  -- Adjust as needed
```

## Performance Considerations

### Optimization Tips

1. **Lazy Loading**: Only load errors for visible images
2. **Caching**: Cache error data to minimize API calls
3. **Debouncing**: Don't save every mouse move during drag
4. **Batch Operations**: If editing multiple errors, consider batch API
5. **Pagination**: For images with many errors, paginate the list

### Current Implementation

- ✅ Lazy loading (errors loaded when image is viewed)
- ✅ Caching (errors stored in state, not reloaded)
- ✅ Final save only (no intermediate saves during drag)
- ⚠️ No batch operations yet
- ⚠️ No pagination yet

## Security Considerations

### Authentication

```javascript
// Ensure user has permission to edit errors
// Backend should verify:
- User is authenticated
- User has access to this transformer
- User has edit permissions for inspections
```

### Validation

```javascript
// Backend must validate:
- Coordinates are within image bounds
- Dimensions are positive and reasonable
- Status is valid enum value
- Comment length is reasonable
- User owns this inspection/transformer
```

### Audit Trail

```javascript
// Recommended: Track who made changes
ALTER TABLE image_errors ADD COLUMN modified_by VARCHAR(36);
ALTER TABLE image_errors ADD COLUMN created_by VARCHAR(36);

// Log all modifications
CREATE TABLE error_audit_log (
  id VARCHAR(36) PRIMARY KEY,
  error_id VARCHAR(36),
  user_id VARCHAR(36),
  action ENUM('CREATE', 'UPDATE', 'DELETE'),
  changes JSON,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Known Limitations

1. **No Undo**: Once saved, changes cannot be undone (consider implementing)
2. **Single User**: No real-time collaboration (concurrent edits may conflict)
3. **No Versioning**: Previous versions of errors are not tracked
4. **No Restore**: Deleted errors cannot be restored (only soft deleted)
5. **No Rotation**: Cannot rotate error boxes (only position/size)

## Future Enhancements

### High Priority

- [ ] Undo/Redo functionality
- [ ] Real-time collaboration (WebSocket)
- [ ] Error versioning/history
- [ ] Restore deleted errors

### Medium Priority

- [ ] Keyboard shortcuts for editing
- [ ] Touch support for mobile/tablet
- [ ] Copy/paste errors between images
- [ ] Bulk edit multiple errors
- [ ] Export error report with changes

### Low Priority

- [ ] Rotate error boxes
- [ ] Custom shapes (polygon, circle)
- [ ] Color picker for boxes
- [ ] Templates for common error types
- [ ] AI suggestions for box adjustments

---

**Implementation Status**: ✅ Complete  
**Backend Required**: Yes (4 API endpoints)  
**Database Changes**: Yes (1 new table)  
**Breaking Changes**: None (backward compatible)  
**Ready for Testing**: Yes
