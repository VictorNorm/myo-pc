/**
 * Validation utilities for program creation and editing
 */

/**
 * Valid program types
 */
export const PROGRAM_TYPES = {
  MANUAL: 'MANUAL',
  AUTOMATED: 'AUTOMATED'
};

/**
 * Valid goals
 */
export const GOALS = {
  STRENGTH: 'STRENGTH',
  HYPERTROPHY: 'HYPERTROPHY'
};

/**
 * Valid equipment types
 */
export const EQUIPMENT_TYPES = {
  BARBELL: 'BARBELL',
  DUMBBELL: 'DUMBBELL',
  CABLE: 'CABLE',
  MACHINE: 'MACHINE',
  BODYWEIGHT: 'BODYWEIGHT'
};

/**
 * Valid exercise categories
 */
export const CATEGORIES = {
  COMPOUND: 'COMPOUND',
  ISOLATION: 'ISOLATION'
};

/**
 * Validation constraints
 */
export const CONSTRAINTS = {
  PROGRAM_NAME: { minLength: 1, maxLength: 100 },
  WORKOUT_NAME: { minLength: 1, maxLength: 100 },
  SETS: { min: 1, max: 20 },
  REPS: { min: 1, max: 100 },
  WEIGHT: { min: 0, max: 1000 },
  MAX_WORKOUTS_PER_PROGRAM: 20,
  MAX_EXERCISES_PER_WORKOUT: 50
};

/**
 * Check if a date string is valid
 * @param {string} dateString - Date string in ISO format
 * @returns {boolean} True if valid
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return !isNaN(date.getTime()) && dateString.match(/^\d{4}-\d{2}-\d{2}/);
};

/**
 * Check if end date is valid (after or equal to start date)
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {boolean} True if valid
 */
export const isEndDateValid = (startDate, endDate) => {
  if (!endDate) return true; // End date is optional
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  return end >= start;
};

/**
 * Validate program data
 * @param {Object} programData - Program data to validate
 * @returns {Object} Validation result with errors array
 */
