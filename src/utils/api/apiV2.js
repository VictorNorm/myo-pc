/**
 * API V2 Utility Functions
 * Handles standardized V2 API responses and requests
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';
const API_V2_BASE = `${BASE_URL}/api/v2`;

/**
 * Handle API V2 response format
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>} - Parsed response data
 */
export const handleApiV2Response = async (response) => {
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        // V2 error format: {error, message, details}
        const errorMessage =
            errorData.message ||
            errorData.error ||
            `HTTP ${response.status}: ${response.statusText}`;
        const error = new Error(errorMessage);
        error.details = errorData.details;
        error.status = response.status;
        error.response = errorData;
        throw error;
    }

    const result = await response.json();

    // V2 success format: {data, message} or direct data
    return result.data !== undefined ? result.data : result;
};

/**
 * Make authenticated API V2 request
 * @param {string} endpoint - API endpoint (without /api/v2 prefix)
 * @param {object} options - Fetch options
 * @returns {Promise<any>} - Response data
 */
export const apiV2Request = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const url = endpoint.startsWith('/api/v2')
        ? `${BASE_URL}${endpoint}`
        : `${API_V2_BASE}${endpoint}`;

    const defaultHeaders = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    });

    return handleApiV2Response(response);
};

/**
 * GET request to V2 API
 */
export const apiV2Get = (endpoint, options = {}) => {
    return apiV2Request(endpoint, { method: 'GET', ...options });
};

/**
 * POST request to V2 API
 */
export const apiV2Post = (endpoint, data = null, options = {}) => {
    return apiV2Request(endpoint, {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
    });
};

/**
 * PUT request to V2 API
 */
export const apiV2Put = (endpoint, data = null, options = {}) => {
    return apiV2Request(endpoint, {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
    });
};

/**
 * PATCH request to V2 API
 */
export const apiV2Patch = (endpoint, data = null, options = {}) => {
    return apiV2Request(endpoint, {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
        ...options,
    });
};

/**
 * DELETE request to V2 API
 */
export const apiV2Delete = (endpoint, options = {}) => {
    return apiV2Request(endpoint, { method: 'DELETE', ...options });
};

// Specific API functions for common endpoints

/**
 * User Management API
 */
export const usersAPI = {
    getAll: () => apiV2Get('/users'),
    getById: (id) => apiV2Get(`/users/${id}`),
    assign: (userId) => apiV2Post('/users/assign', { userId }),
    getAssigned: () => apiV2Get('/users/trainer/assigned'),
};

/**
 * Program Management API
 */
export const programsAPI = {
    getAll: (status = null) => {
        const endpoint = status ? `/programs?status=${status}` : '/programs';
        return apiV2Get(endpoint);
    },
    getByUserId: (userId) => apiV2Get(`/programs/${userId}`),
    create: (programData) => apiV2Post('/programs', programData),
    createWithWorkouts: (programData) =>
        apiV2Post('/programs/create-with-workouts', programData),
    updateStatus: (programId, status) =>
        apiV2Patch(`/programs/${programId}/status`, { status }),
    delete: (programId) => apiV2Delete(`/programs/${programId}`),
    getNextWorkout: (programId) =>
        apiV2Get(`/programs/${programId}/nextWorkout`),
    getStatistics: (programId) => apiV2Get(`/programs/${programId}/statistics`),
};

/**
 * Workout Management API
 */
export const workoutsAPI = {
    getByProgram: (programId) => apiV2Get(`/programs/${programId}/workouts`),
    getExercises: (workoutId) => apiV2Get(`/workouts/${workoutId}/exercises`),
    complete: (workoutData) =>
        apiV2Post('/workouts/completeWorkout', workoutData),
    rateExercise: (exerciseData) =>
        apiV2Post('/workouts/rate-exercise', exerciseData),
    addToProgram: (workoutData) =>
        apiV2Post('/workouts/addworkout', workoutData),
};

/**
 * Exercise Management API
 */
export const exercisesAPI = {
    getAll: () => apiV2Get('/exercises'),
    getById: (id) => apiV2Get(`/exercises/${id}`),
    create: (exerciseData) => apiV2Post('/exercises', exerciseData),
    update: (id, exerciseData) => apiV2Put(`/exercises/${id}`, exerciseData),
    delete: (id) => apiV2Delete(`/exercises/${id}`),
    upsertToWorkout: (workoutData) =>
        apiV2Post('/exercises/upsertExercisesToWorkout', workoutData),
};

/**
 * Muscle Groups API
 */
export const muscleGroupsAPI = {
    getAll: () => apiV2Get('/muscle-groups'),
    getById: (id) => apiV2Get(`/muscle-groups/${id}`),
    create: (muscleGroupData) => apiV2Post('/muscle-groups', muscleGroupData),
    update: (id, muscleGroupData) =>
        apiV2Put(`/muscle-groups/${id}`, muscleGroupData),
    delete: (id) => apiV2Delete(`/muscle-groups/${id}`),
};

/**
 * Authentication API
 */
export const authAPI = {
    login: (credentials) => {
        // Login doesn't use the standard auth header
        return fetch(`${API_V2_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials),
        }).then(handleApiV2Response);
    },
    signup: (userData) => {
        return fetch(`${API_V2_BASE}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        }).then(handleApiV2Response);
    },
    forgotPassword: (email) => {
        return fetch(`${API_V2_BASE}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        }).then(handleApiV2Response);
    },
    resetPassword: (token, newPassword) => {
        return fetch(`${API_V2_BASE}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword }),
        }).then(handleApiV2Response);
    },
};

/**
 * Statistics and Progress API
 */
export const statsAPI = {
    getExerciseProgression: (programId) =>
        apiV2Get(`/progression/programs/${programId}/exercises`),
    getVolumeData: (programId, timeframe = 'program') =>
        apiV2Get(
            `/completed-exercises/programs/${programId}?timeframe=${timeframe}`,
        ),
    getWorkoutProgress: (programId, timeframe = 'program') =>
        apiV2Get(
            `/workout-progress/programs/${programId}?timeframe=${timeframe}`,
        ),
};

/**
 * Templates API
 */
export const templatesAPI = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams(filters);
        const endpoint = params.toString()
            ? `/templates?${params}`
            : '/templates';
        return apiV2Get(endpoint);
    },
    getById: (id) => apiV2Get(`/templates/${id}`),
    createProgram: (templateId, customName = null) =>
        apiV2Post(`/templates/${templateId}/create-program`, { customName }),
    create: (templateData) => apiV2Post('/templates', templateData),
    update: (id, templateData) => apiV2Put(`/templates/${id}`, templateData),
    delete: (id) => apiV2Delete(`/templates/${id}`),
};

/**
 * User Settings API
 */
export const userSettingsAPI = {
    get: () => apiV2Get('/user-settings'),
    update: (settings) => apiV2Patch('/user-settings', settings),
    getDefaults: () => apiV2Get('/user-settings/defaults'),
    reset: () => apiV2Post('/user-settings/reset'),
};

export default {
    // Core functions
    apiV2Request,
    apiV2Get,
    apiV2Post,
    apiV2Put,
    apiV2Patch,
    apiV2Delete,
    handleApiV2Response,

    // Specific APIs
    users: usersAPI,
    programs: programsAPI,
    workouts: workoutsAPI,
    exercises: exercisesAPI,
    muscleGroups: muscleGroupsAPI,
    auth: authAPI,
    stats: statsAPI,
    templates: templatesAPI,
    userSettings: userSettingsAPI,
};
