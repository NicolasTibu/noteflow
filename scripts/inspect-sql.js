process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_hvm2TlE3UaMH@ep-fragrant-bonus-alxyvydg-pooler.c-3.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

(async ()=>{
  try {
    const { neon } = await import('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    console.log('Running SELECT');
    const sel = await sql.query('SELECT 1 as v');
    console.log('SELECT raw:', sel);
    console.log('SELECT typeof:', typeof sel);
    console.log('SELECT rows:', sel.rows);

    console.log('\nRunning INSERT RETURNING (test)');
    const ins = await sql.query(
      "INSERT INTO notes (title, type) VALUES ($1, $2) RETURNING id, title",
      ['inspect', 'note']
    );
    console.log('INSERT raw:', ins);
    console.log('INSERT rows:', ins.rows);
    // cleanup
    const id = ins.rows && ins.rows[0] && ins.rows[0].id;
    if (id) {
      await sql.query('DELETE FROM notes WHERE id = $1', [id]);
    }
  } catch(e) {
    console.error('ERROR', e);
  }
  process.exit(0);
})();
