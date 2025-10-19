# Annotated Errors API Schema

## Overview

This document describes the complete data structure for annotated errors (user-created and edited anomaly detections) in the Transformer Inspection system.

## Updated: October 19, 2025

Added user tracking fields: `createdBy`, `createdAt`, `lastModifiedBy`, `lastModifiedAt`

---

## Error Object Schema

### Complete Field List

```typescript
interface AnnotatedError {
  // Identity
  id: string | null; // Server-assigned unique identifier (UUID or DB ID)
  imageId: string; // ID of the parent image
  regionId: string | null; // Original AI region ID (if tied to AI detection)

  // Position & Geometry (natural image pixels OR normalized 0..1)
  cx: number; // Center X coordinate
  cy: number; // Center Y coordinate
  w: number; // Width
  h: number; // Height

  // Classification
  status: "FAULTY" | "POTENTIAL" | "NORMAL"; // Error status
  label: string | null; // Type/name (e.g., "Hotspot", "Corrosion")
  confidence: number | null; // Confidence score 0..1

  // Display
  colorRgb: [number, number, number] | null; // RGB color for overlay [r,g,b]
  color: string | null; // Alternative color string (hex/css)

  // Metadata
  isManual: boolean; // true = user-created; false = AI-originated
  isPoint: boolean; // true = point marker (no bounding box)
  isDeleted: boolean; // Soft-delete flag
  comment: string | null; // User notes/observations

  // Timestamps & User Tracking
  timestamp: string | null; // Legacy creation time (ISO 8601) - DEPRECATED
  createdAt: string; // Creation timestamp (ISO 8601)
  createdBy: string; // Username who created this error
  lastModified: string | null; // Legacy modified time - DEPRECATED
  lastModifiedAt: string | null; // Last modification timestamp (ISO 8601)
  lastModifiedBy: string | null; // Username who last modified this error
  deletedAt: string | null; // Deletion timestamp (ISO 8601) if soft-deleted
}
```

---

## API Endpoints

### 1. GET `/api/transformers/images/{imageId}/errors`

