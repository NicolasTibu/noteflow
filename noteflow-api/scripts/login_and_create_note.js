global.fetch = require('node-fetch');
(async () => {
  try {
    const creds = { email: 'test-user-debug@example.com', password: 'password123' };
    const loginRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(creds),
    });
    console.log('login status', loginRes.status);
    const loginBody = await loginRes.text();
    try {
      const json = JSON.parse(loginBody);
      console.log('login body', json);
      const token = json.token;
      if (!token) {
        console.error('No token received');
        return;
      }
      const createRes = await fetch('http://localhost:3000/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ title: 'Prueba flujo integrado', type: 'note', content: 'contenido integrado', color: '#fff' }),
      });
      console.log('create status', createRes.status);
      const createBody = await createRes.text();
      try { console.log(JSON.parse(createBody)); } catch(e) { console.log(createBody); }
    } catch (e) {
      console.log('login text', loginBody);
    }
  } catch (e) {
    console.error('error', e.message);
  }
})();
