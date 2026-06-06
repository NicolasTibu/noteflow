require('dotenv').config({ path: '.env.local' });
(async () => {
  try {
    const { neon } = require('@neondatabase/serverless');
    const sql = neon(process.env.DATABASE_URL);

    console.log('Starting migration: add owner_id to public.notes');
    await sql.query("BEGIN");

    await sql.query(
      "ALTER TABLE public.notes ADD COLUMN IF NOT EXISTS owner_id UUID"
    );
    console.log('Added column owner_id (if not exists)');

    const users = await sql.query("SELECT id FROM public.users LIMIT 1");
    if (users && users.length > 0) {
      const firstUserId = users[0].id;
      await sql.query(
        "UPDATE public.notes SET owner_id = $1 WHERE owner_id IS NULL",
        [firstUserId]
      );
      console.log('Backfilled existing notes with first user id:', firstUserId);
    } else {
      console.log('No users found to backfill owner_id; leaving existing rows NULL');
    }

    // PostgreSQL does not support ADD CONSTRAINT IF NOT EXISTS; check first
    const existing = await sql.query("SELECT conname FROM pg_constraint WHERE conname='notes_owner_id_fk'");
    if (!existing || existing.length === 0) {
      await sql.query(
        "ALTER TABLE public.notes ADD CONSTRAINT notes_owner_id_fk FOREIGN KEY (owner_id) REFERENCES public.users(id) NOT VALID"
      );
      console.log('Added FK constraint notes_owner_id_fk (NOT VALID)');
    } else {
      console.log('FK constraint notes_owner_id_fk already exists');
    }

    await sql.query('COMMIT');
    console.log('Migration committed successfully');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    try { const { neon } = require('@neondatabase/serverless'); const sql = neon(process.env.DATABASE_URL); await sql.query('ROLLBACK'); } catch (err) {}
    process.exit(1);
  }
})();
