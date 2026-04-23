const axios = require('axios');
(async () => {
  try {
    const res = await axios.post('http://127.0.0.1:5002/api/auth/register', {
      name: "Test User",
      email: "test_cookie@test.com",
      password: "password123",
      role: "user"
    });
    console.log("Register Auth Headers:", res.headers['set-cookie']);
  } catch (e) {
    if(e.response) {
      if(e.response.status === 400 && e.response.data.message === 'User already exists') {
        const res = await axios.post('http://127.0.0.1:5002/api/auth/login', {
          email: "test_cookie@test.com",
          password: "password123"
        });
        console.log("Login Auth Headers:", res.headers['set-cookie']);
      } else {
        console.log(e.response.data);
      }
    } else {
      console.log(e);
    }
  }
})();
