/**
 * API service functions for program management
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
 * Create a program with workouts and exercises (enhanced version)
 * @param {Object} programData - The complete program data
 * @returns {Promise<Object>} Response containing created program data
 */
export const createProgramWithWorkouts = async (programData) => {
  if (!programData) {
    throw new Error('Program data is required');
  }

  // Validate required fields
  const requiredFields = ['programName', 'userId', 'goal', 'programType', 'startDate', 'workouts'];
  for (const field of requiredFields) {
    if (!programData[field]) {
      throw new Error(`${field} is required`);
    }
  }

  // Validate program type
  const validProgramTypes = ['MANUAL', 'AUTOMATED'];
  if (!validProgramTypes.includes(programData.programType)) {
    throw new Error('programType must be MANUAL or AUTOMATED');
  }

  // Validate goal
  const validGoals = ['STRENGTH', 'HYPERTROPHY'];
  if (!validGoals.includes(programData.goal)) {
    throw new Error('goal must be STRENGTH or HYPERTROPHY');
  }

  // Validate workouts
  if (!Array.isArray(programData.workouts) || programData.workouts.length === 0) {
    throw new Error('At least one workout is required');
  }

  // Validate that AUTOMATED programs have baselines if exercises are present
  if (programData.programType === 'AUTOMATED') {
    const hasExercises = programData.workouts.some(w => w.exercises && w.exercises.length > 0);
    if (hasExercises && (!programData.baselines || programData.baselines.length === 0)) {
      throw new Error('AUTOMATED programs with exercises require baselines');
    }
  }

  // Build the payload
  const payload = {
    programName: programData.programName,
    userId: Number(programData.userId),
    goal: programData.goal,
    programType: programData.programType,
    startDate: programData.startDate,
    endDate: programData.endDate || null,
    setActive: Boolean(programData.setActive),
    workouts: programData.workouts.map(workout => ({
      name: workout.name,
      exercises: workout.exercises ? workout.exercises.map((exercise, index) => ({
        exerciseId: Number(exercise.exerciseId),
        sets: Number(exercise.sets),
        reps: Number(exercise.reps),
        weight: Number(exercise.weight),
        order: exercise.order || index + 1
      })) : []
    }))
  };

  // Add baselines for AUTOMATED programs
  if (programData.programType === 'AUTOMATED' && programData.baselines) {
    payload.baselines = programData.baselines.map(baseline => ({
      exerciseId: Number(baseline.exerciseId),
      sets: Number(baseline.sets),
      reps: Number(baseline.reps),
      weight: Number(baseline.weight)
    }));
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/create-with-workouts`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(payload)
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error creating program:', error);
    throw new Error(`Failed to create program: ${error.message}`);
  }
};

/**
 * Get all programs
 * @returns {Promise<Object>} Response containing all programs
 */
export const fetchAllPrograms = async () => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/allprograms`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching programs:', error);
    throw new Error(`Failed to fetch programs: ${error.message}`);
  }
};

/**
 * Get programs for a specific user
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} Response containing user programs
 */
export const fetchUserPrograms = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${userId}`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching user programs:', error);
    throw new Error(`Failed to fetch user programs: ${error.message}`);
  }
};

/**
 * Get workouts for a specific program
 * @param {number} programId - The program ID
 * @returns {Promise<Array>} Array of workouts
 */
export const fetchProgramWorkouts = async (programId) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${programId}/workouts`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching program workouts:', error);
    throw new Error(`Failed to fetch program workouts: ${error.message}`);
  }
};

/**
 * Delete a program
 * @param {number} programId - The program ID to delete
 * @returns {Promise<Object>} Response confirmation
 */
export const deleteProgram = async (programId) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${programId}`,
      {
        method: 'DELETE',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting program:', error);
    throw new Error(`Failed to delete program: ${error.message}`);
  }
};

/**
 * Update a program
 * @param {number} programId - The program ID to update
 * @param {Object} updateData - The update data
 * @returns {Promise<Object>} Response containing updated program data
 */
export const updateProgram = async (programId, updateData) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new Error('Update data is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${programId}`,
      {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(updateData)
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating program:', error);
    throw new Error(`Failed to update program: ${error.message}`);
  }
};

/**
 * Duplicate a program
 * @param {number} programId - The program ID to duplicate
 * @param {Object} options - Duplication options
 * @param {string} [options.newName] - New name for duplicated program
 * @param {number} [options.newUserId] - New user ID for duplicated program
 * @param {boolean} [options.copyExercises=true] - Whether to copy exercises
 * @param {boolean} [options.copyBaselines=true] - Whether to copy baselines
 * @returns {Promise<Object>} Response containing duplicated program data
 */
export const duplicateProgram = async (programId, options = {}) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  const payload = {
    programId: Number(programId),
    newName: options.newName,
    newUserId: options.newUserId ? Number(options.newUserId) : undefined,
    copyExercises: options.copyExercises !== false,
    copyBaselines: options.copyBaselines !== false
  };

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${programId}/duplicate`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify(payload)
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error duplicating program:', error);
    throw new Error(`Failed to duplicate program: ${error.message}`);
  }
};

/**
 * Get program statistics
 * @param {number} programId - The program ID
 * @returns {Promise<Object>} Response containing program statistics
 */
export const getProgramStats = async (programId) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/programs/${programId}/stats`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching program stats:', error);
    throw new Error(`Failed to fetch program stats: ${error.message}`);
  }
};

export default {
  createProgramWithWorkouts,
  fetchAllPrograms,
  fetchUserPrograms,
  fetchProgramWorkouts,
  deleteProgram,
  updateProgram,
  duplicateProgram,
  getProgramStats
};