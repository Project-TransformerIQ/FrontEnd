# TransformerIQ Frontend

React + Vite application for managing transformers, inspections, thermal images, and maintenance records. Uses Material UI for the UI and Axios to talk to a backend API defined by `VITE_API_URL`.

## Form Generation & Saving

This app generates and saves maintenance records from inspection context. The key flow lives in `src/pages/MaintenanceRecordPage.jsx` and `src/services/transformerService.js`.

- Generate form (FR4.1): `GET /transformers/{transformerId}/maintenance-record-form?inspectionId=...`
	- Returns a payload used to render the form and pre-fill fields:
		- `transformer`: basic info (id, transformerNo, poleNo, region, transformerType).
		- `inspection`: selected inspection (id, title, inspector, createdAt, notes).
		- `maintenanceImage`: latest maintenance image for that inspection (id, filename, imageType, uploader, envCondition, createdAt, sizeBytes, contentType).
		- `anomalies`: detections associated with the maintenance image; used to draw overlay boxes and summarize AI findings.
		- `allowedStatuses`: e.g. `["OK", "NEEDS_MAINTENANCE", "URGENT_ATTENTION"]` to populate the status dropdown.
		- `existingRecord` (optional): if present, the form loads in edit mode and pre-fills all fields.

- Edit controls and derived data:
	- Personnel, due timestamp, status, recommended action, additional remarks.
	- Dynamic electrical readings as key/value rows (e.g., voltage, current). These are converted to an object before submit.
	- AI anomaly summary and image viewer with boxes via `ZoomableImageWithBoxes`.

- Save new (FR4.2): `POST /transformers/{transformerId}/maintenance-records`
	- Payload built in `handleSave()` when no `existingRecord`:
		```json
		{
			"transformerId": 123,
			"inspectionId": 456,
			"maintenanceImageId": 789,
			"inspectionTimestamp": "2025-11-29T10:30",
			"inspectorName": "Jane Doe",
			"status": "NEEDS_MAINTENANCE",
			"electricalReadings": { "voltage": "230V", "current": "15A" },
			"recommendedAction": "Tighten terminal bolts",
			"additionalRemarks": "Slight hotspot observed at bushing"
		}
		```

- Update existing (FR4.3): `PUT /transformers/maintenance-records/{recordId}`
	- Sends the same fields (minus `transformerId`/`maintenanceImageId`) to update the record.

- History and navigation:
	- `GET /transformers/{transformerId}/maintenance-records` shows historical records (`MaintenanceRecordsListPage.jsx`).
	- From Inspections, “Maintenance Form” opens the form scoped to a specific inspection.

Supporting endpoints used by the form:

- Images for a transformer/inspection: `GET /transformers/{id}/images`
- Raw image URL helper: `buildImageRawUrl(imageId)` → `${VITE_API_URL}/transformers/images/{imageId}/raw`
- Errors/annotations for an image: `GET/POST/PUT/DELETE /transformers/images/{imageId}/errors/*`

All API calls are centralized in `src/services/transformerService.js`; Axios instance is configured in `src/api/axiosClient.js` (base URL is `import.meta.env.VITE_API_URL`).

## Database Schema (Reference)

The frontend expects the backend to persist the following entities. Below is a reference relational schema (PostgreSQL-style) that satisfies the UI’s needs.

