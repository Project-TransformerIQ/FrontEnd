# Backend API Implementation - Quick Reference

## Required Endpoints

### Base URL

```
/api/transformers/images/:imageId/errors
```

## 1. Create Error

**Endpoint**: `POST /api/transformers/images/:imageId/errors`

**Request Body**:

```json
{
  "cx": 450.5,
  "cy": 300.2,
  "w": 100.0,
  "h": 80.0,
  "status": "FAULTY",
  "label": "Hotspot",
  "comment": "Requires immediate attention",
  "confidence": 0.95,
  "colorRgb": [255, 0, 0],
  "isManual": true,
  "regionId": null
}
```

**Response**: `201 Created`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "imageId": "abc123",
  "cx": 450.5,
  "cy": 300.2,
  "w": 100.0,
  "h": 80.0,
  "status": "FAULTY",
  "label": "Hotspot",
  "comment": "Requires immediate attention",
  "confidence": 0.95,
  "colorRgb": [255, 0, 0],
  "isManual": true,
  "isDeleted": false,
  "regionId": null,
  "timestamp": "2025-10-19T14:30:00.000Z",
  "lastModified": "2025-10-19T14:30:00.000Z",
  "deletedAt": null
}
```

---

## 2. Update Error

**Endpoint**: `PUT /api/transformers/images/:imageId/errors/:errorId`

**Request Body** (all fields optional except what's changing):

```json
{
  "cx": 460.0,
  "cy": 310.0,
  "w": 120.0,
  "h": 90.0,
  "status": "POTENTIAL",
  "label": "Hotspot",
  "comment": "Updated after review",
  "confidence": 0.85
}
```

**Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "imageId": "abc123",
  "cx": 460.0,
  "cy": 310.0,
  "w": 120.0,
  "h": 90.0,
  "status": "POTENTIAL",
  "label": "Hotspot",
  "comment": "Updated after review",
  "confidence": 0.85,
  "colorRgb": [255, 255, 0],
  "isManual": true,
  "isDeleted": false,
  "timestamp": "2025-10-19T14:30:00.000Z",
  "lastModified": "2025-10-19T15:45:00.000Z",
  "deletedAt": null
}
```

---

## 3. Delete Error (Soft Delete)

**Endpoint**: `DELETE /api/transformers/images/:imageId/errors/:errorId`

**Request Body**: None

**Response**: `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "imageId": "abc123",
  "isDeleted": true,
  "deletedAt": "2025-10-19T16:00:00.000Z",
  "message": "Error soft deleted successfully"
}
```

**Important**: Do NOT actually delete the record. Set `is_deleted = true` and `deleted_at = NOW()`.

---

## 4. Get All Errors for Image

**Endpoint**: `GET /api/transformers/images/:imageId/errors`

**Query Parameters** (optional):

- `includeDeleted=true` - Include soft-deleted errors (default: false)

**Response**: `200 OK`

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "imageId": "abc123",
    "cx": 450.5,
    "cy": 300.2,
    "w": 100.0,
    "h": 80.0,
    "status": "FAULTY",
    "label": "Hotspot",
    "comment": "Requires attention",
    "confidence": 0.95,
    "colorRgb": [255, 0, 0],
    "isManual": true,
    "isDeleted": false,
    "regionId": null,
    "timestamp": "2025-10-19T14:30:00.000Z",
    "lastModified": "2025-10-19T14:30:00.000Z",
    "deletedAt": null
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "imageId": "abc123",
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
    "isDeleted": false,
    "regionId": "ai-region-456",
    "timestamp": "2025-10-19T14:35:00.000Z",
    "lastModified": "2025-10-19T15:00:00.000Z",
    "deletedAt": null
  }
]
```

---

## Database Schema

```sql
CREATE TABLE image_errors (
  id VARCHAR(36) PRIMARY KEY,
  image_id VARCHAR(36) NOT NULL,
  region_id VARCHAR(36) NULL,              -- Link to AI detection
  cx FLOAT NOT NULL,                       -- Center X coordinate
  cy FLOAT NOT NULL,                       -- Center Y coordinate
  w FLOAT NOT NULL,                        -- Width
  h FLOAT NOT NULL,                        -- Height
  status ENUM('FAULTY', 'POTENTIAL', 'NORMAL') NOT NULL,
  label VARCHAR(255) NULL,                 -- Error type
  comment TEXT NULL,                       -- User notes
  confidence FLOAT NULL,                   -- 0.0 to 1.0
  color_rgb VARCHAR(20) NULL,              -- "255,0,0"
  is_manual BOOLEAN DEFAULT FALSE,         -- User-added vs AI
  is_deleted BOOLEAN DEFAULT FALSE,        -- Soft delete flag
  region_id VARCHAR(36) NULL,              -- Original AI region ID
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  created_by VARCHAR(36) NULL,             -- User who created
  modified_by VARCHAR(36) NULL,            -- User who last modified

  FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE,
  INDEX idx_image_id (image_id),
  INDEX idx_region_id (region_id),
  INDEX idx_is_deleted (is_deleted)
);
```

---

## Validation Rules

### Required Fields (Create)

- `cx` (number)
- `cy` (number)
- `w` (number, > 0)
- `h` (number, > 0)
- `status` (enum: "FAULTY" | "POTENTIAL" | "NORMAL")

### Optional Fields

- `label` (string, max 255 chars)
- `comment` (text)
- `confidence` (number, 0-1)
- `colorRgb` (array of 3 numbers, 0-255)
- `isManual` (boolean, default: false)
- `regionId` (string, link to AI detection)

### Constraints

- `w` >= 20 (minimum width)
- `h` >= 20 (minimum height)
- `cx`, `cy` should be within image bounds (check image dimensions)
- `confidence` must be between 0 and 1
- `status` must be valid enum value

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Validation failed",
  "details": {
    "cx": "Must be a number",
    "status": "Must be FAULTY, POTENTIAL, or NORMAL"
  }
}
```

