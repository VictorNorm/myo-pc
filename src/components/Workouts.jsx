import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Workouts() {
  const [workouts, setWorkouts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const query = useQuery();
  const programId = query.get('id');

  useEffect(() => {
    console.log(programId)
    const fetchWorkouts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/programs/${programId}/workouts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log(data)
        setWorkouts(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (programId) {
      fetchWorkouts();
    }
  }, [programId]);

  useEffect(() => {
    console.log(workouts)
  })

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a better loading indicator
  }

  return (
    <div>
      {loading ? (
        'Loading...'
      ) : error ? (
        `Error: ${error.message}`
      ) : (
        <div>
          {/* <h2>{program.name}</h2> */}
          {/* <p>{program.description}</p> */}
          {/* Add more program details here */}
        </div>
      )}
    </div>
  );
}

export default Workouts;
