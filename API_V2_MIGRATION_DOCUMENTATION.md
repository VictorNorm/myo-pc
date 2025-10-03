# API V2 Migration Documentation for PC Frontend

## Overview
This document tracks the complete migration from v1 to v2 API endpoints for the PC frontend application. The migration involves updating all API calls to use the new `/api/v2/` base path and adapting data structures to match the new standardized response format.

## Key Changes in V2 API

### 1. Base URL Pattern
- **Before:** `/endpoint` (e.g., `/users`, `/exercises`)
- **After:** `/api/v2/endpoint` (e.g., `/api/v2/users`, `/api/v2/exercises`)

### 2. Response Structure Standardization
**Before (inconsistent):**
```json
// Sometimes direct data
[{"id": 1, "name": "John"}]
// Sometimes wrapped
{"programs": [...], "message": "Success"}
```

**After (consistent):**
```json
{
  "data": { /* actual response data */ },
  "message": "Success message"
}
```

### 3. Error Response Format
**Before:**
```json
"Error message string" or {"error": "message"}
```

**After:**
```json
{
  "error": "Error type",
  "message": "Error description", 
  "details": "Additional error details"
}
```

### 4. Authentication
- Still uses Bearer tokens in Authorization header
- Headers remain the same: `Authorization: Bearer <token>`

## Migration Checklist

### ✅ Phase 1: Analysis and Documentation
- [x] Read and analyze V2 API documentation
- [x] Create migration plan and tracking document
- [x] Identify all components that need updating

### ✅ Phase 2: Core Infrastructure
- [x] Create standardized API response handler utility (apiV2.js)
- [x] Create V2 API wrapper functions for all endpoints
- [x] Update error handling to use V2 format
- [ ] Update authentication endpoints (/api/v2/login, /api/v2/signup)
- [ ] Update password reset endpoints

### 🔄 Phase 3: High Priority Component Updates
- [x] **CreateProgramWithWorkoutsEnhanced.jsx**
  - [x] Users API: `/users` → `/api/v2/users`
  - [x] Exercise API: `/exercises` → `/api/v2/exercises`
  - [x] Program creation: Updated field names (programName→name, setActive→activateProgram)
  - [x] Handle firstname/lastname field name changes
- [x] **ExerciseSelector.jsx**
  - [x] Exercise API: `/exercises` → `/api/v2/exercises`
  - [x] Updated data handling (no more flattening needed)
- [x] **EditProgramEnhanced.jsx** (Partially Complete)
  - [x] Users API: `/users` → `/api/v2/users`
  - [x] Programs API: `/allprograms` → `/api/v2/programs`
  - [x] Workouts API: `/programs/:id/workouts` → `/api/v2/programs/:id/workouts`
  - [ ] Exercises API: `/workouts/:id/exercises` → `/api/v2/workouts/:id/exercises`
  - [ ] Exercise upsert: Update to V2 format

### 🔄 Phase 4: Medium Priority Components
- [ ] **AddExercisesToWorkout.jsx**
  - [ ] Users API: `/users` → `/api/v2/users`
  - [ ] Programs API: `/allprograms` → `/api/v2/programs`
  - [ ] Exercises API: `/exercises` → `/api/v2/exercises`
  - [ ] Workout exercises: `/workouts/:id/exercises` → `/api/v2/workouts/:id/exercises`
  - [ ] Exercise upsert: `/exercises/upsertExercisesToWorkout` → `/api/v2/exercises/upsertExercisesToWorkout`

### 🔄 Phase 5: Remaining Components  
- [ ] **Clients.jsx**
  - [ ] Users API: `/users` → `/api/v2/users`
  - [ ] User assignment: `/assign-user` → `/api/v2/users/assign`
- [ ] **Programs.jsx**
  - [ ] Users API: `/users` → `/api/v2/users`
  - [ ] Programs API: `/allprograms` → `/api/v2/programs`
- [ ] **Exercises.jsx**
  - [ ] Exercises API: `/exercises` → `/api/v2/exercises`
  - [ ] Muscle groups: Use `/api/v2/muscle-groups`
- [ ] **EditExercises.jsx**
  - [ ] Exercises API: `/exercises` → `/api/v2/exercises`
  - [ ] Exercise updates: Implement `/api/v2/exercises/:id`

### 🔄 Phase 6: Testing and Validation
- [ ] Test user selection and display
- [ ] Test exercise loading and selection  
- [ ] Test program creation workflow
- [ ] Test workout management
- [ ] Test muscle group functionality
- [ ] Fix any remaining data structure mismatches

## Components Requiring Updates

### High Priority (Core Functionality)
1. **CreateProgramWithWorkoutsEnhanced.jsx**
   - Users API: `/users` → `/api/v2/users`
   - Exercise API: `/exercises` → `/api/v2/exercises`
   - Program creation: `/programs/create-with-workouts` → `/api/v2/programs/create-with-workouts`

2. **EditProgramEnhanced.jsx**
   - Users API: `/users` → `/api/v2/users`
   - Programs API: `/allprograms` → `/api/v2/programs`
   - Workouts API: `/programs/:id/workouts` → `/api/v2/programs/:id/workouts`
   - Exercises API: `/workouts/:id/exercises` → `/api/v2/workouts/:id/exercises`

