# Testing Guide - Error Management Features

## Prerequisites

- Navigate to a Compare page with maintenance images
- Ensure you have at least one maintenance image loaded

## Test Cases

### Test 1: Add a New Error

**Steps:**

1. Click the "Add Error" button next to the maintenance image controls
2. In the dialog, click and drag on the image to draw a rectangle
3. Verify the rectangle appears with a dashed outline while dragging
4. Release to finalize the rectangle
5. Fill in the form:
   - Status: Select "Faulty"
   - Type/Label: Enter "Test Hotspot"
   - Confidence: Keep default 0.95
   - Comment: Enter "This is a test error"
6. Click "Save Error"

**Expected Results:**

- ✅ Dialog closes
- ✅ Success message appears
- ✅ New error appears in the "Detected Errors" list at the bottom
- ✅ Error box appears on the maintenance image with a red border
- ✅ Numbered badge (#X) appears on the error box
- ✅ Error shows "Manual" badge in the list
- ✅ Comment is displayed in the list

### Test 2: Edit an Error

**Steps:**

1. In the "Detected Errors" list, click the edit icon (pencil) on any error
2. Change the Status to "Potential Faulty"
3. Update the Comment to "Updated comment text"
4. Click "Save Changes"

**Expected Results:**

- ✅ Dialog closes
- ✅ Success message appears
- ✅ Error status badge changes from red to yellow
- ✅ Error box color changes from red to yellow on the image
- ✅ Comment is updated in the list
- ✅ "Last modified" timestamp appears

### Test 3: Delete an Error

**Steps:**

1. In the "Detected Errors" list, click the delete icon (trash) on any error
2. Confirm the action (if prompted)

**Expected Results:**

- ✅ Warning message appears
- ✅ Error box disappears from the image
- ✅ Error remains in the list but:
  - Has a red-tinted background
  - Shows "DELETED" badge
  - Is semi-transparent (60% opacity)
  - Has a dashed red border
  - Shows deletion timestamp
  - Edit/Delete buttons are hidden

### Test 4: Add Comment to Existing Error

**Steps:**

1. Click edit on an error that has no comment
2. Enter a comment: "Requires immediate attention"
3. Click "Save Changes"

**Expected Results:**

- ✅ Comment appears in the list below the error details
- ✅ Comment icon appears next to the comment text

### Test 5: Drawing Interaction

**Steps:**

1. Click "Add Error" button
2. Try these drawing actions:
   - Draw a small rectangle
   - Click "Reset" button
   - Draw a larger rectangle
   - Try drawing from different corners (top-left to bottom-right, bottom-right to top-left)

**Expected Results:**

- ✅ Crosshair cursor appears when hovering over the canvas
- ✅ Rectangle follows mouse while dragging
- ✅ Reset button clears the drawn rectangle
- ✅ Can draw rectangles in any direction
- ✅ Canvas displays the image properly scaled

### Test 6: Multiple Images

**Steps:**

1. Add an error to the current maintenance image
2. Use the arrow buttons to navigate to the next maintenance image
3. Add a different error to this image
4. Navigate back to the first image

**Expected Results:**

- ✅ Each image maintains its own set of errors
- ✅ Errors don't carry over between images
- ✅ Previously added errors persist when returning to an image

### Test 7: Zoom and Pan with Errors

**Steps:**

1. Ensure there are error boxes on the maintenance image
2. Use the zoom controls (+ and - buttons)
3. Click and drag to pan the image
4. Use the Reset button to return to original view

**Expected Results:**

- ✅ Error boxes scale correctly with zoom
- ✅ Error boxes move correctly with pan
- ✅ Numbered badges stay positioned correctly relative to error boxes
- ✅ Reset button returns both image and error overlays to original position

### Test 8: Error List Display

**Steps:**

1. Ensure you have multiple errors (mix of AI-detected and manual)
2. Review the "Detected Errors" list

**Expected Results:**

- ✅ Errors are numbered sequentially (#1, #2, #3...)
- ✅ Status badges show correct colors (red/yellow/green)
- ✅ Manual errors have "Manual" badge
- ✅ Confidence is displayed as percentage
- ✅ Color indicator dot matches the box color
- ✅ Position information is shown
- ✅ Comments are displayed with proper formatting
- ✅ Edit and Delete buttons are visible for active errors
- ✅ Deleted errors are visually distinct

### Test 9: Edge Cases

**Steps:**

1. Try to add an error without drawing a rectangle (Save should be disabled)
2. Edit an error and cancel without saving
3. Draw a very small rectangle (1-2 pixels)
4. Draw a rectangle that covers the entire image

**Expected Results:**

- ✅ Cannot save without drawing a rectangle
- ✅ Cancel button properly closes dialog without changes
- ✅ Small rectangles are still visible
- ✅ Large rectangles render correctly

### Test 10: Performance

**Steps:**

1. Add 10+ manual errors to a single image
2. Navigate between images
3. Edit multiple errors
4. Delete several errors

**Expected Results:**

- ✅ UI remains responsive
- ✅ No visible lag when rendering error boxes
- ✅ List updates smoothly
- ✅ Image navigation is not affected

## Known Limitations

- ⚠️ Changes are not persisted (lost on page refresh)
- ⚠️ Cannot resize or move existing error boxes (position is fixed after creation)
- ⚠️ Cannot restore deleted errors (no undo)
- ⚠️ No export functionality for error reports

## Bug Reporting

If you encounter issues, note:

1. Browser console errors
2. Steps to reproduce
3. Expected vs. actual behavior
4. Browser and version
5. Screenshot if visual issue

## Future Testing Needs

Once backend integration is added:

- Test API persistence
- Test loading existing manual errors
- Test error synchronization
- Test concurrent editing by multiple users
