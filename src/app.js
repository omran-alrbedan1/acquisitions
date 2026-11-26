import express from 'express';
import { sql } from 'drizzle-orm';
import { db } from './config/database.js';
import { users } from './models/user.model.js';

const app = express();

app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('hello from acquisitions');
});

app.get('/health', async (req, res) => {
  try {
    const result = await db.execute(
      sql`SELECT current_database() AS database, now() AS time`
    );
    res.status(200).json({
      status: 'ok',
      database: result.rows[0].database,
      time: result.rows[0].time,
    });
  } catch (_err) {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

app.get('/users', async (req, res) => {
  const rows = await db.select().from(users).orderBy(users.id);
  res.status(200).json(rows);
});

app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const [user] = await db.insert(users).values({ name, email }).returning();
  res.status(201).json(user);
});

export default app;
