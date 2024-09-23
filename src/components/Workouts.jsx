import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

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
    const fetchWorkouts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${programId}/workouts`, {
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

  if (error) {
    return <div>{error}</div>
  }

  return (
    <div className='workouts-container'>
      <h2>My workouts</h2>
      {workouts.map((workout) => {
       return <Link to={`/training?id=${workout.id}`} key={workout.id}><div className='workouts-container__workout'>{workout.name}</div></Link>
      })}
    </div>
  );
}

export default Workouts;
