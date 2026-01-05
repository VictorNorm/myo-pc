# Create Exercise Tool - Implementation Guide

## Overview
**Goal**: Add a "Create Exercise" tool to the PC frontend, accessible from the exercises dropdown menu
**Why**: Allow Victor to easily add new exercises (with video URLs) to production database
**Affected Areas**: PC Frontend only (API already exists)
**Estimated Complexity**: Low

---

## Prerequisites

### Existing Infrastructure (already in place)
- `exercisesAPI.create()` in `/src/utils/api/apiV2.js`
- `muscleGroupsAPI.getAll()` in `/src/utils/api/apiV2.js`
- Exercises dropdown in Sidebar

### No database changes required

---

## Implementation Tasks

### Task 0: Add JSDoc Types for Exercise API
**File**: `src/utils/api/apiV2.js` (Modification)
**Type**: Modification
**Depends on**: None (do this first)

#### Goal
Add proper type definitions for exercise-related API calls to get autocomplete and type checking in VS Code.

#### Requirements
- [ ] Add JSDoc type definitions for exercise-related types at top of file (or near exercisesAPI)
- [ ] Apply types to `exercisesAPI` methods
- [ ] Apply types to `muscleGroupsAPI` methods

#### Type definitions to add
```javascript
/**
 * @typedef {'COMPOUND'|'ISOLATION'} ExerciseCategory
 * @typedef {'BARBELL'|'DUMBBELL'|'CABLE'|'MACHINE'|'BODYWEIGHT'} ExerciseEquipment
 */

/**
 * @typedef {Object} ExerciseInput
 * @property {string} name
 * @property {ExerciseCategory} category
 * @property {ExerciseEquipment} equipment
 * @property {string} [videoUrl]
 * @property {number[]} muscleGroupIds
 * @property {string} [notes]
 * @property {number} [defaultIncrementKg]
 */

/**
 * @typedef {Object} MuscleGroup
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} ExerciseMuscleGroup
 * @property {number} exercise_id
 * @property {number} muscle_group_id
 * @property {MuscleGroup} muscle_groups
 */

/**
 * @typedef {Object} Exercise
 * @property {number} id
 * @property {string} name
 * @property {ExerciseCategory} category
 * @property {ExerciseEquipment} equipment
 * @property {string|null} videoUrl
 * @property {string|null} notes
 * @property {number|null} defaultIncrementKg
 * @property {number|null} minWeight
 * @property {number|null} maxWeight
 * @property {ExerciseMuscleGroup[]} muscle_groups
 * @property {string} createdAt
 */
```

#### Apply to exercisesAPI
```javascript
/**
 * Exercise Management API
 */
export const exercisesAPI = {
    /** @returns {Promise<Exercise[]>} */
    getAll: () => apiV2Get('/exercises'),
    /** @param {number} id @returns {Promise<Exercise>} */
    getById: (id) => apiV2Get(`/exercises/${id}`),
    /** @param {ExerciseInput} exerciseData @returns {Promise<Exercise>} */
    create: (exerciseData) => apiV2Post('/exercises', exerciseData),
    /** @param {number} id @param {Partial<ExerciseInput>} exerciseData @returns {Promise<Exercise>} */
    update: (id, exerciseData) => apiV2Put(`/exercises/${id}`, exerciseData),
    /** @param {number} id @returns {Promise<void>} */
    delete: (id) => apiV2Delete(`/exercises/${id}`),
    upsertToWorkout: (workoutData) =>
        apiV2Post('/exercises/upsertExercisesToWorkout', workoutData),
};

/**
 * Muscle Groups API
 */
export const muscleGroupsAPI = {
    /** @returns {Promise<MuscleGroup[]>} */
    getAll: () => apiV2Get('/muscle-groups'),
    /** @param {number} id @returns {Promise<MuscleGroup>} */
    getById: (id) => apiV2Get(`/muscle-groups/${id}`),
    /** @param {{name: string}} muscleGroupData @returns {Promise<MuscleGroup>} */
    create: (muscleGroupData) => apiV2Post('/muscle-groups', muscleGroupData),
    /** @param {number} id @param {{name: string}} muscleGroupData @returns {Promise<MuscleGroup>} */
    update: (id, muscleGroupData) =>
        apiV2Put(`/muscle-groups/${id}`, muscleGroupData),
    /** @param {number} id @returns {Promise<void>} */
    delete: (id) => apiV2Delete(`/muscle-groups/${id}`),
};
```

#### Acceptance Criteria
- [ ] VS Code shows autocomplete for exerciseData fields when using `exercisesAPI.create()`
- [ ] VS Code shows return types when hovering over API methods
- [ ] No TypeScript errors (this is JSDoc, not TS, so just verify no red squiggles)

---

### Task 1: Create the CreateExercise Component
**File**: `src/components/CreateExercise.jsx` (New File)
**Type**: New File
**Depends on**: Task 0

#### Goal
A form component for creating new exercises, styled consistently with the rest of myo-pc.

#### Requirements
- [ ] Form with fields:
  - name (text input, required)
  - category (dropdown: COMPOUND / ISOLATION, required)
  - equipment (dropdown: BARBELL / DUMBBELL / CABLE / MACHINE / BODYWEIGHT, required)
  - videoUrl (text input, optional - for Vimeo links)
  - muscleGroupIds (multi-select checkbox list, at least one required)
  - notes (textarea, optional)
- [ ] Fetch muscle groups on mount via `muscleGroupsAPI.getAll()`
- [ ] Submit creates exercise via `exercisesAPI.create()`
- [ ] Loading state during submission
- [ ] Success feedback (toast or inline message)
- [ ] Error handling with user-friendly messages
- [ ] Form clears after successful submission (ready for next entry)
- [ ] Show list of exercises created this session for reference
- [ ] Style consistently with existing components

