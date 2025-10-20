# User ID Input for Comments - Implementation Summary

## Overview

Added a **User ID input field** to all error/comment dialogs. Users must enter their User ID before adding or updating comments. This User ID is then stored in the `createdBy` and `lastModifiedBy` fields.

**Date:** October 20, 2025  
**Feature:** User ID input for error annotations

---

## Changes Made

### 1. ErrorDrawDialog.jsx

**Location:** `src/components/dialogs/ErrorDrawDialog.jsx`

**Added:**

- User ID text field at the top of the form
- State management: `const [userId, setUserId] = useState(currentUser || "")`
- Pre-populates with `currentUser` prop if available
- Required field with helper text
- Save button is disabled if User ID is empty

**When creating new error:**

```javascript
const newError = {
  // ... other fields
  createdBy: userId || "Anonymous",
  createdAt: new Date().toISOString(),
  lastModifiedBy: userId || "Anonymous",
  lastModifiedAt: new Date().toISOString(),
};
```

---

### 2. ErrorBoxEditDialog.jsx

**Location:** `src/components/dialogs/ErrorBoxEditDialog.jsx`

**Added:**

- User ID text field at the top of the form
- Pre-populates with the last user who modified the error (`error.lastModifiedBy`)
- Required field with helper text
- Save button is disabled if User ID is empty

**When updating error:**

```javascript
const updatedError = {
  ...error,
  // ... other changes
  lastModifiedBy: userId || "Anonymous",
  lastModifiedAt: new Date().toISOString(),
};
```

---

### 3. ErrorEditDialog.jsx

**Location:** `src/components/dialogs/ErrorEditDialog.jsx`

**Added:**

- User ID text field above the status dropdown
- Pre-populates with the last user who modified the error
- Required field with helper text
- Save button is disabled if User ID is empty

---

## How It Works

### 1. Adding a New Error/Comment

1. User clicks to add a new error
2. Dialog opens with a **User ID** field at the top
3. User must enter their User ID (required field)
4. User draws the error box, selects status, and adds comment
5. When saved:
   - `createdBy` = entered User ID
   - `lastModifiedBy` = entered User ID (same as createdBy initially)

### 2. Editing an Existing Error/Comment

1. User clicks to edit an existing error
2. Dialog opens with the **User ID** field pre-filled with the previous modifier's ID
3. User can change the User ID to their own
4. User modifies status, comment, or box position
5. When saved:
   - `createdBy` = unchanged (original creator)
   - `lastModifiedBy` = entered User ID (new modifier)

---

## User Experience

### Form Layout (All Dialogs)

```
┌─────────────────────────────────────┐
│  User ID:  [________________]       │
│  (Your user ID will be recorded...) │
│                                      │
│  Status:   [Faulty ▼]               │
│                                      │
│  Comment:  [___________________]    │
│            [___________________]    │
│            [___________________]    │
│                                      │
│         [Cancel]  [Save Error]      │
└─────────────────────────────────────┘
```

### Field Details

**User ID Field:**

- Label: "User ID"
- Placeholder: "Enter your user ID"
- Helper Text:
  - Create: "Your user ID will be recorded as the creator of this error"
  - Edit: "Your user ID will be recorded as the last modifier of this error"
- Required: Yes
- Validation: Cannot be empty or whitespace only

**Save Button:**

- Disabled when:
  - User ID is empty or contains only whitespace
  - (For ErrorDrawDialog) No rectangle has been drawn

---

## Data Stored

### When Creating a New Error:

```javascript
{
  cx: 100,
  cy: 200,
  w: 50,
  h: 50,
  status: "FAULTY",
  comment: "Visible damage on insulator",
  createdBy: "user123",           // ← User entered ID
  createdAt: "2025-10-20T10:30:00Z",
  lastModifiedBy: "user123",       // ← Same as createdBy
  lastModifiedAt: "2025-10-20T10:30:00Z"
}
```

