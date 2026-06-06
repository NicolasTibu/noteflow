require('dotenv').config({ path: '.env.local' });
(async () => {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);
    const res = await sql.query("SELECT column_name FROM information_schema.columns WHERE table_name='notes' AND table_schema='public' ORDER BY ordinal_position");
    console.log(res);
  } catch (e) {
    console.error('ERROR', e);
    process.exit(1);
  }
})();