### 404 Not Found

```json
{
  "error": "Error not found",
  "errorId": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 404 Not Found (Image)

```json
{
  "error": "Image not found",
  "imageId": "abc123"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied",
  "message": "You don't have permission to edit errors for this image"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error",
  "message": "Failed to save error"
}
```

---

## Implementation Checklist

### Create Endpoint

- [ ] Validate request body
- [ ] Check image exists
- [ ] Check user permissions
- [ ] Generate unique ID (UUID)
- [ ] Set default values (isDeleted=false, timestamp=NOW())
- [ ] Set colorRgb based on status if not provided
- [ ] Insert into database
- [ ] Return created error with 201 status

### Update Endpoint

- [ ] Validate request body
- [ ] Check error exists and not deleted
- [ ] Check user permissions
- [ ] Update only provided fields
- [ ] Set updated_at = NOW()
- [ ] Set modified_by = current user
- [ ] Update colorRgb if status changed
- [ ] Return updated error with 200 status

### Delete Endpoint

- [ ] Check error exists
- [ ] Check user permissions
- [ ] Set is_deleted = true
- [ ] Set deleted_at = NOW()
- [ ] Set modified_by = current user
- [ ] Return success message with 200 status

### Get Endpoint

- [ ] Validate image exists
- [ ] Check user permissions
- [ ] Query errors for image_id
- [ ] Filter out deleted errors (unless includeDeleted=true)
- [ ] Order by created_at DESC
- [ ] Return array of errors with 200 status

---

## Testing Commands

### Create Error

```bash
curl -X POST http://localhost:5000/api/transformers/images/abc123/errors \
  -H "Content-Type: application/json" \
  -d '{
    "cx": 450.5,
    "cy": 300.2,
    "w": 100,
    "h": 80,
    "status": "FAULTY",
    "label": "Hotspot",
    "comment": "Test error",
    "confidence": 0.95,
    "isManual": true
  }'
```

### Update Error

```bash
curl -X PUT http://localhost:5000/api/transformers/images/abc123/errors/550e8400 \
  -H "Content-Type: application/json" \
  -d '{
    "cx": 460,
    "status": "POTENTIAL",
    "comment": "Updated comment"
  }'
```

### Delete Error

```bash
curl -X DELETE http://localhost:5000/api/transformers/images/abc123/errors/550e8400
```

### Get Errors

```bash
curl http://localhost:5000/api/transformers/images/abc123/errors
```

### Get Errors (Include Deleted)

```bash
curl http://localhost:5000/api/transformers/images/abc123/errors?includeDeleted=true
```

---

## Node.js/Express Example

```javascript
// routes/errors.js
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");

