import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';


function MyPrograms() {
    const [programs, setPrograms] = useState([]);
    const [loadingPrograms, setLoadingPrograms] = useState(true);
    const [errorPrograms, setErrorPrograms] = useState(null);

    useEffect(() => {
        const fetchPrograms = async () => {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/programs`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            const data = await response.json();
            setPrograms(data.programs);
            setLoadingPrograms(false);
          } catch (error) {
            setErrorPrograms(error);
            setLoadingPrograms(false);
          }
        };
    
        fetchPrograms();
      }, []);

      if (loadingPrograms) {
        return <div>Loading...</div>; // You can replace this with a better loading indicator
      }
    
      if (errorPrograms) {
        return <div>Error loading programs: {errorPrograms.message}</div>
      }

  return (
    <div className='programs-container'>
    <h2>My programs</h2>
    {programs.map((program) => (
      <Link to={`/workouts?id=${program.id}`} key={program.id}>
        <div className='programs-container__program'>{program.name}</div>
      </Link>
    ))}
  </div>
  )
}

export default MyPrograms