export const validateProgramData = (programData) => {
  const errors = [];

  if (!programData) {
    return { isValid: false, errors: ['Program data is required'] };
  }

  // Validate program name
  if (!programData.programName) {
    errors.push('Program name is required');
  } else if (typeof programData.programName !== 'string') {
    errors.push('Program name must be a string');
  } else if (programData.programName.length < CONSTRAINTS.PROGRAM_NAME.minLength) {
    errors.push(`Program name must be at least ${CONSTRAINTS.PROGRAM_NAME.minLength} character(s)`);
  } else if (programData.programName.length > CONSTRAINTS.PROGRAM_NAME.maxLength) {
    errors.push(`Program name must not exceed ${CONSTRAINTS.PROGRAM_NAME.maxLength} characters`);
  }

  // Validate user ID
  if (!programData.userId) {
    errors.push('User ID is required');
  } else {
    const userId = Number(programData.userId);
    if (isNaN(userId) || userId < 1) {
      errors.push('User ID must be a positive number');
    }
  }

  // Validate goal
  if (!programData.goal) {
    errors.push('Goal is required');
  } else if (!Object.values(GOALS).includes(programData.goal)) {
    errors.push(`Goal must be one of: ${Object.values(GOALS).join(', ')}`);
  }

  // Validate program type
  if (!programData.programType) {
    errors.push('Program type is required');
  } else if (!Object.values(PROGRAM_TYPES).includes(programData.programType)) {
    errors.push(`Program type must be one of: ${Object.values(PROGRAM_TYPES).join(', ')}`);
  }

  // Validate start date
  if (!programData.startDate) {
    errors.push('Start date is required');
  } else if (!isValidDate(programData.startDate)) {
    errors.push('Start date must be a valid date in YYYY-MM-DD format');
  }

  // Validate end date if provided
  if (programData.endDate) {
    if (!isValidDate(programData.endDate)) {
      errors.push('End date must be a valid date in YYYY-MM-DD format');
    } else if (!isEndDateValid(programData.startDate, programData.endDate)) {
      errors.push('End date must be after or equal to start date');
    }
  }

  // Validate workouts
  if (!programData.workouts) {
    errors.push('Workouts are required');
  } else if (!Array.isArray(programData.workouts)) {
    errors.push('Workouts must be an array');
  } else if (programData.workouts.length === 0) {
    errors.push('At least one workout is required');
  } else if (programData.workouts.length > CONSTRAINTS.MAX_WORKOUTS_PER_PROGRAM) {
    errors.push(`Maximum ${CONSTRAINTS.MAX_WORKOUTS_PER_PROGRAM} workouts allowed per program`);
  } else {
    // Validate each workout
    programData.workouts.forEach((workout, index) => {
      const workoutErrors = validateWorkout(workout, index + 1);
      errors.push(...workoutErrors);
    });
  }

  // Validate baselines for AUTOMATED programs
  if (programData.programType === PROGRAM_TYPES.AUTOMATED) {
    const hasExercises = programData.workouts && programData.workouts.some(w => 
      w.exercises && Array.isArray(w.exercises) && w.exercises.length > 0
    );

    if (hasExercises) {
      if (!programData.baselines || !Array.isArray(programData.baselines) || programData.baselines.length === 0) {
        errors.push('AUTOMATED programs with exercises require baselines');
      } else {
        // Validate baselines
        const baselineErrors = validateBaselines(programData.baselines, programData.programType);
        errors.push(...baselineErrors);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate a single workout
 * @param {Object} workout - Workout data to validate
 * @param {number} workoutNumber - Workout number for error messages
 * @returns {Array} Array of error messages
 */
export const validateWorkout = (workout, workoutNumber = 1) => {
  const errors = [];

  if (!workout) {
    return [`Workout ${workoutNumber}: Workout data is required`];
  }

  // Validate workout name
  if (!workout.name) {
    errors.push(`Workout ${workoutNumber}: Name is required`);
  } else if (typeof workout.name !== 'string') {
    errors.push(`Workout ${workoutNumber}: Name must be a string`);
  } else if (workout.name.length < CONSTRAINTS.WORKOUT_NAME.minLength) {
    errors.push(`Workout ${workoutNumber}: Name must be at least ${CONSTRAINTS.WORKOUT_NAME.minLength} character(s)`);
  } else if (workout.name.length > CONSTRAINTS.WORKOUT_NAME.maxLength) {
    errors.push(`Workout ${workoutNumber}: Name must not exceed ${CONSTRAINTS.WORKOUT_NAME.maxLength} characters`);
  }

  // Validate exercises if present
  if (workout.exercises) {
    if (!Array.isArray(workout.exercises)) {
      errors.push(`Workout ${workoutNumber}: Exercises must be an array`);
    } else if (workout.exercises.length > CONSTRAINTS.MAX_EXERCISES_PER_WORKOUT) {
      errors.push(`Workout ${workoutNumber}: Maximum ${CONSTRAINTS.MAX_EXERCISES_PER_WORKOUT} exercises allowed per workout`);
    } else {
      // Validate each exercise
      const exerciseErrors = validateWorkoutExercises(workout.exercises, workoutNumber);
      errors.push(...exerciseErrors);
    }
  }

  return errors;
};

/**
 * Validate workout exercises
 * @param {Array} exercises - Array of exercise objects
 * @param {number} workoutNumber - Workout number for error messages
 * @returns {Array} Array of error messages
 */
export const validateWorkoutExercises = (exercises, workoutNumber = 1) => {
  const errors = [];

  if (!Array.isArray(exercises)) {
    return [`Workout ${workoutNumber}: Exercises must be an array`];
  }

  exercises.forEach((exercise, index) => {
    const exerciseNumber = index + 1;
    const prefix = `Workout ${workoutNumber}, Exercise ${exerciseNumber}`;

    if (!exercise) {
      errors.push(`${prefix}: Exercise data is required`);
      return;
    }

    // Validate exercise ID
    const exerciseId = Number(exercise.exerciseId || exercise.id);
    if (isNaN(exerciseId) || exerciseId < 1) {
      errors.push(`${prefix}: Valid exercise ID is required`);
    }

    // Validate sets
    const sets = Number(exercise.sets);
    if (isNaN(sets) || sets < CONSTRAINTS.SETS.min || sets > CONSTRAINTS.SETS.max) {
      errors.push(`${prefix}: Sets must be between ${CONSTRAINTS.SETS.min} and ${CONSTRAINTS.SETS.max}`);
    }

    // Validate reps
    const reps = Number(exercise.reps);
    if (isNaN(reps) || reps < CONSTRAINTS.REPS.min || reps > CONSTRAINTS.REPS.max) {
      errors.push(`${prefix}: Reps must be between ${CONSTRAINTS.REPS.min} and ${CONSTRAINTS.REPS.max}`);
    }

    // Validate weight
    const weight = Number(exercise.weight);
    if (isNaN(weight) || weight < CONSTRAINTS.WEIGHT.min || weight > CONSTRAINTS.WEIGHT.max) {
      errors.push(`${prefix}: Weight must be between ${CONSTRAINTS.WEIGHT.min} and ${CONSTRAINTS.WEIGHT.max}`);
    }

    // Validate order if present
    if (exercise.order !== undefined) {
      const order = Number(exercise.order);
      if (isNaN(order) || order < 1) {
        errors.push(`${prefix}: Order must be a positive number`);
      }
    }
  });

  return errors;
};

/**
 * Validate baselines
 * @param {Array} baselines - Array of baseline objects
 * @param {string} programType - Program type for validation context
 * @returns {Array} Array of error messages
 */
export const validateBaselines = (baselines, programType) => {
  const errors = [];

  if (!Array.isArray(baselines)) {
    return ['Baselines must be an array'];
  }

  if (programType === PROGRAM_TYPES.AUTOMATED && baselines.length === 0) {
    errors.push('AUTOMATED programs require at least one baseline');
  }

  const seenExerciseIds = new Set();

  baselines.forEach((baseline, index) => {
    const baselineNumber = index + 1;
    const prefix = `Baseline ${baselineNumber}`;

    if (!baseline) {
      errors.push(`${prefix}: Baseline data is required`);
      return;
    }

    // Validate exercise ID
    const exerciseId = Number(baseline.exerciseId || baseline.exercise_id);
    if (isNaN(exerciseId) || exerciseId < 1) {
      errors.push(`${prefix}: Valid exercise ID is required`);
    } else {
      if (seenExerciseIds.has(exerciseId)) {
        errors.push(`${prefix}: Duplicate exercise ID ${exerciseId}`);
      }
      seenExerciseIds.add(exerciseId);
    }

    // Validate sets
    const sets = Number(baseline.sets);
    if (isNaN(sets) || sets < CONSTRAINTS.SETS.min || sets > CONSTRAINTS.SETS.max) {
      errors.push(`${prefix}: Sets must be between ${CONSTRAINTS.SETS.min} and ${CONSTRAINTS.SETS.max}`);
    }

    // Validate reps
    const reps = Number(baseline.reps);
    if (isNaN(reps) || reps < CONSTRAINTS.REPS.min || reps > CONSTRAINTS.REPS.max) {
      errors.push(`${prefix}: Reps must be between ${CONSTRAINTS.REPS.min} and ${CONSTRAINTS.REPS.max}`);
    }

    // Validate weight
    const weight = Number(baseline.weight);
    if (isNaN(weight) || weight < CONSTRAINTS.WEIGHT.min || weight > CONSTRAINTS.WEIGHT.max) {
      errors.push(`${prefix}: Weight must be between ${CONSTRAINTS.WEIGHT.min} and ${CONSTRAINTS.WEIGHT.max}`);
    }
  });

  return errors;
};

/**
 * Validate exercise parameters (for single exercise)
 * @param {Object} params - Exercise parameters
 * @returns {Object} Validation result with errors object
 */
export const validateExerciseParameters = (params) => {
  const errors = {};

  if (!params) {
    return { isValid: false, errors: { general: 'Exercise parameters are required' } };
  }

  // Validate sets
  const sets = Number(params.sets);
  if (isNaN(sets) || sets < CONSTRAINTS.SETS.min || sets > CONSTRAINTS.SETS.max) {
    errors.sets = `Sets must be between ${CONSTRAINTS.SETS.min} and ${CONSTRAINTS.SETS.max}`;
  }

  // Validate reps
  const reps = Number(params.reps);
  if (isNaN(reps) || reps < CONSTRAINTS.REPS.min || reps > CONSTRAINTS.REPS.max) {
    errors.reps = `Reps must be between ${CONSTRAINTS.REPS.min} and ${CONSTRAINTS.REPS.max}`;
  }

  // Validate weight
  const weight = Number(params.weight);
  if (isNaN(weight) || weight < CONSTRAINTS.WEIGHT.min || weight > CONSTRAINTS.WEIGHT.max) {
    errors.weight = `Weight must be between ${CONSTRAINTS.WEIGHT.min} and ${CONSTRAINTS.WEIGHT.max}`;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate program step completion for multi-step form
 * @param {number} step - Step number
 * @param {Object} formData - Current form data
 * @returns {Object} Validation result
 */
export const validateProgramStep = (step, formData) => {
  const errors = [];

  switch (step) {
    case 1: // Program Details
      if (!formData.programName?.trim()) errors.push('Program name is required');
      if (!formData.selectedUser) errors.push('User selection is required');
      if (!formData.startDate) errors.push('Start date is required');
      if (formData.endDate && !isEndDateValid(formData.startDate, formData.endDate)) {
        errors.push('End date must be after start date');
      }
      break;

    case 2: // Workouts
      if (!formData.workouts || formData.workouts.length === 0) {
        errors.push('At least one workout is required');
      } else {
        const hasEmptyNames = formData.workouts.some(w => !w.name?.trim());
        if (hasEmptyNames) errors.push('All workouts must have names');
      }
      break;

    case 3: // Exercises
      if (!formData.workouts) {
        errors.push('Workouts are required');
      } else {
        const hasEmptyWorkouts = formData.workouts.some(w => !w.exercises || w.exercises.length === 0);
        if (hasEmptyWorkouts) errors.push('Each workout must have at least one exercise');
      }
      break;

    case 4: // Baselines (AUTOMATED only)
      if (formData.programType === PROGRAM_TYPES.AUTOMATED) {
        if (!formData.baselines || formData.baselines.length === 0) {
          errors.push('Baselines are required for AUTOMATED programs');
        }
      }
      break;

    default:
      errors.push('Invalid step number');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export default {
  PROGRAM_TYPES,
  GOALS,
  EQUIPMENT_TYPES,
  CATEGORIES,
  CONSTRAINTS,
  isValidDate,
  isEndDateValid,
  validateProgramData,
  validateWorkout,
  validateWorkoutExercises,
  validateBaselines,
  validateExerciseParameters,
  validateProgramStep
};