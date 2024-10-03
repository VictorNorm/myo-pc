import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Verifying your email...');
  const [verificationComplete, setVerificationComplete] = useState(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');

      if (!token) {
        setMessage('Verification token is missing. Please check your email link.');
        setVerificationComplete(true);
        return;
      }

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/verify-email?token=${token}`);
        const data = await response.json();

        setMessage(data.message);
        setVerificationComplete(true);
      } catch (error) {
        console.error('Error during email verification:', error);
        setMessage('An error occurred. Please try again later.');
        setVerificationComplete(true);
      }
    };

    verifyEmail();
  }, [location]);

  useEffect(() => {
    let timer;
    if (verificationComplete) {
      timer = setTimeout(() => {
        navigate('/login');
      }, 5000); // 5 second delay before redirecting
    }
    return () => clearTimeout(timer);
  }, [verificationComplete, navigate]);

  return (
    <div>
      <h1>{message}</h1>
      {verificationComplete && (
        <p>You will be redirected to the login page in 5 seconds. Click <a href="/login">here</a> to go to login page immediately.</p>
      )}
    </div>
  );
};

export default VerifyEmail;