// Create error
router.post("/transformers/images/:imageId/errors", async (req, res) => {
  try {
    const { imageId } = req.params;
    const {
      cx,
      cy,
      w,
      h,
      status,
      label,
      comment,
      confidence,
      colorRgb,
      isManual,
      regionId,
    } = req.body;

    // Validation
    if (!cx || !cy || !w || !h || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (w < 20 || h < 20) {
      return res
        .status(400)
        .json({ error: "Width and height must be at least 20" });
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    // Insert into database
    await db.query(
      `INSERT INTO image_errors 
       (id, image_id, region_id, cx, cy, w, h, status, label, comment, confidence, color_rgb, is_manual, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        imageId,
        regionId,
        cx,
        cy,
        w,
        h,
        status,
        label,
        comment,
        confidence,
        colorRgb ? colorRgb.join(",") : null,
        isManual,
        now,
        now,
      ]
    );

    // Fetch and return created error
    const [rows] = await db.query("SELECT * FROM image_errors WHERE id = ?", [
      id,
    ]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error creating error:", error);
    res.status(500).json({ error: "Failed to create error" });
  }
});

// Update error
router.put(
  "/transformers/images/:imageId/errors/:errorId",
  async (req, res) => {
    try {
      const { imageId, errorId } = req.params;
      const updates = req.body;

      // Build dynamic update query
      const fields = [];
      const values = [];

      Object.keys(updates).forEach((key) => {
        if (key === "colorRgb") {
          fields.push("color_rgb = ?");
          values.push(updates[key].join(","));
        } else {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      fields.push("updated_at = ?");
      values.push(new Date().toISOString());
      values.push(errorId);

      await db.query(
        `UPDATE image_errors SET ${fields.join(
          ", "
        )} WHERE id = ? AND image_id = ?`,
        [...values, imageId]
      );

      // Fetch and return updated error
      const [rows] = await db.query("SELECT * FROM image_errors WHERE id = ?", [
        errorId,
      ]);
      res.json(rows[0]);
    } catch (error) {
      console.error("Error updating error:", error);
      res.status(500).json({ error: "Failed to update error" });
    }
  }
);

// Delete error (soft)
router.delete(
  "/transformers/images/:imageId/errors/:errorId",
  async (req, res) => {
    try {
      const { imageId, errorId } = req.params;
      const now = new Date().toISOString();

      await db.query(
        "UPDATE image_errors SET is_deleted = TRUE, deleted_at = ?, updated_at = ? WHERE id = ? AND image_id = ?",
        [now, now, errorId, imageId]
      );

      res.json({
        id: errorId,
        isDeleted: true,
        deletedAt: now,
        message: "Error soft deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting error:", error);
      res.status(500).json({ error: "Failed to delete error" });
    }
  }
);

// Get errors
router.get("/transformers/images/:imageId/errors", async (req, res) => {
  try {
    const { imageId } = req.params;
    const { includeDeleted } = req.query;

    let query = "SELECT * FROM image_errors WHERE image_id = ?";
    const params = [imageId];

    if (!includeDeleted) {
      query += " AND is_deleted = FALSE";
    }

    query += " ORDER BY created_at DESC";

    const [rows] = await db.query(query, params);

    // Transform color_rgb string to array
    const errors = rows.map((row) => ({
      ...row,
      colorRgb: row.color_rgb ? row.color_rgb.split(",").map(Number) : null,
    }));

    res.json(errors);
  } catch (error) {
    console.error("Error fetching errors:", error);
    res.status(500).json({ error: "Failed to fetch errors" });
  }
});

module.exports = router;
```

---

## Python/Flask Example

```python
# routes/errors.py
from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid

errors_bp = Blueprint('errors', __name__)

@errors_bp.route('/transformers/images/<image_id>/errors', methods=['POST'])
def create_error(image_id):
    try:
        data = request.json

        # Validation
        required = ['cx', 'cy', 'w', 'h', 'status']
        if not all(k in data for k in required):
            return jsonify({'error': 'Missing required fields'}), 400

        if data['w'] < 20 or data['h'] < 20:
            return jsonify({'error': 'Width and height must be at least 20'}), 400

        error_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()

        # Insert into database
        cursor.execute('''
            INSERT INTO image_errors
            (id, image_id, region_id, cx, cy, w, h, status, label, comment,
             confidence, color_rgb, is_manual, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            error_id, image_id, data.get('regionId'), data['cx'], data['cy'],
            data['w'], data['h'], data['status'], data.get('label'),
            data.get('comment'), data.get('confidence'),
            ','.join(map(str, data['colorRgb'])) if 'colorRgb' in data else None,
            data.get('isManual', False), now, now
        ))
        db.commit()

        # Fetch and return
        cursor.execute('SELECT * FROM image_errors WHERE id = ?', (error_id,))
        error = cursor.fetchone()

        return jsonify(dict(error)), 201
    except Exception as e:
        print(f'Error creating error: {e}')
        return jsonify({'error': 'Failed to create error'}), 500

# Similar implementations for PUT, DELETE, GET...
```

---

## Common Pitfalls

1. **Don't hard delete** - Use soft delete (is_deleted flag)
2. **Handle NULL regionId** - Manual errors won't have one
3. **Validate coordinates** - Check they're within image bounds
4. **Return consistent format** - Always return same structure
5. **Check permissions** - Verify user can edit this image/transformer
6. **Handle colorRgb** - Store as string, return as array
7. **Set timestamps** - Always update updated_at on changes
8. **Index properly** - Add indexes for image_id and region_id

---

**Questions?** See BACKEND_INTEGRATION_GUIDE.md for full details.
