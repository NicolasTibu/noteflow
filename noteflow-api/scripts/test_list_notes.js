global.fetch = require('node-fetch');
(async () => {
  try {
    const login = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test-user-debug@example.com', password: 'password123' }),
    });
    const j = await login.json();
    const token = j.token;
    const res = await fetch('http://localhost:3000/api/notes', {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
    });
    console.log('status', res.status);
    console.log(await res.text());
  } catch (e) {
    console.error(e);
  }
})();