#### Component structure
```jsx
import React, { useState, useEffect } from 'react';
import { exercisesAPI, muscleGroupsAPI } from '../utils/api/apiV2';
import './CreateExercise.scss'; // or use existing styles

const CATEGORIES = ['COMPOUND', 'ISOLATION'];
const EQUIPMENT = ['BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT'];

const CreateExercise = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    equipment: '',
    videoUrl: '',
    muscleGroupIds: [],
    notes: ''
  });
  
  // Data state
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [recentlyCreated, setRecentlyCreated] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    // Fetch muscle groups on mount
    const loadMuscleGroups = async () => {
      try {
        const data = await muscleGroupsAPI.getAll();
        setMuscleGroups(data);
      } catch (err) {
        setError('Failed to load muscle groups');
      }
    };
    loadMuscleGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const created = await exercisesAPI.create(formData);
      setRecentlyCreated(prev => [created, ...prev]);
      setSuccess(`Created "${created.name}" successfully!`);
      // Reset form for next entry
      setFormData({
        name: '',
        category: '',
        equipment: '',
        videoUrl: '',
        muscleGroupIds: [],
        notes: ''
      });
    } catch (err) {
      setError(err.message || 'Failed to create exercise');
    } finally {
      setLoading(false);
    }
  };

  // ... render form
};

export default CreateExercise;
```

#### Acceptance Criteria
- [ ] All form fields render correctly
- [ ] Muscle groups load and display as checkboxes
- [ ] Form validation prevents submission without required fields
- [ ] Successful submission shows success message
- [ ] Failed submission shows error message
- [ ] Form clears after success
- [ ] Recently created exercises show in a list below the form

---

### Task 2: Create Stylesheet
**File**: `src/styles/_createExercise.scss` (New File)
**Type**: New File
**Depends on**: None

#### Requirements
- [ ] Match existing component styling patterns in myo-pc
- [ ] Style the form, inputs, dropdowns, checkboxes, buttons
- [ ] Style the "recently created" list
- [ ] Style success/error messages
- [ ] Import in main styles file (`styles.scss` or similar)

#### Reference
Look at existing component styles in `/src/styles/` for patterns to follow.

---

### Task 3: Add Route and Navigation
**File**: `src/components/Sidebar.jsx` (Modification)
**Type**: Modification
**Depends on**: Task 1

#### Requirements
- [ ] Find the exercises dropdown/menu section in Sidebar
- [ ] Add "Create Exercise" as a clickable menu item
- [ ] Should navigate to the CreateExercise component

**File**: `src/App.jsx` or routing file (Modification)
- [ ] Import CreateExercise component
- [ ] Add route: `/exercises/create` → `<CreateExercise />`

#### Example sidebar addition
```jsx
// In the exercises menu section, add something like:
<Link to="/exercises/create" className="sidebar-menu-item">
  Create Exercise
</Link>
```

---

## Integration Points

### API Endpoints Used
- `GET /api/v2/muscle-groups` - Fetch available muscle groups
- `POST /api/v2/exercises` - Create new exercise

### Data Flow
```
User fills form → handleSubmit → exercisesAPI.create(formData) → Backend → Response
                                                                            ↓
                                              Update recentlyCreated list ←─┘
```

---

## File Changes Summary

### New Files
- [ ] `src/components/CreateExercise.jsx` - Main component
- [ ] `src/styles/_createExercise.scss` - Component styles

### Modified Files
- [ ] `src/utils/api/apiV2.js` - Add JSDoc types
- [ ] `src/styles/styles.scss` (or main style file) - Import new stylesheet
- [ ] `src/components/Sidebar.jsx` - Add menu item
- [ ] `src/App.jsx` or router file - Add route

---

## Testing & Validation

### Manual Testing Checklist
- [ ] Navigate to Exercises menu → "Create Exercise" appears
- [ ] Click "Create Exercise" → form loads
- [ ] Muscle groups populate in the checkbox list
- [ ] Submit without required fields → shows validation error
- [ ] Fill all required fields → submit → success message
- [ ] Form clears after successful submission
- [ ] New exercise appears in "recently created" list
- [ ] Created exercise exists in database (verify via exercises list or API)

### Test Data
```javascript
{
  name: "Test Exercise",
  category: "ISOLATION",
  equipment: "BODYWEIGHT",
  videoUrl: "https://vimeo.com/1085582214",
  muscleGroupIds: [1], // Pick a valid ID from your muscle groups
  notes: "Test notes"
}
```

---

## Common Pitfalls & Reminders

- ⚠️ Muscle group IDs must be numbers, not strings
- ⚠️ `muscleGroupIds` is an array, even for single selection
- ⚠️ The API expects `muscleGroupIds`, not `muscleGroups` or `muscle_groups`
- ⚠️ Match existing myo-pc styling - don't introduce new patterns
- ⚠️ Handle the case where muscle groups fail to load

---

## Success Validation

**This implementation is complete when:**
1. JSDoc types provide autocomplete in VS Code for exercise API calls
2. "Create Exercise" appears in the exercises dropdown menu
3. Clicking it opens a properly styled form
4. Form has all required fields with appropriate input types
5. Submitting with valid data creates the exercise in the database
6. Success message confirms creation
7. Form clears and is ready for next entry
8. Recently created exercises display below the form

**Real-World Usage (Victor's workflow):**
1. Record exercise video, upload to Vimeo, copy URL
2. Open myo-pc → Exercises → Create Exercise
3. Enter: name, category, equipment, paste Vimeo URL, select muscle group(s)
4. Submit → see success → repeat for next exercise
5. After all 10 exercises added, verify in exercises list