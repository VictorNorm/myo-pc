import React, { useState, useEffect } from 'react';
import { exercisesAPI, muscleGroupsAPI } from '../utils/api/apiV2';
import toast from 'react-hot-toast';
import '../styles/_createExercise.scss';

const CATEGORIES = [
  { value: 'COMPOUND', label: 'Compound' },
  { value: 'ISOLATION', label: 'Isolation' },
];

const EQUIPMENT = [
  { value: 'BARBELL', label: 'Barbell' },
  { value: 'DUMBBELL', label: 'Dumbbell' },
  { value: 'CABLE', label: 'Cable' },
  { value: 'MACHINE', label: 'Machine' },
  { value: 'BODYWEIGHT', label: 'Bodyweight' },
];

const CreateExercise = () => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'COMPOUND',
    equipment: 'BARBELL',
    videoUrl: '',
    muscleGroupIds: [],
    notes: '',
  });

  // UI state
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recentlyCreated, setRecentlyCreated] = useState([]);

  useEffect(() => {
    fetchMuscleGroups();
  }, []);

  const fetchMuscleGroups = async () => {
    try {
      const data = await muscleGroupsAPI.getAll();
      setMuscleGroups(data);
    } catch (error) {
      toast.error('Failed to load muscle groups');
      console.error('Error fetching muscle groups:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMuscleGroupChange = (muscleGroupId) => {
    setFormData(prev => {
      const currentIds = prev.muscleGroupIds;
      if (currentIds.includes(muscleGroupId)) {
        return { ...prev, muscleGroupIds: currentIds.filter(id => id !== muscleGroupId) };
      } else {
        return { ...prev, muscleGroupIds: [...currentIds, muscleGroupId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Exercise name is required');
      return;
    }
    if (formData.muscleGroupIds.length === 0) {
      toast.error('Select at least one muscle group');
      return;
    }

    setLoading(true);
    try {
      const exerciseData = {
        name: formData.name.trim(),
        category: formData.category,
        equipment: formData.equipment,
        videoUrl: formData.videoUrl.trim() || null,
        muscleGroupIds: formData.muscleGroupIds,
        notes: formData.notes.trim() || null,
      };

      const created = await exercisesAPI.create(exerciseData);

      toast.success(`Created: ${created.name}`);
      setRecentlyCreated(prev => [created, ...prev]);

      // Reset form (keep category and equipment for convenience)
      setFormData(prev => ({
        ...prev,
        name: '',
        videoUrl: '',
        muscleGroupIds: [],
        notes: '',
      }));
    } catch (error) {
      // Debug: log full error object
      console.error('Error creating exercise:', error);
      console.error('error.errors:', error.errors);
      console.error('error.response:', error.response);

      // Extract detailed validation errors if available
      let errorMessage = error.message || 'Failed to create exercise';

      if (error.errors && Array.isArray(error.errors)) {
        // Format validation errors from backend: { field, message }
        const errorMessages = error.errors
          .map(e => e.message)
          .join(', ');
        if (errorMessages) {
          errorMessage = errorMessages;
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-exercise">
      <h1>Create Exercise</h1>

      <form onSubmit={handleSubmit} className="create-exercise__form">
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Exercise Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Barbell Bench Press"
            disabled={loading}
          />
        </div>

        {/* Category */}
        <div className="form-group">
          <label htmlFor="category">Category *</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            disabled={loading}
          >
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Equipment */}
        <div className="form-group">
          <label htmlFor="equipment">Equipment *</label>
          <select
            id="equipment"
            name="equipment"
            value={formData.equipment}
            onChange={handleInputChange}
            disabled={loading}
          >
            {EQUIPMENT.map(eq => (
              <option key={eq.value} value={eq.value}>{eq.label}</option>
            ))}
          </select>
        </div>

        {/* Video URL */}
        <div className="form-group">
          <label htmlFor="videoUrl">Video URL</label>
          <input
            type="url"
            id="videoUrl"
            name="videoUrl"
            value={formData.videoUrl}
            onChange={handleInputChange}
            placeholder="https://vimeo.com/..."
            disabled={loading}
          />
        </div>

        {/* Muscle Groups */}
        <div className="form-group">
          <label>Muscle Groups *</label>
          <div className="muscle-groups-grid">
            {muscleGroups.map(mg => (
              <label key={mg.id} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.muscleGroupIds.includes(mg.id)}
                  onChange={() => handleMuscleGroupChange(mg.id)}
                  disabled={loading}
                />
                {mg.name}
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            placeholder="Any additional notes..."
            rows={3}
            disabled={loading}
          />
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create Exercise'}
        </button>
      </form>

      {/* Recently Created */}
      {recentlyCreated.length > 0 && (
        <div className="recently-created">
          <h2>Recently Created ({recentlyCreated.length})</h2>
          <ul>
            {recentlyCreated.map(ex => (
              <li key={ex.id}>
                <strong>{ex.name}</strong> - {ex.category} / {ex.equipment}
                {ex.videoUrl && <span className="has-video"> 🎬</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CreateExercise;