3. **ExerciseSelector.jsx**
   - Exercise API: `/exercises` → `/api/v2/exercises`

4. **AddExercisesToWorkout.jsx**
   - Users API: `/users` → `/api/v2/users`
   - Programs API: `/allprograms` → `/api/v2/programs`
   - Exercises API: `/exercises` → `/api/v2/exercises`
   - Workout exercises: `/workouts/:id/exercises` → `/api/v2/workouts/:id/exercises`
   - Exercise upsert: `/exercises/upsertExercisesToWorkout` → `/api/v2/exercises/upsertExercisesToWorkout`

### Medium Priority (User Interface)
5. **Clients.jsx**
   - Users API: `/users` → `/api/v2/users`
   - User assignment: `/assign-user` → `/api/v2/users/assign`

6. **Programs.jsx**
   - Users API: `/users` → `/api/v2/users`
   - Programs API: `/allprograms` → `/api/v2/programs`

7. **Exercises.jsx**
   - Exercises API: `/exercises` → `/api/v2/exercises`
   - Muscle groups: Need to implement `/api/v2/muscle-groups`

8. **EditExercises.jsx**
   - Exercises API: `/exercises` → `/api/v2/exercises`
   - Exercise updates: Implement `/api/v2/exercises/:id`

### Low Priority (Authentication)
9. **Authentication components**
   - Login: `/login` → `/api/v2/login`
   - Signup: `/signup` → `/api/v2/signup`
   - Password reset: Implement `/api/v2/forgot-password` and `/api/v2/reset-password`

## Data Structure Changes Required

### 1. Users Response
**Before:**
```json
[{"id": 1, "firstName": "John", "lastName": "Doe"}]
```

**After:**
```json
{
  "data": [{"id": 1, "firstname": "John", "lastname": "Doe"}],
  "message": "Users fetched successfully"
}
```
**Impact:** Field names changed (firstName → firstname), response wrapped in data object

### 2. Programs Response  
**Before:**
```json
{"programs": [...]}
```

**After:**
```json
{
  "data": {
    "programs": [...],
    "programCounts": {...},
    "activeProgram": {...}
  },
  "message": "Programs fetched successfully"
}
```
**Impact:** More structured response with additional metadata

### 3. Exercises Response
**Before:**
```json
[{group: {exercises: [...]}}] // Grouped format
```

**After:**
```json
[{"id": 1, "name": "Bench Press", ...}] // Direct array format
```
**Impact:** No longer grouped, direct array of exercises

### 4. Workout Exercises Response
**Before:**
```json
[{"exercise_id": 1, "exercises": {"name": "..."}}] // Nested structure
```

**After:**
```json
{
  "data": [{"id": 1, "exerciseId": 1, "name": "Bench Press"}] // Flattened structure
}
```

## Critical API Differences to Address

1. **Field Name Changes:**
   - `firstName` → `firstname`
   - `lastName` → `lastname`
   - `exercise_id` → `exerciseId`

2. **Response Wrapping:**
   - All responses now wrapped in `{data: ..., message: ...}`
   - Need to extract `response.data` instead of using response directly

3. **Exercise Data Structure:**
   - V1: Grouped by muscle groups, nested exercise objects
   - V2: Direct array of exercises with muscle_groups as nested objects

4. **Program Creation:**
   - V1: Simple field mapping
   - V2: More structured with `activateProgram` flag and different field names

5. **Error Handling:**
   - V1: Inconsistent error formats
   - V2: Standardized `{error, message, details}` format

## Utility Functions Needed

### 1. API Response Handler
```javascript
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || error.error || 'Request failed');
  }
  const result = await response.json();
  return result.data || result;
};
```

### 2. API Request Helper
```javascript
const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_API_URL;
  
  const response = await fetch(`${baseUrl}/api/v2${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  
  return handleApiResponse(response);
};
```

## Testing Strategy

### 1. Component-by-Component Testing
- Test each updated component individually
- Verify data loading and error handling
- Check UI rendering with new data structure

### 2. Integration Testing  
- Test full user workflows (create program, add exercises, etc.)
- Test error scenarios and edge cases
- Verify authentication flow

### 3. Data Structure Validation
- Ensure all field mappings are correct
- Verify nested object access patterns
- Test empty/null data handling

## Migration Progress Tracking

### Completed ✅
- [x] Initial analysis and documentation setup

### In Progress 🔄
- [ ] Phase 2: Authentication and Core Infrastructure

### Pending ⏳
- [ ] Phase 3-9: Component updates and testing

## Notes and Considerations

1. **Backward Compatibility:** No need to maintain v1 support
2. **Performance:** V2 API should be faster with better caching
3. **Error Handling:** Standardized errors will improve user experience
4. **Type Safety:** Consider adding TypeScript interfaces for V2 responses
5. **Testing:** Comprehensive testing needed due to data structure changes

---

**Migration Start Date:** Current
**Estimated Completion:** TBD based on testing results
**Priority:** High - Blocking user functionality