**Description:** Retrieve all annotated errors for a specific image

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "imageId": "img-123",
      "regionId": null,
      "cx": 450.5,
      "cy": 300.2,
      "w": 100.0,
      "h": 80.0,
      "status": "FAULTY",
      "label": "Hotspot",
      "comment": "Visible heat spot near terminal",
      "confidence": 0.95,
      "colorRgb": [255, 0, 0],
      "isManual": true,
      "isPoint": false,
      "isDeleted": false,
      "createdAt": "2025-10-19T14:30:00.000Z",
      "createdBy": "john.doe",
      "lastModifiedAt": "2025-10-19T15:45:00.000Z",
      "lastModifiedBy": "jane.smith",
      "deletedAt": null
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "imageId": "img-123",
      "regionId": "ai-region-456",
      "cx": 550.0,
      "cy": 400.0,
      "w": 80.0,
      "h": 80.0,
      "status": "POTENTIAL",
      "label": "Corrosion",
      "comment": "Monitor over time",
      "confidence": 0.75,
      "colorRgb": [255, 255, 0],
      "isManual": false,
      "isPoint": false,
      "isDeleted": false,
      "createdAt": "2025-10-19T14:35:00.000Z",
      "createdBy": "ai-system",
      "lastModifiedAt": "2025-10-19T15:00:00.000Z",
      "lastModifiedBy": "john.doe",
      "deletedAt": null
    }
  ]
}
```

---

### 2. POST `/api/transformers/images/{imageId}/errors`

**Description:** Create a new annotated error

**Request Body:**

```json
{
  "imageId": "img-123",
  "cx": 450.5,
  "cy": 300.2,
  "w": 100,
  "h": 80,
  "status": "FAULTY",
  "label": "Hotspot",
  "comment": "Marked during maintenance inspection",
  "confidence": 0.95,
  "colorRgb": [255, 0, 0],
  "isManual": true,
  "createdBy": "john.doe",
  "createdAt": "2025-10-19T14:30:00.000Z"
}
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "imageId": "img-123",
    "regionId": null,
    "cx": 450.5,
    "cy": 300.2,
    "w": 100,
    "h": 80,
    "status": "FAULTY",
    "label": "Hotspot",
    "comment": "Marked during maintenance inspection",
    "confidence": 0.95,
    "colorRgb": [255, 0, 0],
    "isManual": true,
    "isPoint": false,
    "isDeleted": false,
    "createdAt": "2025-10-19T14:30:00.000Z",
    "createdBy": "john.doe",
    "lastModifiedAt": null,
    "lastModifiedBy": null,
    "deletedAt": null
  }
}
```

---

### 3. PUT `/api/transformers/images/{imageId}/errors/{errorId}`

**Description:** Update an existing error

**Request Body:**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "cx": 455.0,
  "cy": 305.0,
  "w": 110,
  "h": 85,
  "status": "FAULTY",
  "label": "Hotspot - Severe",
  "comment": "Updated after closer inspection",
  "confidence": 0.98,
  "colorRgb": [255, 0, 0],
  "lastModifiedBy": "jane.smith",
  "lastModifiedAt": "2025-10-19T15:45:00.000Z"
}
```

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "imageId": "img-123",
    "regionId": null,
    "cx": 455.0,
    "cy": 305.0,
    "w": 110,
    "h": 85,
    "status": "FAULTY",
    "label": "Hotspot - Severe",
    "comment": "Updated after closer inspection",
    "confidence": 0.98,
    "colorRgb": [255, 0, 0],
    "isManual": true,
    "isPoint": false,
    "isDeleted": false,
    "createdAt": "2025-10-19T14:30:00.000Z",
    "createdBy": "john.doe",
    "lastModifiedAt": "2025-10-19T15:45:00.000Z",
    "lastModifiedBy": "jane.smith",
    "deletedAt": null
  }
}
```

---

### 4. DELETE `/api/transformers/images/{imageId}/errors/{errorId}`

**Description:** Soft-delete an error (mark as deleted, retain in database)

**Response:**

```json
{
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "imageId": "img-123",
    "regionId": null,
    "cx": 450.5,
    "cy": 300.2,
    "w": 100,
    "h": 80,
    "status": "FAULTY",
    "label": "Hotspot",
    "comment": "Marked during maintenance inspection",
    "confidence": 0.95,
    "colorRgb": [255, 0, 0],
    "isManual": true,
    "isPoint": false,
    "isDeleted": true,
    "createdAt": "2025-10-19T14:30:00.000Z",
    "createdBy": "john.doe",
    "lastModifiedAt": "2025-10-19T15:45:00.000Z",
    "lastModifiedBy": "jane.smith",
    "deletedAt": "2025-10-19T16:30:00.000Z"
  }
}
```

---

## Field Descriptions

### Core Identity Fields

- **id**: Server-generated unique identifier (required for updates/deletes)
- **imageId**: Links error to parent image
- **regionId**: Links to AI detection region (null for purely manual errors)

### Geometry Fields

Coordinates can be either:

1. **Natural pixels**: Absolute pixel values (e.g., cx=450.5, w=100)
2. **Normalized**: Ratio 0..1 (e.g., cx=0.45, w=0.1)

Frontend detects format automatically. **Recommendation:** Use natural pixels for consistency.

- **cx, cy**: Center point of error region
- **w, h**: Width and height of bounding box

### Classification Fields

- **status**: Severity level
  - `FAULTY`: Confirmed fault (red)
  - `POTENTIAL`: Potential issue requiring monitoring (yellow)
  - `NORMAL`: Normal condition (green)
- **label**: Descriptive type (e.g., "Hotspot", "Corrosion", "Oil Leak")
- **confidence**: AI confidence or manual certainty (0.0 to 1.0)

### Display Fields

- **colorRgb**: RGB array for overlay rendering [r, g, b] where each value is 0-255
- **color**: Alternative color format (hex string or CSS color name)
- **isPoint**: If true, renders as circular point marker instead of rectangle

### Metadata Fields

- **isManual**: Distinguishes user-created errors from AI detections
- **isDeleted**: Soft-delete flag (deleted items hidden from image but shown in list)
- **comment**: Free-text notes from inspectors

### User Tracking Fields (NEW)

- **createdBy**: Username of person who created the error
- **createdAt**: ISO 8601 timestamp of creation
- **lastModifiedBy**: Username of person who last edited (null if never edited)
- **lastModifiedAt**: ISO 8601 timestamp of last edit (null if never edited)
- **deletedAt**: ISO 8601 timestamp when soft-deleted (null if active)

### Legacy Fields (DEPRECATED)

- **timestamp**: Use `createdAt` instead
- **lastModified**: Use `lastModifiedAt` instead

---

## Frontend Behavior

### Display Rules

1. **Active errors** (`isDeleted=false`): Rendered as colored boxes/points on image
2. **Deleted errors** (`isDeleted=true`): Hidden from image, shown in list with "DELETED" badge and deletion info
3. **User info display**: Shows "Created: {date} by {user}" and "Last modified: {date} by {user}"

### Merge Logic (AI + User Errors)

When loading errors:

1. Fetch AI anomaly detections
2. Fetch user-annotated errors
3. Merge: User errors with matching `regionId` override AI detections
4. Append purely manual errors (no `regionId`)

### User Context

The frontend includes the current logged-in user's username when:

- Creating new errors (`createdBy`)
- Editing existing errors (`lastModifiedBy`)
- Box repositioning/resizing (`lastModifiedBy`)

**TODO**: Replace hardcoded `currentUser="Admin"` with actual authentication service.

---

## Database Schema Recommendations

```sql
CREATE TABLE annotated_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_id VARCHAR(255) NOT NULL,
    region_id VARCHAR(255),

    -- Geometry (natural pixels recommended)
    cx DECIMAL(10,2) NOT NULL,
    cy DECIMAL(10,2) NOT NULL,
    w DECIMAL(10,2) NOT NULL,
    h DECIMAL(10,2) NOT NULL,

    -- Classification
    status VARCHAR(20) NOT NULL CHECK (status IN ('FAULTY', 'POTENTIAL', 'NORMAL')),
    label VARCHAR(255),
    confidence DECIMAL(4,3),

    -- Display
    color_rgb_r INT,
    color_rgb_g INT,
    color_rgb_b INT,
    color VARCHAR(50),

    -- Metadata
    is_manual BOOLEAN DEFAULT true,
    is_point BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    comment TEXT,

    -- User tracking
    created_by VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_modified_by VARCHAR(255),
    last_modified_at TIMESTAMP,
    deleted_at TIMESTAMP,

    -- Indexes
    INDEX idx_image_id (image_id),
    INDEX idx_region_id (region_id),
    INDEX idx_deleted (is_deleted),
    INDEX idx_created_by (created_by)
);
```

---

## Example Frontend Usage

```javascript
// Creating a new error
const newError = {
  imageId: "img-123",
  cx: 450.5,
  cy: 300.2,
  w: 100,
  h: 80,
  status: "FAULTY",
  label: "Hotspot",
  comment: "Found during inspection",
  confidence: 0.95,
  colorRgb: [255, 0, 0],
  isManual: true,
  createdBy: currentUser, // e.g., "john.doe"
  createdAt: new Date().toISOString(),
};

await saveError(imageId, newError);

// Updating an error
const updatedError = {
  ...existingError,
  comment: "Updated after review",
  lastModifiedBy: currentUser, // e.g., "jane.smith"
  lastModifiedAt: new Date().toISOString(),
};

await updateError(imageId, errorId, updatedError);
```

---

## Migration Notes

If you have existing data without user tracking fields:

1. Add new columns with nullable constraints
2. Populate `createdBy` with a default value (e.g., "system" or "legacy")
3. Set `createdAt` from existing `timestamp` or current date
4. Make `createdBy` and `createdAt` required for new entries

---

## Version History

- **v1.0** (Initial): Basic error schema with geometry and classification
- **v1.1** (Oct 19, 2025): Added user tracking fields (`createdBy`, `lastModifiedBy`, timestamps)
- **v1.2** (Planned): Integration with authentication service for automatic user context
