# Quick Reference - Error Management

## 🎯 Quick Actions

| Action           | Location                 | Button/Icon        | Result                 |
| ---------------- | ------------------------ | ------------------ | ---------------------- |
| **Add Error**    | Maintenance image header | `Add Error` button | Opens drawing dialog   |
| **Edit Error**   | Error list item          | ✏️ Edit icon       | Opens edit dialog      |
| **Delete Error** | Error list item          | 🗑️ Delete icon     | Marks error as deleted |

## 🎨 Visual Legend

### Error Boxes on Image

- 🟥 **Red box** = Faulty status
- 🟨 **Yellow box** = Potential faulty status
- ⭕ **Circle** = Point marker (no bounding box)
- **#1, #2, #3** = Error numbers in colored badges

### Error List Indicators

- 🔴 **Red badge** = Faulty
- 🟡 **Yellow badge** = Potential
- 🟢 **Green badge** = Normal
- 🔵 **Blue badge** = Manual entry
- ⚠️ **"DELETED"** = Soft-deleted error

## 📋 Error Properties

| Field          | Type   | Description        | Example                     |
| -------------- | ------ | ------------------ | --------------------------- |
| **Status**     | Select | Severity level     | Faulty / Potential / Normal |
| **Label**      | Text   | Error type         | Hotspot, Corrosion, Leak    |
| **Confidence** | Number | Certainty (0-1)    | 0.95 = 95%                  |
| **Comment**    | Text   | Notes/observations | "Requires immediate repair" |

## 🔄 Workflow

### Adding a New Error

```
Click "Add Error"
  → Draw rectangle on image
  → Fill in details
  → Click "Save Error"
  → ✅ Error appears on image & list
```

### Editing an Error

```
Click Edit icon (✏️)
  → Modify any field
  → Click "Save Changes"
  → ✅ Error updated
```

### Deleting an Error

```
Click Delete icon (🗑️)
  → Error marked as deleted
  → ✅ Removed from image
  → ✅ Stays in list (grayed out)
```

## 🎨 Drawing Tips

1. **Click and Hold** - Start at one corner
2. **Drag** - Move to opposite corner
3. **Release** - Finalize the rectangle
4. **Reset** - Click reset button to redraw
5. **Zoom** - Image automatically scales to fit

## 💡 Best Practices

### ✅ Do

- Add comments to provide context
- Use appropriate status levels
- Review AI detections and edit if needed
- Keep error labels consistent
- Delete false positives rather than leaving them

### ❌ Don't

- Delete errors without adding a comment first
- Use vague labels like "Issue" or "Problem"
- Set all confidence to 1.0 or 0.5
- Ignore deleted errors in reports

## 🔍 Finding Information

### Error Position

- Shows in list as: `cx=X, cy=Y, w=W, h=H`
- Coordinates are in pixels (natural image size)
- Center point (cx, cy) and size (w, h)

### Timestamps

- **Created**: When error was first added
- **Last modified**: When error was last edited
- **Deleted**: When error was soft-deleted

### Source

- **Manual** badge = Added by user
- No badge = Detected by AI

## 🐛 Troubleshooting

| Problem                    | Solution                         |
| -------------------------- | -------------------------------- |
| Can't draw rectangle       | Ensure dialog is fully loaded    |
| Save button disabled       | Must draw a rectangle first      |
| Error not showing on image | Check if it's been deleted       |
| Changes lost after refresh | Changes not persisted (expected) |
| Error box wrong position   | Check if image is fully loaded   |

## 📊 Status Overview

### Active Errors

- Visible on image ✅
- Visible in list ✅
- Can edit ✅
- Can delete ✅

### Deleted Errors

- Not visible on image ❌
- Visible in list ✅ (grayed out)
- Cannot edit ❌
- Cannot restore ❌

## 🎯 Keyboard Shortcuts

Currently none implemented. Future enhancement opportunity.

## 📱 Responsive Behavior

- Drawing canvas scales to fit dialog
- Error list adapts to screen width
- Touch-friendly buttons and controls
- Mobile gestures not yet supported

## 🔐 Data Storage

⚠️ **Important**: All changes are stored in browser memory only

- Changes persist while on the page
- Changes lost on page refresh
- Changes lost on navigation away
- Backend integration needed for persistence

## 📞 Getting Help

1. Check **ERROR_MANAGEMENT_FEATURES.md** for detailed documentation
2. Review **TESTING_GUIDE.md** for step-by-step testing
3. See **IMPLEMENTATION_SUMMARY.md** for technical details
4. Check browser console for error messages

---

**Last Updated**: October 19, 2025  
**Version**: 1.0  
**Status**: Ready for Use
