const BASE = 'http://localhost:4000';
const headers = { 'Content-Type': 'application/json' };

async function req(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed;
  try { parsed = JSON.parse(text); } catch { parsed = text; }
  console.log(`\n=== ${method} ${path} => ${res.status} ===`);
  console.log(typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2));
  return { status: res.status, body: parsed };
}

(async ()=>{
  try {
    await req('GET','/api/notes');

    const create = await req('POST','/api/notes',{
      title: 'Prueba automatizada',
      type: 'note',
      content: 'Contenido de prueba desde script',
      color: '#00ff00'
    });

    const id = create.body && create.body.id ? create.body.id : (create.body && create.body[0] && create.body[0].id ? create.body[0].id : null);
    if(!id) {
      console.error('No id returned, aborting further tests.');
      process.exit(0);
    }

    await req('GET',`/api/notes/${id}`);
    await req('PATCH',`/api/notes/${id}`,{ title: 'Actualizada por script' });
    await req('DELETE',`/api/notes/${id}`);
    await req('GET','/api/notes');
  } catch(e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
