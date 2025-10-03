import React, { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

const BaselineManager = ({ programId, userId, onBaselinesChange }) => {
  // Simplified version - baseline functionality not available in current API
  useEffect(() => {
    if (onBaselinesChange) {
      onBaselinesChange([]);
    }
  }, [programId, onBaselinesChange]);

  return (
    <div className="baseline-manager">
      <div className="baseline-manager__placeholder">
        <AlertCircle size={48} className="placeholder-icon" />
        <h3>Baseline Management</h3>
        <p>
          Baseline functionality is not available in the current API implementation.
          This feature will be available once the backend baseline endpoints are implemented.
        </p>
        <div className="placeholder-info">
          <p><strong>What are baselines?</strong></p>
          <p>
            Baselines are starting reference points for AUTOMATED programs that help
            track progression over time. They define the initial sets, reps, and weights
            for each exercise in the program.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BaselineManager;