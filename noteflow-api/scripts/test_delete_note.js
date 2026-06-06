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
    const noteId = '53311279-6de2-480c-b541-5b18f6ae3a5c';
    const del = await fetch(`http://localhost:3000/api/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: 'Bearer ' + token },
    });
    console.log('status', del.status);
    const text = await del.text();
    console.log(text);
  } catch (e) {
    console.error(e);
  }
})();
