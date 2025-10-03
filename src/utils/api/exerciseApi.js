/**
 * API service functions for exercise management
 */

const API_BASE_URL = process.env.REACT_APP_API_URL;

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error('Authentication token not found');
  }
  return token;
};

/**
 * Create headers with authentication
 */
const createHeaders = () => ({
  'Authorization': `Bearer ${getAuthToken()}`,
  'Content-Type': 'application/json'
});

/**
 * Handle API response and errors
 */
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.error || errorData.message || 'Unknown error occurred';
    } catch {
      errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
    }
    
    throw new Error(errorMessage);
  }
  
  const text = await response.text();
  return text ? JSON.parse(text) : {};
};

/**
 * Fetch exercises with optional filters
 * @param {Object} filters - Filter options
 * @param {string} [filters.equipment] - Equipment type filter
 * @param {string} [filters.category] - Category filter (COMPOUND/ISOLATION)
 * @param {string} [filters.search] - Search term for exercise name
 * @param {number} [filters.muscleGroup] - Muscle group ID filter
 * @returns {Promise<Object>} Response containing exercises data
 */
export const fetchExercises = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.equipment) {
    const validEquipment = ['BARBELL', 'DUMBBELL', 'CABLE', 'MACHINE', 'BODYWEIGHT'];
    if (!validEquipment.includes(filters.equipment)) {
      throw new Error('Invalid equipment type');
    }
    params.append('equipment', filters.equipment);
  }
  
  if (filters.category) {
    const validCategories = ['COMPOUND', 'ISOLATION'];
    if (!validCategories.includes(filters.category)) {
      throw new Error('Invalid category');
    }
    params.append('category', filters.category);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  
  if (filters.muscleGroup) {
    const muscleGroupId = Number(filters.muscleGroup);
    if (isNaN(muscleGroupId) || muscleGroupId < 1) {
      throw new Error('Invalid muscle group ID');
    }
    params.append('muscleGroup', muscleGroupId);
  }

  const queryString = params.toString();
  const url = `${API_BASE_URL}/api/v2/exercises${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    throw new Error(`Failed to fetch exercises: ${error.message}`);
  }
};

/**
 * Search exercises by name
 * @param {string} searchTerm - The search term
 * @param {Object} options - Additional search options
 * @param {number} [options.limit] - Limit number of results
 * @param {string} [options.equipment] - Equipment filter
 * @param {string} [options.category] - Category filter
 * @returns {Promise<Object>} Response containing search results
 */
export const searchExercises = async (searchTerm, options = {}) => {
  if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
    throw new Error('Search term is required');
  }

  const filters = {
    search: searchTerm.trim(),
    ...options
  };

  return await fetchExercises(filters);
};

/**
 * Get a specific exercise by ID
 * @param {number} exerciseId - The exercise ID
 * @returns {Promise<Object>} Response containing exercise data
 */
export const fetchExerciseById = async (exerciseId) => {
  if (!exerciseId) {
    throw new Error('Exercise ID is required');
  }

  const id = Number(exerciseId);
  if (isNaN(id) || id < 1) {
    throw new Error('Invalid exercise ID');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/exercises/${id}`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    throw new Error(`Failed to fetch exercise: ${error.message}`);
  }
};

/**
 * Get exercises for a specific workout
 * @param {number} workoutId - The workout ID
 * @returns {Promise<Object>} Response containing workout exercises
 */
