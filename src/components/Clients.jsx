import { jwtDecode } from 'jwt-decode';
import React, { useEffect, useState } from 'react';
import Modal from './Modal';


function Clients() {

  const [users, setUsers] = useState([])
  const [usersError, setUsersError] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () =>{
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
        console.log(data);
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setUsersError('Failed to load users. Please try again later.');
      }
    }
    fetchUsers();
  }, [])

  const handleAssign = async (event) => {
    const token = localStorage.getItem("token");
    console.log(event.target.value)
    console.log(jwtDecode(token).id)

    try {
      const assignUser = await fetch(`${process.env.REACT_APP_API_URL}/assign-user`, {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          userId: Number.parseInt(event.target.value, 10)
        })
      })

      if (assignUser.ok) {
        setShowModal(true);
      }
      
    } catch (error) {
      console.log(error)
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <h1>Clients</h1>
      <div className='clients-container'>
        {users.map((user) => {
          return <div className='user' key={user.id}>
            <h3>{user.firstName} {user.lastName}</h3>
            <p>Email: {user.username}</p>
            <div className='clients-container__button-container'>
            <button type="submit" className='cta-1' onClick={handleAssign} value={user.id}>Assign user to me</button>
            </div>
          </div>
        })}
      </div>
      <Modal show={showModal} handleClose={handleCloseModal}>
        <h3>User successfully assigned!</h3>
      </Modal>
    </div>
  )
}

export default Clients