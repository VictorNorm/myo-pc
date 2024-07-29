import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

const VerifyEmail = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const token = query.get('token');
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-email?token=${token}`);
      const result = await response.text(); // since we are using res.send() for plain text
      setMessage(result);
    };

    if (token) {
      verifyEmail();
    }
  }, [token]);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default VerifyEmail;
