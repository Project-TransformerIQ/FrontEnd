# Transformer Frontend - Comprehensive Functionality Guide

## Table of Contents

1. [Overview](#overview)
2. [Technology Stack](#technology-stack)
3. [Application Architecture](#application-architecture)
4. [User Authentication System](#user-authentication-system)
5. [Core Functionalities](#core-functionalities)
6. [Page-by-Page Breakdown](#page-by-page-breakdown)
7. [Component System](#component-system)
8. [API Integration](#api-integration)
9. [Data Flow & State Management](#data-flow--state-management)
10. [Advanced Features](#advanced-features)

---

## Overview

The **Transformer Frontend** is a React-based web application designed for managing electrical transformer thermal inspections. It provides a comprehensive platform for:

- Managing transformer inventory
- Uploading and comparing thermal images (Baseline vs Maintenance)
- AI-powered anomaly detection
- Manual error annotation and correction
- Training machine learning models
- Tracking inspection history and maintenance records

**Target Users**: Electrical engineers, maintenance technicians, and inspection managers.

---

## Technology Stack

### Core Technologies

- **React 19.1.1** - UI library
- **Vite 7.1.2** - Build tool and development server
- **React Router DOM 7.8.1** - Client-side routing

### UI Framework

- **Material-UI (MUI) 7.3.1** - Component library
  - `@mui/material` - Core components
  - `@mui/icons-material` - Icon set
  - `@emotion/react` & `@emotion/styled` - CSS-in-JS styling

### HTTP Client

- **Axios 1.11.0** - API communication

### Development Tools

- **ESLint 9.33.0** - Code linting
- **PostCSS** - CSS processing

---

## Application Architecture

### Project Structure

```
src/
├── api/                    # API configuration
│   └── axiosClient.js     # Axios instance with interceptors
├── assets/                # Static assets (images, icons)
├── components/            # Reusable UI components
│   ├── common/           # Shared components
│   ├── dialogs/          # Modal dialogs
│   └── upload/           # Upload-related components
├── constants/            # Application constants
│   └── enums.js         # Enumerations (types, statuses)
├── contexts/            # React Context providers
│   └── UserContext.jsx  # User authentication context
├── hooks/               # Custom React hooks
│   └── useSnackbar.js  # Notification hook
├── pages/               # Route components (pages)
├── services/            # API service layer
│   └── transformerService.js
├── utils/               # Utility functions
│   └── format.js       # Data formatting utilities
├── App.jsx             # Main application component
├── main.jsx           # Application entry point
└── index.css          # Global styles
```

### Routing Structure

```
/ (root)                              → TransformersPage (home)
/upload                               → ImageUploadPage
/transformers/:id/inspections         → TransformerInspectionsPage
/transformers/:id/inspections/:inspectionId/compare → ComparePage
```

---

## User Authentication System

### Login Mechanism

**File**: `src/pages/LoginPage.jsx`

#### Features:

1. **Simple User Selection**

   - Pre-defined list of users (no password required)
   - Users: John Smith, Sarah Johnson, Michael Chen, Emily Davis, David Wilson

2. **Context-Based State Management**

   - User state stored in `UserContext`
   - Persisted in `localStorage` for session continuity

3. **Visual Design**
   - Gradient background (purple to blue)
   - Material-UI Paper component with elevation
   - Large login icon for visual appeal

#### Key Functions:

```javascript
login(userName); // Set current user and save to localStorage
logout(); // Clear user and remove from localStorage
currentUser; // Access currently logged-in user
```

#### Security Note:

This is a simplified authentication system. For production, implement:

- Password authentication
- JWT tokens
- Backend authentication
- Role-based access control (RBAC)

---

## Core Functionalities

### 1. Transformer Management

**CRUD Operations** for electrical transformer records.

#### Create Transformer

- **Fields Required**:

  - Transformer Number (unique identifier, min 3 characters)
  - Pole Number (location identifier)
  - Region (Colombo, Gampaha, Kandy, Galle, Jaffna)
  - Transformer Type (BULK or DISTRIBUTION)

- **Validation**:
  - Real-time field validation
  - Visual feedback (checkmarks, error messages)
  - Form-wide validation before submission

#### Read/List Transformers

- **Display Features**:
  - Data table with sorting capabilities
  - Statistics cards showing:
    - Total transformers
    - Bulk type count
    - Distribution type count
    - Regions covered
  - Search and filter capabilities

#### Update Transformer

- Pre-populated form with existing data
- Same validation as create operation
- Updates reflected immediately

#### Delete Transformer

- Confirmation dialog to prevent accidental deletion
- Cascade considerations (images, inspections)

---

### 2. Image Upload System

#### Baseline Images

**Purpose**: Establish reference state for healthy transformers.

**Upload Process**:

1. Select transformer from dropdown
2. Choose image type: BASELINE
3. Provide environmental conditions:
   - Weather (SUNNY, CLOUDY, RAINY)
   - Temperature (°C) - optional
   - Humidity (%) - optional
   - Location notes - optional
4. Enter uploader name (required)
5. Drag-and-drop or click to select thermal image
6. Preview image before upload
7. Submit to backend

**Technical Details**:

- File validation (image types only)
- Preview generation using FileReader API
- Multipart form data submission
- Metadata sent as JSON blob
- File sent as binary blob

#### Maintenance Images

**Purpose**: Capture current state during inspections for comparison.

**Upload Process**:

1. Navigate to specific inspection
2. Click "Upload Maintenance" button
3. Select image file
4. Provide uploader information
5. Submit (no environmental data required)

**Key Difference from Baseline**:

- Linked to specific inspection record
- No environmental conditions required
- Triggers automatic AI analysis

---

### 3. Inspection Management

#### Creating Inspections

**Fields**:

- **Title** (required, min 3 characters) - Description of inspection
- **Inspector** (required) - Person conducting inspection
- **Notes** (optional) - Additional observations
- **Status** (required) - OPEN, IN_PROGRESS, CLOSED

**Workflow**:

1. Navigate to transformer's inspection page
2. Click "Create New Inspection"
3. Fill in form with validation
4. Submit to create inspection record

#### Inspection States

- **OPEN**: Newly created, awaiting action
- **IN_PROGRESS**: Currently being conducted
- **CLOSED**: Completed and archived

#### Statistics Dashboard

Real-time counts of:

- Total inspections
- Open inspections
- In-progress inspections
- Completed inspections

---

### 4. Image Comparison & Analysis

#### Comparison View

**Layout**: Side-by-side display

- **Left Panel**: Baseline image (reference)
- **Right Panel**: Maintenance image(s) (current state)

#### Navigation Features

- **Multiple Maintenance Images**: Navigate using arrow buttons
- **Index Display**: Shows "1/N" current image position
- **Image Metadata**: Displays capture timestamp

#### Baseline Image Selection Logic

```javascript
// Get all images for transformer
// Filter by imageType === "BASELINE"
// Sort by createdAt (newest first)
// Select most recent baseline
```

#### Maintenance Image Filtering

```javascript
// Get all images for transformer
// Filter by imageType === "MAINTENANCE"
// Filter by inspectionId match
// Sort by createdAt (newest first)
```

---

### 5. AI Anomaly Detection System

#### Automatic Analysis

**Trigger**: Maintenance image upload

**Process**:

1. Backend receives image
2. Classification server analyzes thermal patterns
3. AI detects potential anomalies
4. Results saved to database automatically
5. Frontend polls/loads detection results

#### Detection States

**Visual Indicators**:

- **Running**: Blue chip with spinner - "AI analysis: running"
- **Done**: Green chip - "AI analysis: done"
- **Error**: Red chip - "AI analysis: error"

#### Anomaly Classifications

1. **FAULTY** (Red)

   - Confirmed issues requiring immediate attention
   - Temperature anomalies exceeding thresholds
   - Visual: Red bounding boxes

2. **POTENTIAL** (Yellow)

   - Suspicious areas requiring review
   - Minor temperature variations
   - Visual: Yellow bounding boxes

3. **NORMAL** (Green)
   - No anomalies detected
   - Transformer operating within parameters

#### AI Detection Data Structure

```javascript
{
  regionId: 123,           // Unique error ID
  cx: 0.45,               // Center X (normalized 0-1)
  cy: 0.62,               // Center Y (normalized 0-1)
  w: 0.15,                // Width (normalized 0-1)
  h: 0.12,                // Height (normalized 0-1)
  status: "FAULTY",       // FAULTY or POTENTIAL
  label: "Hotspot",       // Optional classification
  confidence: 0.87,       // AI confidence score (0-1)
  colorRgb: [255, 0, 0], // RGB values
  isManual: false,        // AI-detected = false
  timestamp: "2025-10-26T10:30:00Z",
  createdBy: "ai-system"
}
```

---

### 6. Manual Error Annotation

#### Drawing New Errors

**Tool**: `ErrorDrawDialog` component

**Process**:

1. Click "Add Error" button on compare page
2. Dialog opens with canvas overlay
3. Click and drag to draw rectangle around error
4. Rectangle drawn with color based on selected status
5. Fill in error details:
   - Status (FAULTY or POTENTIAL)
   - Comment (optional notes)
   - User ID (auto-filled from logged-in user)
6. Save to database

**Canvas Drawing Features**:

- **Crosshair Cursor**: Precision drawing
- **Real-time Preview**: See rectangle as you draw
- **Dashed Lines**: During drawing
- **Solid Lines**: After release
- **Color Coding**: Red for FAULTY, Yellow for POTENTIAL
- **Existing Errors Display**: Shows all previously marked errors
- **Reset Button**: Clear current drawing

**Coordinate System**:

```javascript
// Render coordinates (canvas pixels)
→ Convert to natural image coordinates
→ Save as normalized (0-1) coordinates
```

#### Editing Existing Errors

**Tool**: `ErrorBoxEditDialog` component

**Features**:

1. **Visual Box Adjustment**:

   - Drag to reposition
   - Resize handles (corners and edges)
   - Real-time coordinate updates

2. **Editable Fields**:

   - Status (FAULTY ↔ POTENTIAL)
   - Comment text
   - Box dimensions (manual input)

3. **Metadata Tracking**:
   - `lastModifiedBy`: Current user
   - `lastModifiedAt`: Timestamp
   - `isManual`: Set to `true`

#### Deleting Errors

**Soft Delete System**:

```javascript
// Mark as deleted (not removed from database)
{
  ...error,
  isDeleted: true,
  deletedAt: "2025-10-26T11:00:00Z"
}
```

**Visual Indicators**:

- Grayed out in error list
- "DELETED" chip badge
- Dashed red border
- Not displayed on image overlay
- Deletion timestamp shown

---

### 7. Model Training System

#### Purpose

Continuously improve AI detection accuracy using user corrections.

#### Training Triggers

**Manual Training**:

- Click "Train Model" button
- Sends current annotations to backend
- Updates ML model with corrections

**Auto-Training**:

- Toggle switch to enable/disable
- Saves preference to `localStorage`
- Automatically trains when navigating away from page
- Only triggers if unsaved edits exist

#### Training Process

```javascript
// Request Body
{
  transformerId: 123,
  baselineImageId: 456,
  maintenanceImageId: 789
}

// Backend Actions
1. Load baseline and maintenance images
2. Load all annotations (AI + manual)
3. Generate training data
4. Retrain classification model
5. Update model weights
```

#### Edit Tracking

**State Management**:

```javascript
const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);

// Set to true on:
- Add new error
- Edit existing error
- Delete error

// Reset to false on:
- Successful training
```

#### Training Button States

- **Enabled**: When `hasUnsavedEdits === true`
- **Disabled**: When no changes or training in progress
- **Loading**: Shows spinner during training

---

### 8. Download & Export

#### Anomaly Comparison Download

**Feature**: Export detailed comparison data

**Format**: JSON file

```json
{
  "imageId": 789,
  "transformerId": 123,
  "inspectionId": 45,
  "baselineImage": {
    "id": 456,
    "filename": "baseline_123.jpg",
    "uploadDate": "2025-01-15T10:00:00Z",
    "envCondition": {
      "weather": "SUNNY",
      "temperatureC": 28,
      "humidity": 65
    }
  },
  "maintenanceImage": {
    "id": 789,
    "filename": "maintenance_123.jpg",
    "uploadDate": "2025-10-26T09:30:00Z"
  },
  "anomalies": [
    {
      "regionId": 1,
      "status": "FAULTY",
      "cx": 0.45,
      "cy": 0.62,
      "w": 0.15,
      "h": 0.12,
      "confidence": 0.87,
      "isManual": false,
      "createdBy": "ai-system"
    }
  ],
  "summary": {
    "totalAnomalies": 3,
    "faultyCount": 1,
    "potentialCount": 2,
    "normalStatus": false
  }
}
```

**Usage**:

1. Click "Download" button on compare page
2. Browser downloads JSON file
3. Filename: `anomaly-comparison-image-{imageId}.json`

---

## Page-by-Page Breakdown

### 1. TransformersPage (Home/Landing)

**Route**: `/`

**Purpose**: Main dashboard for transformer inventory management.

#### Visual Layout

**Header Section**:

- Gradient card (blue gradient)
- Title: "Transformer Management"
- Subtitle: Management description
- Logged-in user display
- Action buttons:
  - **Logout**: Return to login
  - **Refresh**: Reload transformer list
  - **Add Transformer**: Open creation dialog

**Statistics Cards** (4 cards in grid):

1. **Total Transformers**

   - Icon: Grid3x3
   - Blue gradient background
   - Shows total count

2. **Bulk Type**

   - Icon: Apartment
   - Orange gradient background
   - Count of BULK transformers

3. **Distribution Type**

   - Icon: ElectricalServices
   - Red-orange gradient
   - Count of DISTRIBUTION transformers

4. **Regions Covered**
   - Icon: Map
   - Green gradient
   - Unique region count

**Filter Section**:

- **Search Bar**: Text search across all fields
- **Region Dropdown**: Filter by region
- **Type Dropdown**: Filter by transformer type

**Data Table**:

- Columns:
  - Transformer No.
  - Pole No.
  - Region
  - Type
  - Actions (View Image, Edit, Delete)

#### Interactions

**Row Click**: Navigate to inspection page
**View Image Button**:

- Fetches latest baseline image
- Opens preview dialog
- Shows full-size thermal image

**Edit Button**:

- Opens transformer form dialog
- Pre-fills with existing data
- Saves updates on submit

**Delete Button**:

- Opens confirmation dialog
- Warns about permanent deletion
- Removes on confirm

#### State Management

```javascript
const [transformers, setTransformers] = useState([]);
const [loading, setLoading] = useState(false);
const [searchTerm, setSearchTerm] = useState("");
const [selectedRegion, setSelectedRegion] = useState("All");
const [selectedType, setSelectedType] = useState("All");
```

#### Data Loading

```javascript
// On component mount
useEffect(() => {
  load();
}, []);

// Load function
const load = async (withSpinner = true) => {
  try {
    if (withSpinner) setLoading(true);
    const res = await getTransformers();
    setTransformers(res.data || []);
  } catch (e) {
    show(e?.response?.data?.error || "Failed to load transformers", "error");
  } finally {
    if (withSpinner) setLoading(false);
  }
};
```

#### Filtering Logic

```javascript
const filtered = useMemo(() => {
  let arr = transformers;

  // Text search
  if (searchTerm) {
    arr = arr.filter((t) =>
      [t.transformerNo, t.poleNo, t.region, t.transformerType].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }

  // Region filter
  if (selectedRegion !== "All") {
    arr = arr.filter((t) => t.region === selectedRegion);
  }

  // Type filter
  if (selectedType !== "All") {
    arr = arr.filter((t) => t.transformerType === selectedType);
  }

  // Natural sort by transformerNo
  return arr.sort((a, b) =>
    a.transformerNo.localeCompare(b.transformerNo, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}, [transformers, searchTerm, selectedRegion, selectedType]);
```

---

### 2. ImageUploadPage

**Route**: `/upload`

**Purpose**: Centralized upload interface for baseline and maintenance images.

#### Layout (2-Column Grid)

**Left Column - Image Details**:

1. **Transformer Selection**

   - Dropdown with all transformers
   - Shows: Transformer No., Pole No., Region
   - Visual icon indicators

2. **Selected Transformer Chips**

   - Primary chip: Transformer number
   - Outlined chips: Pole, Region

3. **Image Type Selection**

   - Baseline Image (with CheckCircle icon)
   - Maintenance Image (with ThermostatAuto icon)

4. **Environmental Conditions** (Baseline only):

   - Weather dropdown (SUNNY, CLOUDY, RAINY)
   - Temperature input (°C)
   - Humidity input (%)
   - Location notes (textarea)

5. **Uploader Field**
   - Required text input
   - Person icon prefix

**Right Column - File Upload**:

- **FileDropZone Component**:
  - Drag-and-drop zone
  - Click to browse
  - Image preview after selection
- **Upload Button**
  - Disabled until valid
  - Progress bar during upload

#### Upload Process Flow

```javascript
1. User selects transformer
2. User selects image type
3. If BASELINE:
   a. Fill environmental conditions
4. User enters uploader name
5. User selects image file
6. Preview displays
7. Click "Upload"
8. FormData created:
   - meta: JSON blob with metadata
   - file: binary image file
9. POST to /api/transformers/{id}/images
10. Success notification
11. Form resets
```

#### Error Handling

- Missing transformer: "Please select transformer"
- Missing file: "Please select image file"
- Missing uploader: "Please enter uploader name"
- Baseline without weather: "Baseline requires weather"
- Upload failure: Display backend error message

---

### 3. TransformerInspectionsPage

**Route**: `/transformers/:id/inspections`

**Purpose**: Manage inspection records for a specific transformer.

#### URL Parameters

- **id**: Transformer ID from route

#### State Sources

```javascript
// Fast initial render from navigation state
const locationState = useLocation().state;
const [transformer, setTransformer] = useState(locationState?.transformer);

// Fallback: Fetch from API if not in state
useEffect(() => {
  if (!transformer) {
    getTransformer(id).then((res) => setTransformer(res.data));
  }
}, [id, transformer]);
```

#### Visual Sections

**1. Breadcrumb Navigation**

```
Transformers > Inspections
```

- Click "Transformers" → Navigate to home
- "Inspections" → Current page (not clickable)

**2. Header Actions**

- **Back Button**: Return to previous page
- **Upload Baseline**: Open baseline upload dialog
- **Create New Inspection**: Open inspection form

**3. Transformer Information Card**

- Purple gradient background
- Avatar icon
- Transformer details:
  - Transformer No.
  - ID and Type
  - Pole, Region, Type (as chips)

**4. Statistics Grid** (4 cards):

- Total Inspections (Blue)
- Open (Light Blue)
- In Progress (Orange)
- Completed (Green)

**5. Inspection List**

- Card with search and filter
- Search by title, inspector, notes
- Filter by status (ALL, OPEN, IN_PROGRESS, CLOSED)

#### Inspection List Item

**Display**:

- Title (bold)
- Inspector name
- Notes (if present)
- Status badge

**Actions**:

- **Upload Maintenance**: Opens maintenance upload dialog
- **Compare**: Navigate to comparison page
- **Delete**: Opens confirmation dialog

#### Dialogs

**Create Inspection Dialog**:

- Fields:
  - Title (required, min 3 chars)
  - Inspector (required)
  - Notes (optional)
  - Status (dropdown)
- Validation:
  - Real-time field validation
  - Error messages below fields
- Submit → POST /api/transformers/{id}/inspections

**Baseline Upload Dialog**:

- Same as ImageUploadPage baseline section
- Pre-filled transformer ID
- On success: Reload inspection data

**Maintenance Upload Dialog**:

- Similar to baseline but simpler
- No environmental conditions
- Linked to specific inspection
- Auto-triggers AI analysis

**Delete Confirmation**:

- Warning message with inspection title
- Cancel or Confirm buttons
- On confirm: DELETE /api/transformers/{id}/inspections/{inspectionId}

---

### 4. ComparePage (Most Complex)

**Route**: `/transformers/:id/inspections/:inspectionId/compare`

**Purpose**: Side-by-side comparison of baseline and maintenance images with AI analysis.

#### URL Parameters

- **id**: Transformer ID
- **inspectionId**: Inspection ID

#### Page Loading Sequence

```javascript
1. Extract id and inspectionId from URL
2. Check location.state for pre-loaded data
3. Parallel API calls:
   a. getTransformer(id) - if not in state
   b. getInspections(id) - to find specific inspection
   c. getImages(id) - to get all images
4. Process images:
   a. Filter BASELINE images
   b. Sort by createdAt (newest first)
   c. Select latest as baseline
   d. Filter MAINTENANCE images by inspectionId
   e. Sort by createdAt
5. Load AI detections:
   a. For each maintenance image
   b. GET /api/transformers/images/{imageId}/errors
   c. Store in boxesById state object
6. Set analysis status for each image
7. Render UI
```

#### Layout Structure

**Breadcrumb**:

```
Transformers > Inspections > Compare
```

**Header**:

- Back button
- Page title: "Compare: {inspection title}"

**Transformer Info Card**:

- Same style as inspections page
- Shows current transformer details

**Image Comparison Section** (2 columns):

**Left Panel - Baseline**:

- Title: "Baseline"
- ZoomableImageWithBoxes component
- No overlay boxes (reference image)
- Status badge: "AI analysis: disabled"
- Capture timestamp

**Right Panel - Maintenance**:

- Title: "Maintenance (1/N)"
- Navigation arrows (previous/next)
- ZoomableImageWithBoxes component
- Overlay boxes for detected errors
- Status badges:
  - "AI analysis: running" (blue, with spinner)
  - "AI analysis: done" (green)
  - Anomaly status (FAULTY/POTENTIAL/NORMAL)
- Capture timestamp

#### Image Viewer Features

**ZoomableImageWithBoxes Component**:

**Pan & Zoom**:

- Mouse wheel: Zoom in/out (cursor-centric)
- Click and drag: Pan around zoomed image
- Min zoom: 1x (fit to viewport)
- Max zoom: 8x
- Zoom step: 1.2x per scroll

**Fit-to-Container**:

- Image scales to fit 360px height viewport
- Maintains aspect ratio (object-fit: contain)
- Centered horizontally and vertically

**Overlay Rendering**:

```javascript
// For each error box:
1. Convert normalized coords (0-1) to pixel coords
2. Calculate render position based on scale
3. Draw rectangle:
   - Border: 2px solid (red or yellow)
   - Fill: Semi-transparent (rgba)
4. Draw number badge:
   - Circle with index number
   - Positioned at top-left of box
   - Color matches box (red or yellow)
```

**Controls (Top-Right)**:

- Zoom Out button (disabled at min zoom)
- Zoom In button
- Reset View button (return to 1x zoom, centered)

**Badges (Top-Left)**:

- AI analysis status
- Anomaly classification (after analysis)

#### Error List Section

**"Detected Errors" Panel**:

**Header Actions**:

- **Download Button**:
  - Downloads JSON comparison data
  - Shows spinner during download
- **Auto-train Toggle**:
  - Switch to enable/disable
  - Saved to localStorage
  - Label: "Auto-train"
- **Train Model Button**:

  - Disabled if no unsaved edits
  - Shows spinner during training
  - Manual training trigger

- **Add Error Button**:
  - Opens error drawing dialog
  - Only visible when maintenance images exist

**Error List Items**:

Each error displayed as a card with:

- **Badges**:

  - Index number (#1, #2, etc.)
  - Status (FAULTY or POTENTIAL)
  - Annotation type (ADDED, EDITED) if manual
  - Label (if AI provided)
  - Confidence percentage (if AI-detected)
  - Color dot (red or yellow)

- **Coordinates**:

  - Displayed as percentages (normalized)
  - Format: `cx=45.0%, cy=62.0%, w=15.0%, h=12.0%`
  - Type: "box" or "point"

- **Actions**:

  - Edit button: Opens box editor
  - Delete button: Soft deletes error

- **Comment Section** (if present):

  - Left border accent
  - Comment icon
  - Comment text

- **Metadata**:
  - Last modified timestamp and user
  - Created timestamp and creator
  - Deletion timestamp (if deleted)

**Deleted Errors**:

- Grayed out background (red tint)
- Reduced opacity (0.6)
- Dashed red border
- "DELETED" chip badge
- Not rendered on image
- Shows deletion timestamp

#### Error Annotation Workflow

**Adding New Error**:

```javascript
1. Click "Add Error"
2. ErrorDrawDialog opens
3. Canvas displays maintenance image
4. User clicks and drags rectangle
5. Dashed preview shown during drag
6. Solid rectangle shown on mouse up
7. Fill in form:
   - Status: FAULTY or POTENTIAL
   - Comment: Free text
   - User ID: Auto-filled (read-only)
8. Click "Save Error"
9. Convert canvas coords to normalized coords
10. POST /api/transformers/images/{imageId}/errors
11. Add to local state with server response
12. Mark hasUnsavedEdits = true
13. Close dialog
14. Update UI with new box
```

**Editing Existing Error**:

```javascript
1. Click Edit icon on error card
2. ErrorBoxEditDialog opens
3. Canvas shows image with current box highlighted
4. Options:
   a. Drag box to move
   b. Drag corner handles to resize
   c. Manual input for precise coords
5. Edit form fields:
   - Status dropdown
   - Comment textarea
6. Click "Save"
7. PUT /api/transformers/images/{imageId}/errors/{errorId}
8. Update local state
9. Mark hasUnsavedEdits = true
10. Close dialog
11. UI updates immediately
```

**Deleting Error**:

```javascript
1. Click Delete icon
2. Soft delete (not removed from DB)
3. DELETE /api/transformers/images/{imageId}/errors/{errorId}
4. Server marks isDeleted = true
5. Update local state
6. Mark hasUnsavedEdits = true
7. UI shows as deleted (grayed out)
```

#### Training System

**Manual Training**:

```javascript
1. User makes edits (add/edit/delete errors)
2. hasUnsavedEdits becomes true
3. "Train Model" button becomes enabled
4. User clicks "Train Model"
5. POST /api/transformers/{transformerId}/train
   Body: {
     transformerId,
     baselineImageId,
     maintenanceImageId
   }
6. Backend:
   a. Loads images and all annotations
   b. Generates training dataset
   c. Retrains classification model
   d. Updates model weights
7. Success notification
8. hasUnsavedEdits reset to false
```

**Auto-Training**:

```javascript
// On component unmount (navigation away)
useEffect(() => {
  return () => {
    if (autoTrain && hasUnsavedEdits) {
      trainModel(transformerId, {
        transformerId,
        baselineImageId,
        maintenanceImageId
      });
    }
  };
}, [autoTrain, hasUnsavedEdits, ...dependencies]);

// Triggers when:
- User navigates to another page
- User closes browser tab
- User refreshes page
```

#### State Management

**Key State Variables**:

```javascript
const [transformer, setTransformer] = useState(null);
const [inspection, setInspection] = useState(null);
const [baseline, setBaseline] = useState(null);
const [maint, setMaint] = useState([]); // Array of maintenance images
const [idx, setIdx] = useState(0); // Current maintenance image index

// Error boxes by image ID
const [boxesById, setBoxesById] = useState({
  123: [{ ...error1 }, { ...error2 }],
  456: [{ ...error3 }],
});

// Analysis status by image ID
const [analysisById, setAnalysisById] = useState({
  123: { status: "done", anomaly: "FAULTY" },
  456: { status: "running", anomaly: undefined },
});

// Dialog states
const [drawDialogOpen, setDrawDialogOpen] = useState(false);
const [boxEditDialogOpen, setBoxEditDialogOpen] = useState(false);
const [selectedErrorIndex, setSelectedErrorIndex] = useState(null);

// Training states
const [hasUnsavedEdits, setHasUnsavedEdits] = useState(false);
const [autoTrain, setAutoTrain] = useState(false);
const [isTraining, setIsTraining] = useState(false);
const [isDownloading, setIsDownloading] = useState(false);
```

---

## Component System

### Core Components

#### 1. TransformerFormDialog

**File**: `src/components/TransformerFormDialog.jsx`

**Purpose**: Create or edit transformer records.

**Props**:

```javascript
{
  open: boolean,                    // Dialog visibility
  mode: "create" | "edit",         // Form mode
  initialValues: {                  // Pre-fill data
    transformerNo, poleNo,
    region, transformerType
  },
  regions: string[],               // Available regions
  types: string[],                 // Available types
  loading: boolean,                // Submit in progress
  onClose: () => void,             // Cancel handler
  onSubmit: (data) => void         // Save handler
}
```

**Features**:

- **Gradient Header**: Purple gradient with mode-specific icon
- **Real-time Validation**: Error messages as user types
- **Preview Card**: Shows how transformer will appear
- **Region Info**: Icons and descriptions for each region
- **Type Info**: Detailed voltage specifications
- **Visual Feedback**: Checkmarks for valid fields
- **Validation Summary**: List of all current errors
- **Slide Animation**: Smooth entry from bottom

**Validation Rules**:

```javascript
transformerNo:
  - Required
  - Min 3 characters

poleNo:
  - Required

region:
  - Required
  - Must be from predefined list

transformerType:
  - Required
  - Must be BULK or DISTRIBUTION
```

---

#### 2. TransformerTable

**File**: `src/components/TransformerTable.jsx`

**Purpose**: Display transformer list with actions.

**Props**:

```javascript
{
  items: Array,              // Transformer records
  editingId: number,         // Currently editing ID
  onRowClick: (item) => void,
  onOpenImages: (item) => void,
  onEdit: (item) => void,
  onDelete: (item) => void
}
```

**Columns**:

1. Transformer No. (sortable)
2. Pole No.
3. Region (with chip)
4. Type (with colored chip)
5. Actions (IconButtons)

**Row Hover Effect**:

- Background color change
- Elevation increase
- Cursor pointer

---

#### 3. ErrorDrawDialog

**File**: `src/components/dialogs/ErrorDrawDialog.jsx`

**Purpose**: Canvas-based error annotation tool.

**Technical Details**:

**Canvas Setup**:

```javascript
const canvasRef = useRef(null);
const imgRef = useRef(null);

// On image load
const computeLayout = () => {
  const naturalW = img.naturalWidth;
  const naturalH = img.naturalHeight;

  // Scale to max 800x600
  const maxW = 800,
    maxH = 600;
  const scale = Math.min(maxW / naturalW, maxH / naturalH, 1);

  const renderW = naturalW * scale;
  const renderH = naturalH * scale;

  canvas.width = renderW;
  canvas.height = renderH;
};
```

**Drawing State Machine**:

```javascript
const [isDrawing, setIsDrawing] = useState(false);
const [startPos, setStartPos] = useState(null); // { x, y }
const [currentRect, setCurrentRect] = useState(null); // Active drag
const [drawnRect, setDrawnRect] = useState(null); // Final rect

// Mouse down → Set isDrawing, capture start pos
// Mouse move → Update currentRect with current cursor pos
// Mouse up   → Finalize drawnRect, clear currentRect
```

**Rendering Layers**:

```javascript
1. Base layer: Thermal image
2. Existing errors: Semi-transparent boxes with badges
3. Current drag: Dashed rectangle
4. Final rectangle: Solid colored box
```

**Coordinate Conversion**:

```javascript
// Canvas coords → Natural coords → Normalized coords
const canvasX = e.clientX - canvas.getBoundingClientRect().left;
const naturalX = canvasX * (naturalW / renderW);
const normalizedX = naturalX / naturalW; // 0-1 range
```

---

#### 4. ErrorBoxEditDialog

**File**: `src/components/dialogs/ErrorBoxEditDialog.jsx`

**Purpose**: Edit error box position, size, and metadata.

**Features**:

- **Visual Editor**: Drag to move, resize handles
- **Coordinate Inputs**: Precise numeric entry
- **Status Dropdown**: FAULTY ↔ POTENTIAL
- **Comment Editor**: Multi-line text area
- **Preview**: Real-time box updates on canvas

**Resize Handles**:

- 4 corners
- 4 edges (top, right, bottom, left)
- Cursor changes on hover
- Drag to adjust dimensions

---

#### 5. BaselineUploadDialog

**File**: `src/components/dialogs/BaselineUploadDialog.jsx`

**Purpose**: Upload baseline image with environmental data.

**Props**:

```javascript
{
  open: boolean,
  transformerId: number,
  onClose: () => void,
  onUploaded: () => void     // Callback after success
}
```

**Form Fields**:

- Uploader (text, required)
- Weather (dropdown, required)
  - Icons: WbSunny, Cloud, Umbrella
- Temperature (number, optional)
- Humidity (number, optional)
- Location Note (textarea, optional)
- Image File (FileDropZone, required)

**Submission**:

```javascript
const formData = new FormData();
formData.append(
  "meta",
  new Blob(
    [
      JSON.stringify({
        imageType: "BASELINE",
        uploader: "...",
        envCondition: { weather, temperatureC, humidity, locationNote },
      }),
    ],
    { type: "application/json" }
  )
);
formData.append("file", imageFile);

POST / api / transformers / { transformerId } / images;
```

---

#### 6. MaintenanceUploadDialog

**File**: `src/components/dialogs/MaintenanceUploadDialog.jsx`

**Purpose**: Upload maintenance image for specific inspection.

**Simplified Form** (vs Baseline):

- No environmental conditions
- Pre-linked to inspection
- Auto-triggers AI analysis

**Props**:

```javascript
{
  open: boolean,
  transformerId: number,
  inspection: object,        // Current inspection record
  onClose: () => void,
  onUploaded: () => void
}
```

---

#### 7. FileDropZone

**File**: `src/components/upload/FileDropZone.jsx`

**Purpose**: Drag-and-drop file input area.

**Features**:

- **Drag Highlight**: Border color change on drag over
- **File Validation**: Only accept image types
- **Click to Browse**: Hidden file input triggered
- **Visual States**:
  - Default: Dashed border, upload icon
  - Drag over: Solid border, highlighted
  - File selected: Preview image displayed

**Events**:

```javascript
onDragEnter  → Add highlight
onDragOver   → Prevent default
onDragLeave  → Remove highlight
onDrop       → Handle file, remove highlight
onClick      → Trigger file input
```

---

#### 8. DeleteConfirmDialog

**File**: `src/components/common/DeleteConfirmDialog.jsx`

**Purpose**: Confirmation for destructive actions.

**Props**:

```javascript
{
  open: boolean,
  title: string,           // "Delete Transformer"
  description: string,     // Warning message
  loading: boolean,        // Delete in progress
  onCancel: () => void,
  onConfirm: () => void
}
```

**Visual**:

- Warning icon (red)
- Bold title
- Detailed description
- Two buttons:
  - Cancel (outlined, gray)
  - Delete (contained, red)

---

#### 9. EmptyState

**File**: `src/components/EmptyState.jsx`

**Purpose**: Placeholder when no data exists.

**Props**:

```javascript
{
  title: string,           // "No transformers yet"
  subtitle: string,        // Helper text
  actionText: string,      // Button label
  onAction: () => void     // Button click handler
}
```

**Visual**:

- Large icon (InboxIcon)
- Title text
- Subtitle text
- Call-to-action button

---

#### 10. StatCard

**File**: Embedded in `TransformersPage.jsx`

**Purpose**: Animated statistic display card.

**Features**:

- **Gradient Background**: Custom per card
- **Glass Effect**: Backdrop blur, semi-transparent
- **Hover Animation**: Lift effect (translateY)
- **Icon Container**: Rounded with glass effect
- **Large Number**: Bold, prominent
- **Label Text**: Secondary, smaller

**Props**:

```javascript
{
  title: string,          // "Total Transformers"
  value: number,          // 42
  icon: ReactElement,     // <Grid3x3 />
  gradient: string,       // CSS gradient
  accent: string         // Border accent color
}
```

---

### Custom Hooks

#### useSnackbar

**File**: `src/hooks/useSnackbar.js`

**Purpose**: Simplified notification system.

**Returns**:

```javascript
{
  snackbar: {
    open: boolean,
    message: string,
    severity: "success" | "error" | "warning" | "info"
  },
  show: (message, severity?) => void,
  close: () => void
}
```

**Usage**:

```javascript
const { snackbar, show, close } = useSnackbar();

show("Transformer created successfully");
show("Failed to load data", "error");

// JSX
<Snackbar open={snackbar.open} onClose={close}>
  <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
</Snackbar>;
```

---

## API Integration

### Base Configuration

**File**: `src/api/axiosClient.js`

```javascript
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // http://localhost:8080/api
  withCredentials: false,
});

// Response interceptor
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error("API error:", err?.response?.status, err?.response?.data);
    return Promise.reject(err);
  }
);
```

**Environment Variable**:

```env
VITE_API_URL=http://localhost:8080/api
```

---

### Service Layer

**File**: `src/services/transformerService.js`

#### Transformer Endpoints

```javascript
getTransformers(); // GET /api/transformers
createTransformer(data); // POST /api/transformers
updateTransformer(id, data); // PUT /api/transformers/{id}
deleteTransformer(id); // DELETE /api/transformers/{id}
getTransformer(id); // GET /api/transformers/{id}
```

#### Inspection Endpoints

```javascript
getInspections(transformerId); // GET /api/transformers/{id}/inspections
createInspection(transformerId, data); // POST /api/transformers/{id}/inspections
deleteInspection(transformerId, inspectionId);
// DELETE /api/transformers/{id}/inspections/{inspectionId}
```

#### Image Endpoints

```javascript
getImages(transformerId); // GET /api/transformers/{id}/images
uploadImage(transformerId, formData); // POST /api/transformers/{id}/images
buildImageRawUrl(imageId); // Helper: /api/transformers/images/{id}/raw
```

#### Error Management Endpoints

```javascript
saveError(imageId, errorData); // POST /api/transformers/images/{imageId}/errors
updateError(imageId, errorId, data); // PUT /api/transformers/images/{imageId}/errors/{errorId}
deleteError(imageId, errorId); // DELETE /api/transformers/images/{imageId}/errors/{errorId}
getErrors(imageId); // GET /api/transformers/images/{imageId}/errors
```

#### Training Endpoint

```javascript
trainModel(transformerId, data); // POST /api/transformers/{transformerId}/train
```

#### Download Endpoint

```javascript
downloadAnomalyComparison(imageId);
// GET /api/transformers/images/{imageId}/anomaly-comparison
// responseType: 'blob'
```

---

### API Response Formats

#### Transformer Response

```json
{
  "id": 1,
  "transformerNo": "TF-001",
  "poleNo": "POLE-123",
  "region": "Colombo",
  "transformerType": "BULK",
  "createdAt": "2025-01-15T10:00:00Z",
  "updatedAt": "2025-01-15T10:00:00Z"
}
```

#### Inspection Response

```json
{
  "id": 45,
  "transformerId": 1,
  "title": "Monthly Inspection - October",
  "inspector": "John Smith",
  "notes": "Routine check",
  "status": "OPEN",
  "createdAt": "2025-10-01T09:00:00Z",
  "updatedAt": "2025-10-01T09:00:00Z"
}
```

#### Image Response

```json
{
  "id": 789,
  "transformerId": 1,
  "inspectionId": 45,
  "filename": "thermal_001.jpg",
  "imageType": "MAINTENANCE",
  "uploader": "John Smith",
  "envCondition": {
    "weather": "SUNNY",
    "temperatureC": 28,
    "humidity": 65,
    "locationNote": "Near substation"
  },
  "createdAt": "2025-10-26T09:30:00Z",
  "uploadDate": "2025-10-26T09:30:00Z"
}
```

#### Error Response

```json
{
  "data": [
    {
      "regionId": 1,
      "imageId": 789,
      "cx": 0.45,
      "cy": 0.62,
      "w": 0.15,
      "h": 0.12,
      "status": "FAULTY",
      "label": "Hotspot",
      "confidence": 0.87,
      "colorRgb": [255, 0, 0],
      "isManual": false,
      "isDeleted": false,
      "comment": null,
      "timestamp": "2025-10-26T10:00:00Z",
      "createdAt": "2025-10-26T10:00:00Z",
      "createdBy": "ai-system",
      "lastModifiedAt": null,
      "lastModifiedBy": null
    }
  ]
}
```

---

## Data Flow & State Management

### Global State (Context)

#### UserContext

**File**: `src/contexts/UserContext.jsx`

**Provides**:

- `currentUser`: Currently logged-in user name
- `login(userName)`: Set user and persist to localStorage
- `logout()`: Clear user from state and localStorage

**Storage**:

```javascript
// On login
localStorage.setItem("currentUser", userName);

// On logout
localStorage.removeItem("currentUser");

// On app load
const storedUser = localStorage.getItem("currentUser");
if (storedUser) setCurrentUser(storedUser);
```

---

### Local State Patterns

#### Loading States

```javascript
const [loading, setLoading] = useState(false);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await api.getData();
    setData(response.data);
  } catch (error) {
    showError(error.message);
  } finally {
    setLoading(false);
  }
};
```

#### Form State

```javascript
const [form, setForm] = useState({
  field1: "",
  field2: "",
  field3: "",
});

const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

const handleChange = (name, value) => {
  setForm((prev) => ({ ...prev, [name]: value }));

  if (touched[name]) {
    const error = validate(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  }
};
```

#### Dialog State

```javascript
const [dialogOpen, setDialogOpen] = useState(false);
const [dialogData, setDialogData] = useState(null);

const openDialog = (data) => {
  setDialogData(data);
  setDialogOpen(true);
};

const closeDialog = () => {
  setDialogOpen(false);
  setDialogData(null);
};
```

---

### Data Fetching Strategies

#### Eager Loading (Pre-fetch)

```javascript
// TransformerInspectionsPage
const locationState = useLocation().state;
const [transformer, setTransformer] = useState(locationState?.transformer);

// Use pre-loaded data immediately, fetch as fallback
useEffect(() => {
  if (!transformer) {
    getTransformer(id).then((res) => setTransformer(res.data));
  }
}, [id, transformer]);
```

#### Lazy Loading (On-demand)

```javascript
// ComparePage
const [boxesById, setBoxesById] = useState({});

const loadDetections = async (imageIds) => {
  const needed = imageIds.filter((id) => !boxesById[id]);

  const results = await Promise.allSettled(needed.map((id) => getErrors(id)));

  const newBoxes = {};
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      newBoxes[needed[i]] = r.value.data;
    }
  });

  setBoxesById((prev) => ({ ...prev, ...newBoxes }));
};
```

#### Polling (Real-time Updates)

```javascript
useEffect(() => {
  const interval = setInterval(() => {
    loadAnalysisStatus(imageId);
  }, 3000); // Poll every 3 seconds

  return () => clearInterval(interval);
}, [imageId]);
```

---

### Optimistic Updates

```javascript
const handleDelete = async (item) => {
  // Optimistically remove from UI
  setItems((prev) => prev.filter((i) => i.id !== item.id));

  try {
    await deleteItem(item.id);
    show("Deleted successfully");
  } catch (error) {
    // Revert on error
    setItems((prev) => [...prev, item].sort((a, b) => a.id - b.id));
    show("Delete failed", "error");
  }
};
```

---

## Advanced Features

### 1. Natural Sorting

**Problem**: Transformer numbers like "TF-1", "TF-2", "TF-10" sort incorrectly as strings.

**Solution**:

```javascript
transformers.sort((a, b) => {
  return a.transformerNo.localeCompare(b.transformerNo, undefined, {
    numeric: true, // Treat numbers as numbers
    sensitivity: "base", // Case-insensitive
  });
});

// Result:
// "TF-1", "TF-2", "TF-10" (correct)
// Not: "TF-1", "TF-10", "TF-2" (wrong)
```

---

### 2. Memoization (Performance)

**useMemo for Filtering**:

```javascript
const filtered = useMemo(() => {
  let arr = transformers;

  // Apply filters
  if (searchTerm) {
    arr = arr.filter(/* ... */);
  }

  // Sort
  return arr.sort(/* ... */);
}, [transformers, searchTerm, selectedRegion, selectedType]);

// Only recomputes when dependencies change
```

**Benefits**:

- Prevents unnecessary recalculations
- Improves rendering performance
- Reduces CPU usage on re-renders

---

### 3. Debounced Search

**Implementation**:

```javascript
import { useState, useEffect } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
const [searchTerm, setSearchTerm] = useState("");
const debouncedSearch = useDebounce(searchTerm, 300);

useEffect(() => {
  // API call with debouncedSearch
}, [debouncedSearch]);
```

**Note**: Currently not implemented but recommended for production.

---

### 4. Image Optimization

**Lazy Loading**:

```javascript
<img
  src={imageUrl}
  alt="..."
  loading="lazy" // Browser-native lazy loading
/>
```

**Responsive Images**:

```javascript
// Backend should provide multiple sizes
<img
  src={imageUrl}
  srcSet={`
    ${thumbnailUrl} 400w,
    ${mediumUrl} 800w,
    ${largeUrl} 1200w
  `}
  sizes="(max-width: 600px) 400px, (max-width: 900px) 800px, 1200px"
/>
```

---

### 5. Error Boundaries

**Recommended** (not currently implemented):

```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

// Wrap pages
<ErrorBoundary>
  <ComparePage />
</ErrorBoundary>;
```

---

### 6. Accessibility Features

**Keyboard Navigation**:

```javascript
<Button
  onClick={handleAction}
  onKeyPress={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      handleAction();
    }
  }}
>
  Action
</Button>
```

**ARIA Labels**:

```javascript
<IconButton aria-label="Delete transformer" onClick={handleDelete}>
  <Delete />
</IconButton>
```

**Focus Management**:

```javascript
const inputRef = useRef(null);

useEffect(() => {
  if (dialogOpen) {
    inputRef.current?.focus();
  }
}, [dialogOpen]);
```

---

### 7. Progressive Enhancement

**Canvas Fallback**:

```javascript
<canvas ref={canvasRef}>
  {/* Fallback content if canvas not supported */}
  <img src={imageSrc} alt="..." />
</canvas>
```

**Feature Detection**:

```javascript
if ("IntersectionObserver" in window) {
  // Use intersection observer
} else {
  // Fallback to scroll events
}
```

---

### 8. Responsive Design

**Breakpoints** (Material-UI):

```javascript
// xs: 0px
// sm: 600px
// md: 900px
// lg: 1200px
// xl: 1536px

<Stack
  direction={{ xs: "column", md: "row" }}
  spacing={{ xs: 1, sm: 2, md: 3 }}
>
  {/* Content */}
</Stack>
```

**Responsive Typography**:

```javascript
<Typography
  variant="h4"
  sx={{
    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
  }}
>
  Title
</Typography>
```

---

## Deployment Considerations

### Environment Variables

```env
# .env.production
VITE_API_URL=https://api.production.com/api

# .env.development
VITE_API_URL=http://localhost:8080/api
```

### Build Process

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Production Optimizations

1. **Code Splitting**: Automatic with Vite
2. **Tree Shaking**: Remove unused code
3. **Minification**: Compress JS/CSS
4. **Asset Optimization**: Compress images
5. **Caching**: Set appropriate headers
6. **CDN**: Serve static assets

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Troubleshooting Guide

### Common Issues

#### 1. Images Not Loading

**Symptoms**: Broken image icons, 404 errors

**Solutions**:

- Check `VITE_API_URL` environment variable
- Verify backend is running
- Check CORS configuration
- Inspect network tab in DevTools

#### 2. AI Detection Not Appearing

**Symptoms**: No boxes shown after upload

**Solutions**:

- Check classification server is running
- Verify backend logs for analysis errors
- Ensure image format is supported
- Check database for error records

#### 3. Login Not Persisting

**Symptoms**: Logged out on refresh

**Solutions**:

- Check browser localStorage
- Verify UserContext provider wraps App
- Check for localStorage clearing code

#### 4. Slow Performance

**Symptoms**: Laggy UI, slow rendering

**Solutions**:

- Enable React DevTools Profiler
- Check for unnecessary re-renders
- Optimize large image sizes
- Implement virtualization for long lists

#### 5. Form Validation Not Working

**Symptoms**: Can submit invalid forms

**Solutions**:

- Check validation function logic
- Verify error state updates
- Ensure touched state is set
- Check submit handler validation

---

## Future Enhancements

### Recommended Features

1. **Real Authentication**: JWT tokens, password hashing
2. **Role-Based Access**: Admin, Inspector, Viewer roles
3. **Batch Operations**: Delete multiple transformers
4. **Export Reports**: PDF reports with images and analysis
5. **Image Comparison Slider**: Before/after slider widget
6. **Heatmap Overlay**: Temperature gradient visualization
7. **Mobile App**: React Native companion app
8. **Offline Support**: PWA with service workers
9. **Real-time Collaboration**: WebSocket for live updates
10. **Advanced Search**: Full-text search with filters

### Performance Improvements

1. **Virtual Scrolling**: For large transformer lists
2. **Image Lazy Loading**: Load images as needed
3. **Request Caching**: Cache API responses
4. **Code Splitting**: Route-based splitting
5. **Web Workers**: Offload heavy computations

### UX Enhancements

1. **Keyboard Shortcuts**: Power user features
2. **Dark Mode**: Theme toggle
3. **Customizable Dashboard**: Drag-and-drop widgets
4. **Notification Center**: In-app notification system
5. **Tour Guide**: Interactive onboarding

---

## Conclusion

The Transformer Frontend is a comprehensive, modern React application that provides:

- **Intuitive UI**: Material-UI components with custom styling
- **Powerful Features**: AI-powered anomaly detection with manual corrections
- **Efficient Workflows**: Streamlined inspection and comparison processes
- **Extensible Architecture**: Well-organized, maintainable codebase

This guide covers all major functionalities and serves as a complete reference for developers and users working with the system.

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Maintained By**: TransformerIQ Development Team
