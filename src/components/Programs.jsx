import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';

function Programs() {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [programs, setPrograms] = useState([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [errorPrograms, setErrorPrograms] = useState(null);


  const [errorUsers, setErrorUsers] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const programNameRef = useRef(null);
  const userSelectRef = useRef(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${process.env.REACT_APP_API_URL}/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // console.log(data)
        setUsers(data.data || []);
        setLoadingUsers(false);
      } catch (error) {
        setErrorUsers(error);
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const fetchPrograms = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_URL}/programs/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setPrograms(data.userPrograms || []);
      console.log("PROGRAMS:", data.userPrograms);
      setLoadingPrograms(false);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    console.log(programs)
  })

  const handleUserChange = (event) => {
    const selectedUserId = event.target.value;
    if (selectedUserId) {
      fetchPrograms(selectedUserId);
    }
  }

  const handleCreateProgram = async (event) => {
    event.preventDefault();
    const programName = programNameRef.current.value;
    const programRecipientId = userSelectRef.current.value;

    if (!programName) {
      setErrorMessage('You have to specify a program name.');
      return;
    }

    setErrorMessage('');

    const token = localStorage.getItem("token");
    const response = await fetch(`${process.env.REACT_APP_API_URL}/programs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ programRecipientId, programName })
    });

    if (response.ok) {
      console.log("Program created successfully");
      alert("Program created successfully")
    } else {
      console.error("Failed to create program");
      alert("Failed to create program")
    }
  }

  if (loadingUsers) {
    return <div>Loading...</div>; // You can replace this with a better loading indicator
  }

  if (errorUsers) {
    return <div>Error loading users: {errorUsers.message}</div>
  }

  return (
    <>
      <h1>Create program</h1>
      <div className='program-list-container'>
          {errorPrograms && <div>Error loading programs: {errorPrograms}</div>}
           {programs.length > 0 && (
            <div>
              <ul>
                {programs.map(program => (
                  <li key={program.id}>{program.name}</li>
                ))}
              </ul>
            </div>
          )}
      </div>
      <div className='create-program-container'>
        <h2>Create a new program</h2>
        <form onSubmit={handleCreateProgram}>
          <div className='create-program-container__name'>
            <label htmlFor="name">Program name</label>
            <input type="text" name="name" id="programName" ref={programNameRef} />
          </div>
          {errorMessage && <div className='error-message'>{errorMessage}</div>}
          <div className='select-container'>
            <label htmlFor="user">User</label>
            <select name="user" id="user" ref={userSelectRef} onChange={handleUserChange}>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  Name: {user.firstName} {user.lastName}, Username: {user.username}
                </option>
              ))}
            </select>
          </div>
          <button type="submit">Create program</button>
        </form>
      </div>
    </>
  )
}

export default Programs;
