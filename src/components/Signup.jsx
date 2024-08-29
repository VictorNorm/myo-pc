import React, { useState } from 'react';
// import ReCAPTCHA from 'react-google-recaptcha';

const Signup = () => {
  // const [recaptchaToken, setRecaptchaToken] = useState(null);

//   console.log(process.env.REACT_APP_RECAPTCHA_SITE_KEY)

  const handleSignup = async (event) => {
    event.preventDefault();
    const form = event.target;
    const data = new FormData(form);

    const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        firstName: data.get('firstName'),
        lastName: data.get('lastName'),
        email: data.get('email'),
        password: data.get('password'),
        // recaptchaToken
      })
    });

    const result = await response.json();
    console.log(result);
  };

  return (
    <div className='signup'>
      <form onSubmit={handleSignup}>
        <div>
          <label htmlFor="firstName">First name</label>
          <input type="text" name="firstName" required className='input-primary'/>
        </div>
        <div>
          <label htmlFor="lastName">Last name</label>
          <input type="text" name="lastName" required className='input-primary'/>
        </div>
        <div>
          <label htmlFor="email">Email</label>
          <input type="email" name="email" required className='input-primary'/>
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" required minLength="4" className='input-primary'/>
        </div>
        {/* <ReCAPTCHA
          sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          onChange={(token) => setRecaptchaToken(token)}
          className='recaptcha'
        /> */}
        <button type="submit" className='cta-1'>Sign Up</button>
      </form>
    </div>
  );
};

export default Signup;
