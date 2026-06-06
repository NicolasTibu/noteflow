require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    const noteId = '53311279-6de2-480c-b541-5b18f6ae3a5c';
    const res = await sql.query('SELECT id, owner_id FROM public.notes WHERE id = $1', [noteId]);
    console.log(res);
  } catch (e) {
    console.error(e);
  }
})();