export const fetchWorkoutExercises = async (workoutId) => {
  if (!workoutId) {
    throw new Error('Workout ID is required');
  }

  const id = Number(workoutId);
  if (isNaN(id) || id < 1) {
    throw new Error('Invalid workout ID');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/workouts/${id}/exercises`,
      {
        method: 'GET',
        headers: {
          ...createHeaders(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching workout exercises:', error);
    throw new Error(`Failed to fetch workout exercises: ${error.message}`);
  }
};

/**
 * Upsert exercises to a workout (replace all exercises)
 * @param {Object} data - The workout exercise data
 * @param {number} data.workoutId - The workout ID
 * @param {Array} data.exercises - Array of exercise objects
 * @param {Array} [data.supersets] - Array of superset pairs
 * @returns {Promise<Object>} Response containing updated exercises
 */
export const upsertExercisesToWorkout = async (data) => {
  if (!data || !data.workoutId) {
    throw new Error('Workout ID is required');
  }

  if (!Array.isArray(data.exercises)) {
    throw new Error('Exercises array is required');
  }

  // Validate workout ID
  const workoutId = Number(data.workoutId);
  if (isNaN(workoutId) || workoutId < 1) {
    throw new Error('Invalid workout ID');
  }

  // Validate exercises
  const validatedExercises = data.exercises.map((exercise, index) => {
    const exerciseId = Number(exercise.id || exercise.exerciseId);
    const sets = Number(exercise.sets);
    const reps = Number(exercise.reps);
    const weight = Number(exercise.weight);

    if (isNaN(exerciseId) || exerciseId < 1) {
      throw new Error(`Exercise ${index}: Invalid exercise ID`);
    }
    if (isNaN(sets) || sets < 1 || sets > 20) {
      throw new Error(`Exercise ${index}: Sets must be between 1 and 20`);
    }
    if (isNaN(reps) || reps < 1 || reps > 100) {
      throw new Error(`Exercise ${index}: Reps must be between 1 and 100`);
    }
    if (isNaN(weight) || weight < 0) {
      throw new Error(`Exercise ${index}: Weight must be non-negative`);
    }

    return {
      id: exerciseId,
      sets,
      reps,
      weight
    };
  });

  // Validate supersets if provided
  let validatedSupersets = [];
  if (data.supersets && Array.isArray(data.supersets)) {
    validatedSupersets = data.supersets.map((superset, index) => {
      const firstId = Number(superset.firstExerciseId || superset.first_exercise_id);
      const secondId = Number(superset.secondExerciseId || superset.second_exercise_id);

      if (isNaN(firstId) || isNaN(secondId)) {
        throw new Error(`Superset ${index}: Invalid exercise IDs`);
      }

      // Check that both exercises exist in the exercises array
      const firstExists = validatedExercises.some(ex => ex.id === firstId);
      const secondExists = validatedExercises.some(ex => ex.id === secondId);

      if (!firstExists || !secondExists) {
        throw new Error(`Superset ${index}: Both exercises must be included in the workout`);
      }

      return {
        first_exercise_id: firstId,
        second_exercise_id: secondId
      };
    });
  }

  const payload = {
    workoutId,
    exercises: validatedExercises,
    supersets: validatedSupersets
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/exercises/upsertExercisesToWorkout`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(payload)
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error upserting exercises to workout:', error);
    throw new Error(`Failed to update workout exercises: ${error.message}`);
  }
};

/**
 * Add a single exercise to a workout
 * @param {number} workoutId - The workout ID
 * @param {Object} exercise - The exercise data
 * @param {number} exercise.exerciseId - The exercise ID
 * @param {number} [exercise.sets=3] - Number of sets
 * @param {number} [exercise.reps=10] - Number of reps
 * @param {number} [exercise.weight=0] - Weight in kg
 * @returns {Promise<Object>} Response containing added exercise
 */
export const addExerciseToWorkout = async (workoutId, exercise) => {
  if (!workoutId || !exercise) {
    throw new Error('Workout ID and exercise data are required');
  }

  // Get current exercises first
  try {
    const currentData = await fetchWorkoutExercises(workoutId);
    const currentExercises = Array.isArray(currentData.data) ? currentData.data : 
                            Array.isArray(currentData) ? currentData : [];

    // Convert current exercises to the expected format
    const existingExercises = currentExercises.map(ex => ({
      id: ex.exercise_id || ex.id,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight
    }));

    // Add new exercise
    const newExercise = {
      id: Number(exercise.exerciseId),
      sets: Number(exercise.sets) || 3,
      reps: Number(exercise.reps) || 10,
      weight: Number(exercise.weight) || 0
    };

    // Update with all exercises
    return await upsertExercisesToWorkout({
      workoutId,
      exercises: [...existingExercises, newExercise]
    });
  } catch (error) {
    console.error('Error adding exercise to workout:', error);
    throw new Error(`Failed to add exercise to workout: ${error.message}`);
  }
};

/**
 * Remove an exercise from a workout
 * @param {number} workoutId - The workout ID
 * @param {number} exerciseId - The exercise ID to remove
 * @returns {Promise<Object>} Response containing updated exercises
 */
export const removeExerciseFromWorkout = async (workoutId, exerciseId) => {
  if (!workoutId || !exerciseId) {
    throw new Error('Workout ID and exercise ID are required');
  }

  // Get current exercises first
  try {
    const currentData = await fetchWorkoutExercises(workoutId);
    const currentExercises = Array.isArray(currentData.data) ? currentData.data : 
                            Array.isArray(currentData) ? currentData : [];

    // Filter out the exercise to remove
    const remainingExercises = currentExercises
      .filter(ex => (ex.exercise_id || ex.id) !== Number(exerciseId))
      .map(ex => ({
        id: ex.exercise_id || ex.id,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight
      }));

    // Update with remaining exercises
    return await upsertExercisesToWorkout({
      workoutId,
      exercises: remainingExercises
    });
  } catch (error) {
    console.error('Error removing exercise from workout:', error);
    throw new Error(`Failed to remove exercise from workout: ${error.message}`);
  }
};

/**
 * Get muscle groups
 * @returns {Promise<Array>} Array of muscle groups
 */
export const fetchMuscleGroups = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/muscle-groups`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching muscle groups:', error);
    throw new Error(`Failed to fetch muscle groups: ${error.message}`);
  }
};

export default {
  fetchExercises,
  searchExercises,
  fetchExerciseById,
  fetchWorkoutExercises,
  upsertExercisesToWorkout,
  addExerciseToWorkout,
  removeExerciseFromWorkout,
  fetchMuscleGroups
};