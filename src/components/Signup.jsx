import React, { useState } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

const Signup = () => {
  const [recaptchaToken, setRecaptchaToken] = useState(null);

//   console.log(process.env.REACT_APP_RECAPTCHA_SITE_KEY)

  const handleSignup = async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);

    const response = await fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        password: data.get('password'),
        recaptchaToken
      })
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSignup}>
      <input type="text" name="firstName" placeholder="First Name" required />
      <input type="text" name="lastName" placeholder="Last Name" required />
      <input type="email" name="email" placeholder="Email" required />
      <input type="password" name="password" placeholder="Password" required />
      <ReCAPTCHA
        sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
        onChange={(token) => setRecaptchaToken(token)}
      />
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default Signup;