### When Editing an Existing Error:

```javascript
{
  cx: 100,
  cy: 200,
  w: 50,
  h: 50,
  status: "FAULTY",
  comment: "Updated: Severe damage confirmed",
  createdBy: "user123",           // ← Original creator (unchanged)
  createdAt: "2025-10-20T10:30:00Z",
  lastModifiedBy: "user456",       // ← New user who edited it
  lastModifiedAt: "2025-10-20T14:45:00Z"  // ← New timestamp
}
```

---

## Benefits

✅ **Simple Implementation**

- No complex authentication system required
- Users manually enter their ID each time

✅ **Flexible**

- Works with any user identification system
- Can use employee ID, email, username, etc.

✅ **Trackable**

- Clear record of who created each annotation
- Clear record of who last modified each annotation
- Timestamps for all actions

✅ **Validation**

- User ID is required (cannot be empty)
- Save button disabled until User ID is provided

---

## Usage Example

### Scenario 1: Inspector adds new error

1. Inspector "JohnD123" opens the Compare page
2. Clicks "Add Error" button
3. Enters "JohnD123" in the User ID field
4. Draws a rectangle around the damaged area
5. Selects "Faulty" status
6. Adds comment: "Cracked insulator, needs immediate replacement"
7. Clicks "Save Error"

**Result:**

```javascript
{
  createdBy: "JohnD123",
  lastModifiedBy: "JohnD123",
  comment: "Cracked insulator, needs immediate replacement"
}
```

### Scenario 2: Supervisor reviews and updates

1. Supervisor "MaryS456" reviews the error
2. Clicks to edit the error
3. Sees "JohnD123" pre-filled (can change it)
4. Changes User ID to "MaryS456"
5. Updates comment: "Confirmed. Scheduled for repair on 10/25"
6. Clicks "Save Changes"

**Result:**

```javascript
{
  createdBy: "JohnD123",           // Original inspector
  lastModifiedBy: "MaryS456",      // Supervisor who reviewed
  comment: "Confirmed. Scheduled for repair on 10/25"
}
```

---

## Future Enhancements (Optional)

### Store User ID in Browser

To avoid re-entering User ID every time:

```javascript
// On first entry, save to localStorage
localStorage.setItem("userId", userId);

// Pre-fill from localStorage
const [userId, setUserId] = useState(
  localStorage.getItem("userId") || currentUser || ""
);
```

### Add User ID to Page Header

Show current user ID at the top of the page:

```javascript
// In ComparePage.jsx
const [currentUserId, setCurrentUserId] = useState(
  localStorage.getItem("userId") || "Not Set"
);

// Display in header
<Chip label={`User: ${currentUserId}`} />;
```

---

## Testing

### Test Case 1: Create New Error

1. Open Compare page
2. Click "Add Error"
3. **Without entering User ID**, try to save → Button should be disabled
4. Enter User ID "TestUser1"
5. Draw error box and save
6. Verify saved error has `createdBy: "TestUser1"`

### Test Case 2: Edit Existing Error

1. Select an existing error
2. Click edit
3. Verify User ID field shows previous modifier
4. Change to "TestUser2"
5. Save changes
6. Verify `lastModifiedBy: "TestUser2"`

### Test Case 3: Empty User ID Validation

1. Open any dialog
2. Clear the User ID field
3. Verify Save button is disabled
4. Enter spaces only
5. Verify Save button remains disabled

---

## Summary

✅ All three dialogs now have User ID input fields:

- `ErrorDrawDialog.jsx` - For creating new errors
- `ErrorBoxEditDialog.jsx` - For editing error boxes with position/size
- `ErrorEditDialog.jsx` - For editing error details only

✅ User ID is required and validated

✅ User ID is stored in:

- `createdBy` - When creating new errors
- `lastModifiedBy` - When creating or editing errors

✅ Save buttons are disabled until valid User ID is entered
