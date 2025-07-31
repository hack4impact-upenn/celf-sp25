# Industry Focus Management

This document describes the new industry focus management feature that allows admins to dynamically manage industry focuses used in speaker profiles and forms.

## Overview

The industry focus management system allows administrators to:
- Add new industry focuses
- Edit existing industry focuses
- Toggle the active/inactive status of industry focuses
- Delete industry focuses
- View all industry focuses in a table format

**No hardcoded industry focuses or areas of expertise are used** - all values are managed dynamically through the admin interface, ensuring data consistency and allowing for easy updates without code changes.

## Backend Implementation

### Database Model
- **File**: `server/src/models/industryFocus.model.ts`
- **Collection**: `industryfocuses`
- **Fields**:
  - `name` (required, unique): The name of the industry focus
  - `description` (optional): A description of the industry focus
  - `isActive` (boolean): Whether the industry focus is active and visible in dropdowns
  - `createdAt` (Date): When the industry focus was created
  - `updatedAt` (Date): When the industry focus was last updated

### API Endpoints

#### Public Endpoints
- `GET /api/industry-focus` - Get all active industry focuses (for dropdowns)

#### Admin Endpoints (require authentication and admin privileges)
- `GET /api/industry-focus/admin` - Get all industry focuses (including inactive)
- `POST /api/industry-focus` - Create a new industry focus
- `PUT /api/industry-focus/:id` - Update an existing industry focus
- `DELETE /api/industry-focus/:id` - Delete an industry focus
- `PATCH /api/industry-focus/:id/toggle` - Toggle the active status

### Controllers
- **File**: `server/src/controllers/industryFocus.controller.ts`
- Contains all CRUD operations for industry focuses

### Routes
- **File**: `server/src/routes/industryFocus.route.ts`
- Defines all API endpoints with proper authentication middleware

## Frontend Implementation

### Admin Management Page
- **File**: `client/src/AdminDashboard/AdminIndustryFocusPage.tsx`
- **Route**: `/admin-industry-focus`
- Features:
  - Table view of all industry focuses
  - Add new industry focus dialog
  - Edit existing industry focus dialog
  - Toggle active/inactive status with switch
  - Delete confirmation dialog
  - Success/error alerts

### API Utilities
- **File**: `client/src/util/industryFocusApi.ts`
- Provides functions to fetch industry focuses from the backend

### Updated Components
The following components now use dynamic industry focuses instead of hardcoded arrays:
- `client/src/Authentication/SpeakerSubmitInfo.tsx`
- `client/src/AdminDashboard/AdminAddSpeakerPage.tsx`

### Navigation
- Added "Industry Focuses" button to the admin sidebar
- **File**: `client/src/components/admin_sidebar/AdminSidebar.tsx`

## Setup Instructions

### 1. Database Setup
Run the seed script to populate the database with initial industry focuses:

```bash
# From the server directory
npx ts-node src/scripts/seedIndustryFocuses.ts
```

### 2. Backend Setup
The backend routes are automatically included in the main router configuration:
- **File**: `server/src/routes/routers.ts`

### 3. Frontend Setup
The frontend routes are automatically included in the main App component:
- **File**: `client/src/App.tsx`

## Usage

### For Admins
1. Navigate to the admin dashboard
2. Click on "Industry Focuses" in the sidebar
3. Use the interface to:
   - Add new industry focuses with the "Add New Industry Focus" button
   - Edit existing focuses by clicking the edit icon
   - Toggle active/inactive status with the switch
   - Delete focuses by clicking the delete icon

### For Users
Industry focuses are automatically loaded in:
- Speaker profile submission forms
- Admin speaker creation forms
- Any other forms that use industry focus dropdowns

## Features

### Active/Inactive Status
- Only active industry focuses appear in user-facing dropdowns
- Admins can see and manage both active and inactive focuses
- Toggle status without deleting the focus

### Validation
- Industry focus names must be unique (case-insensitive)
- Required fields are validated on both frontend and backend
- Proper error handling and user feedback

### Fallback Support
- If the API fails to load industry focuses, forms show an error message and disable submission
- No hardcoded fallback values are used - all industry focuses must be managed through the admin interface
- Ensures data consistency and prevents outdated hardcoded values from being used

## Security
- All admin operations require authentication and admin privileges
- Public endpoint only returns active industry focuses
- Input validation and sanitization on both frontend and backend

## Future Enhancements
Potential improvements for the future:
- Bulk import/export of industry focuses
- Industry focus categories or tags
- Usage analytics (how often each focus is selected)
- Integration with speaker search and filtering 