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
    const getRes = await fetch(`http://localhost:3000/api/notes/${noteId}/checklist-items`, {
      method: 'GET',
      headers: { Authorization: 'Bearer ' + token },
    });
    console.log('GET status', getRes.status);
    console.log(await getRes.text());

    const postRes = await fetch(`http://localhost:3000/api/notes/${noteId}/checklist-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
      body: JSON.stringify({ text: 'test item from script' }),
    });
    console.log('POST status', postRes.status);
    console.log(await postRes.text());
  } catch (e) {
    console.error(e);
  }
})();