/**
 * API service functions for baseline management
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
 * Fetch baselines for a specific program
 * @param {number} programId - The program ID
 * @returns {Promise<Object>} Response containing baselines data
 */
export const fetchBaselinesForProgram = async (programId) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/programs/${programId}/baselines`,
      {
        method: 'GET',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching baselines:', error);
    throw new Error(`Failed to fetch baselines: ${error.message}`);
  }
};

/**
 * Update a single baseline
 * @param {number} baselineId - The baseline ID to update
 * @param {Object} data - The update data
 * @param {number} [data.sets] - Number of sets (1-20)
 * @param {number} [data.reps] - Number of reps (1-100)
 * @param {number} [data.weight] - Weight in kg (>= 0)
 * @returns {Promise<Object>} Response containing updated baseline data
 */
export const updateBaseline = async (baselineId, data) => {
  if (!baselineId) {
    throw new Error('Baseline ID is required');
  }

  if (!data || Object.keys(data).length === 0) {
    throw new Error('Update data is required');
  }

  // Validate data
  const validFields = ['sets', 'reps', 'weight'];
  const updateData = {};
  
  Object.keys(data).forEach(key => {
    if (validFields.includes(key) && data[key] !== undefined && data[key] !== null) {
      const value = Number(data[key]);
      
      if (isNaN(value)) {
        throw new Error(`Invalid ${key}: must be a number`);
      }
      
      // Field-specific validation
      if (key === 'sets' && (value < 1 || value > 20)) {
        throw new Error('Sets must be between 1 and 20');
      }
      if (key === 'reps' && (value < 1 || value > 100)) {
        throw new Error('Reps must be between 1 and 100');
      }
      if (key === 'weight' && value < 0) {
        throw new Error('Weight must be non-negative');
      }
      
      updateData[key] = value;
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw new Error('No valid fields to update');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/baselines/${baselineId}`,
      {
        method: 'PUT',
        headers: createHeaders(),
        body: JSON.stringify(updateData)
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error updating baseline:', error);
    throw new Error(`Failed to update baseline: ${error.message}`);
  }
};

/**
 * Bulk create baselines for a program
 * @param {number} programId - The program ID
 * @param {Array} baselines - Array of baseline objects
 * @param {boolean} [overwrite=false] - Whether to overwrite existing baselines
 * @returns {Promise<Object>} Response containing created baselines data
 */
export const bulkCreateBaselines = async (programId, baselines, overwrite = false) => {
  if (!programId) {
    throw new Error('Program ID is required');
  }

  if (!Array.isArray(baselines) || baselines.length === 0) {
    throw new Error('Baselines array is required and must not be empty');
  }

  // Validate each baseline
  const validatedBaselines = baselines.map((baseline, index) => {
    if (!baseline.exerciseId) {
      throw new Error(`Baseline ${index}: exerciseId is required`);
    }

    const sets = Number(baseline.sets);
    const reps = Number(baseline.reps);
    const weight = Number(baseline.weight);

    if (isNaN(sets) || sets < 1 || sets > 20) {
      throw new Error(`Baseline ${index}: sets must be between 1 and 20`);
    }
    if (isNaN(reps) || reps < 1 || reps > 100) {
      throw new Error(`Baseline ${index}: reps must be between 1 and 100`);
    }
    if (isNaN(weight) || weight < 0) {
      throw new Error(`Baseline ${index}: weight must be non-negative`);
    }

    return {
      exercise_id: Number(baseline.exerciseId),
      sets,
      reps,
      weight
    };
  });

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/programs/${programId}/baselines/bulk`,
      {
        method: 'POST',
        headers: createHeaders(),
        body: JSON.stringify({
          baselines: validatedBaselines,
          overwrite
        })
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error bulk creating baselines:', error);
    throw new Error(`Failed to create baselines: ${error.message}`);
  }
};

/**
 * Delete a baseline
 * @param {number} baselineId - The baseline ID to delete
 * @returns {Promise<Object>} Response confirmation
 */
export const deleteBaseline = async (baselineId) => {
  if (!baselineId) {
    throw new Error('Baseline ID is required');
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/v2/baselines/${baselineId}`,
      {
        method: 'DELETE',
        headers: createHeaders()
      }
    );

    return await handleResponse(response);
  } catch (error) {
    console.error('Error deleting baseline:', error);
    throw new Error(`Failed to delete baseline: ${error.message}`);
  }
};

/**
 * Get baseline history for an exercise
 * @param {number} exerciseId - The exercise ID
 * @param {number} userId - The user ID
 * @param {Object} options - Query options
 * @param {number} [options.limit] - Limit number of results
 * @param {string} [options.startDate] - Start date filter (ISO string)
 * @param {string} [options.endDate] - End date filter (ISO string)
 * @returns {Promise<Object>} Response containing baseline history
 */
export const getBaselineHistory = async (exerciseId, userId, options = {}) => {
  if (!exerciseId || !userId) {
    throw new Error('Exercise ID and User ID are required');
  }

  const queryParams = new URLSearchParams();
  if (options.limit) queryParams.append('limit', options.limit);
  if (options.startDate) queryParams.append('startDate', options.startDate);
  if (options.endDate) queryParams.append('endDate', options.endDate);

  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/api/v2/baselines/history/${exerciseId}/${userId}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: createHeaders()
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Error fetching baseline history:', error);
    throw new Error(`Failed to fetch baseline history: ${error.message}`);
  }
};

export default {
  fetchBaselinesForProgram,
  updateBaseline,
  bulkCreateBaselines,
  deleteBaseline,
  getBaselineHistory
};