```sql
-- Users
CREATE TABLE users (
	id              BIGSERIAL PRIMARY KEY,
	name            TEXT NOT NULL UNIQUE,
	password_hash   TEXT NOT NULL,
	occupation      TEXT CHECK (occupation IN ('ADMIN','MAINTENANCE_ENGINEER','VIEWER')),
	admin           BOOLEAN DEFAULT FALSE,
	created_at      TIMESTAMPTZ DEFAULT now()
);

-- Transformers
CREATE TABLE transformers (
	id               BIGSERIAL PRIMARY KEY,
	transformer_no   TEXT NOT NULL UNIQUE,
	pole_no          TEXT NOT NULL,
	region           TEXT NOT NULL,
	transformer_type TEXT NOT NULL CHECK (transformer_type IN ('BULK','DISTRIBUTION')),
	created_at       TIMESTAMPTZ DEFAULT now(),
	updated_at       TIMESTAMPTZ DEFAULT now()
);

-- Inspections
CREATE TABLE inspections (
	id            BIGSERIAL PRIMARY KEY,
	transformer_id BIGINT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
	title         TEXT NOT NULL,
	inspector     TEXT NOT NULL,
	notes         TEXT,
	status        TEXT NOT NULL CHECK (status IN ('OPEN','IN_PROGRESS','CLOSED')),
	created_at    TIMESTAMPTZ DEFAULT now()
);

-- Images (baseline and maintenance)
CREATE TABLE images (
	id              BIGSERIAL PRIMARY KEY,
	transformer_id  BIGINT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
	inspection_id   BIGINT REFERENCES inspections(id) ON DELETE SET NULL,
	image_type      TEXT NOT NULL CHECK (image_type IN ('BASELINE','MAINTENANCE')),
	filename        TEXT NOT NULL,
	content_type    TEXT,
	size_bytes      BIGINT,
	uploader        TEXT,
	env_condition   JSONB,        -- { weather, temperatureC, humidity, locationNote, ... }
	created_at      TIMESTAMPTZ DEFAULT now()
);

-- Anomalies/Errors linked to images (AI or manual)
CREATE TABLE image_errors (
	id            BIGSERIAL PRIMARY KEY,
	image_id      BIGINT NOT NULL REFERENCES images(id) ON DELETE CASCADE,
	type          TEXT,           -- e.g., Hotspot, LooseConnection
	tag           TEXT,           -- e.g., FAULTY / POTENTIAL
	bounding_box  JSONB,          -- { x, y, width, height } or normalized coords
	is_deleted    BOOLEAN DEFAULT FALSE,
	created_by    TEXT,           -- 'ai-system' or user name/id
	created_at    TIMESTAMPTZ DEFAULT now(),
	last_modified_at TIMESTAMPTZ
);

-- Maintenance Records
CREATE TABLE maintenance_records (
	id                   BIGSERIAL PRIMARY KEY,
	transformer_id       BIGINT NOT NULL REFERENCES transformers(id) ON DELETE CASCADE,
	inspection_id        BIGINT REFERENCES inspections(id) ON DELETE SET NULL,
	maintenance_image_id BIGINT REFERENCES images(id) ON DELETE SET NULL,
	inspection_timestamp TIMESTAMPTZ,
	inspector_name       TEXT NOT NULL,
	status               TEXT NOT NULL CHECK (status IN ('OK','NEEDS_MAINTENANCE','URGENT_ATTENTION')),
	electrical_readings  JSONB,          -- { voltage: "230V", current: "15A", ... }
	recommended_action   TEXT,
	additional_remarks   TEXT,
	created_at           TIMESTAMPTZ DEFAULT now(),
	updated_at           TIMESTAMPTZ DEFAULT now()
);
```

Notes:
- Baseline uploads have `image_type = 'BASELINE'` and no `inspection_id`.
- Maintenance uploads set `image_type = 'MAINTENANCE'` and include `inspection_id`.
- AI detections and manual edits both live in `image_errors` so the UI can fetch a unified list.

## Setup

Prerequisites:
- Node.js 18+ (LTS recommended)
- A running backend API reachable at `VITE_API_URL`

Environment:
- Create `transformer-frontend/.env` with:
	```dotenv
	VITE_API_URL=http://localhost:8080/api
	```

Install and run (Windows PowerShell):

```powershell
cd "transformer-frontend"
npm install
npm run dev
```

Build and preview:

```powershell
cd "transformer-frontend"
npm run build
npm run preview
```

## Usage

- Log in at `/login` (backend must implement `/auth/login`).
- Create transformers from the home page.
- For a transformer, create an inspection, then:
	- Upload a Baseline image (once per site/config, optional but recommended).
	- Upload a Maintenance image for a specific inspection.
	- Open “Maintenance Form” to generate the report from AI detections and context.
	- Save/Update the record and view “Maintenance Records” history.
	- Optionally open Compare to review detections and download comparison output.



