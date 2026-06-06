require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    const res = await sql.query('SELECT id, email FROM public.users WHERE email = $1', ['test-user-debug@example.com']);
    console.log(res);
  } catch (e) {
    console.error(e);
  }
})();
