# Error Management Features - ComparePage

## Overview

The ComparePage now includes a comprehensive error management system that allows users to add, edit, delete, and comment on detected errors in maintenance images.

## Features Implemented

### 1. **Add New Errors**

- **Button Location**: Next to the maintenance image navigation controls
- **How to Use**:
  1. Click the "Add Error" button
  2. A dialog opens showing the maintenance image
  3. Click and drag on the image to draw a rectangle around the error
  4. Fill in error details:
     - Status (Faulty/Potential Faulty)
     - Type/Label (e.g., Hotspot, Corrosion, Leak)
     - Confidence level (0-1)
     - Comment/Notes
  5. Click "Save Error" to add it to the list
- **Features**:
  - Visual drawing with crosshair cursor
  - Real-time preview of the rectangle
  - Reset button to redraw if needed
  - Canvas automatically scales to fit the dialog

### 2. **Edit Existing Errors**

- **Button Location**: Edit icon next to each error in the "Detected Errors" list
- **How to Use**:
  1. Click the edit icon (pencil) on any error
  2. A dialog opens with the current error details
  3. Modify any field:
     - Status
     - Label
     - Confidence
     - Comment
  4. Click "Save Changes"
- **Features**:
  - Shows current position and size (read-only)
  - Displays creation and modification timestamps
  - Indicates if error was manually added

### 3. **Delete Errors (Soft Delete)**

- **Button Location**: Delete icon next to each error in the list
- **How to Use**:
  1. Click the delete icon (trash) on any error
  2. Error is marked as deleted immediately
- **Behavior**:
  - **On Image**: Error box is removed from the maintenance image overlay
  - **In List**: Error remains in the "Detected Errors" list but:
    - Grayed out with reduced opacity
    - Marked with a "DELETED" chip
    - Shows deletion timestamp
    - Has a dashed red border
    - Edit/Delete buttons are hidden
- **Purpose**: Maintains audit trail while removing visual clutter

### 4. **Comments**

- Every error can have a comment/note
- Comments are:
  - Added when creating a new error
  - Editable when editing an error
  - Displayed in the error list with a comment icon
  - Useful for adding context, observations, or action items

### 5. **Error Display**

Each error in the list shows:

- **Number Badge**: #1, #2, etc.
- **Status Badge**: Faulty (red) or Potential (yellow)
- **Type/Label**: e.g., "Hotspot"
- **Confidence**: Percentage value
- **Source**: "Manual" badge for user-added errors
- **Color Indicator**: Colored dot matching the box color
- **Position**: Coordinates and size information
- **Comment**: If provided, shown in an indented section
- **Timestamps**: Creation and last modification times

### 6. **Visual Indicators**

#### On Maintenance Image:

- **Active Errors**: Colored rectangles (red for faulty, yellow for potential)
- **Numbered Badges**: Small circular badges showing error numbers
- **Point Markers**: For errors without bounding boxes (circular markers)
- **Deleted Errors**: Not shown on the image

#### In Error List:

- **Active Errors**: Blue background, full opacity
- **Deleted Errors**: Red tinted background, reduced opacity, dashed border
- **Manual Entries**: "Manual" badge in blue
- **Status**: Color-coded chips (red/yellow/green)

## Technical Details

### Components Created

1. **ErrorDrawDialog.jsx**

   - Interactive canvas for drawing error boxes
   - Real-time rectangle drawing with click-and-drag
   - Form for error metadata
   - Image scaling to fit dialog size

2. **ErrorEditDialog.jsx**
   - Form for editing error properties
   - Read-only position display
   - Timestamp tracking
   - Comment editing

### State Management

- `boxesById`: Object mapping imageId to array of error boxes
- Each error box contains:
  ```javascript
  {
    cx,
      cy,
      w,
      h, // Position and size (pixels)
      status, // "FAULTY" | "POTENTIAL" | "NORMAL"
      label, // Error type
      comment, // User notes
      confidence, // 0-1
      colorRgb, // [r, g, b]
      isManual, // true for user-added errors
      isDeleted, // true for soft-deleted errors
      timestamp, // Creation time
      lastModified, // Last edit time
      deletedAt, // Deletion time
      idx; // Display number
  }
  ```

### Data Flow

1. **Add**: New error → `handleAddError` → Update `boxesById` → Re-render
2. **Edit**: Click edit → Open dialog → `handleSaveEditedError` → Update array → Re-render
3. **Delete**: Click delete → `handleDeleteError` → Mark as deleted → Re-render

### Integration Points

- Works with existing AI detection results
- Preserves all AI-detected errors
- Manual errors are clearly marked
- All errors can be edited or deleted
- Changes are maintained per image ID

## User Workflow Examples

### Scenario 1: Adding a Manual Error

1. User notices an issue the AI missed
2. Clicks "Add Error" button
3. Draws a rectangle around the issue
4. Fills in: Status=Faulty, Label=Oil Leak, Comment="Visible staining on bottom"
5. Saves and sees it appear in the list and on the image

### Scenario 2: Editing AI Detection

1. AI detects a hotspot as "Faulty"
2. User reviews and determines it's only "Potential"
3. Clicks edit button
4. Changes status to "Potential Faulty"
5. Adds comment: "Needs follow-up inspection in 3 months"
6. Saves changes

### Scenario 3: Deleting False Positive

1. AI detects an anomaly that's actually normal
2. User clicks delete button
3. Error disappears from image but stays in list
4. List shows "DELETED" status with timestamp
5. Audit trail preserved for reporting

## Future Enhancements (Optional)

- Persist changes to backend API
- Export error reports with comments
- Filter view (show/hide deleted errors)
- Undo/redo functionality
- Bulk operations (delete multiple, change status of multiple)
- Error annotations with arrows/lines
- Compare errors between inspections
- Email notifications for critical errors

## Notes

- All changes are currently stored in component state (lost on page refresh)
- To persist changes, integrate with backend API endpoints
- Error numbering is dynamically assigned based on array position
- Deleted errors maintain their original position in the array
