global.fetch = require('node-fetch');
(async () => {
  const token = '84jOqQsBoGTb5al6sos7A6NrkcbxOog85gBJ26Eg8Yk';
  const ports = [3000, 3001];
  for (const port of ports) {
    try {
      const res = await fetch(`http://localhost:${port}/api/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({ title: 'Prueba despues de migracion', type: 'note', content: 'contenido', color: '#fff' }),
      });
      console.log('port', port, 'status', res.status);
      const text = await res.text();
      try {
        console.log(JSON.parse(text));
      } catch (e) {
        console.log(text);
      }
    } catch (e) {
      console.error('port', port, 'error', e.message);
    }
  }
})();
