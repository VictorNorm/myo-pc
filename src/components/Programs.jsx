import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`http://localhost:3000/programs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log(response)
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setPrograms(data.programs);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  useEffect(() => {
    console.log(programs)
  })


  if (loading) {
    return <div>Loading...</div>; // You can replace this with a better loading indicator
  }

  return (
    <div className='programs-container'>
      <h2>Programs</h2>
      {loading ? (
        'Loading...'
      ) : error ? (
        `Error: ${error.message}`
      ) : (
        programs.map((program) => (
          <Link to={`/workouts?id=${program.id}`} key={program.id}>
            <div>{program.name}</div>
          </Link>
        ))
      )}
    </div>
  )
}

export default Programs