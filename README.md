# SupabaseAlive ⚡

Keep your Supabase projects active and prevent them from being paused due to inactivity.

## Features
- Monitor multiple Supabase projects.
- Automate insertions into an `alive` table to simulate activity.
- Configurable frequency (in hours).
- Premium Dashboard with glassmorphism design.

## Deployment Instructions

### 1. Docker (Recommended)
This app is ready to be deployed using Docker. It uses a SQLite database, so you **must** mount a persistent volume to keep your project data after restarts.

```bash
# Build the image
docker build -t supabase-alive .

# Run the container with a persistent volume for the database
docker run -d \
  -p 3000:3000 \
  -v supabase_alive_data:/usr/src/app/data \
  --name supabase-alive \
  supabase-alive
```

### 2. Manual Deploy (Node.js)
1. Clone the repository.
2. Install dependencies: `npm install --production`.
3. Set environment variables (optional):
   - `PORT`: defaults to 3000.
   - `DATABASE_PATH`: absolute path to the `.sqlite` file.
4. Start the app: `npm start`.

### 3. Database Setup (In Supabase)
For each project you add to the dashboard, you must run this SQL in the Supabase SQL Editor:

```sql
create table if not exists alive (
  id uuid default gen_random_uuid() primary key,
  word text not null,
  created_at timestamp with time zone default now()
);

-- Recommended for simplicity, but you can restrict it as needed
alter table alive enable row level security;
create policy "Enable insert for everyone" on alive for insert with check (true);
```

## Environment Variables
- `PORT`: Port where the server will run (default: 3000).
- `DATABASE_PATH`: Path to the SQLite database file. Useful for persistent volumes in Docker/Easypanel.

## License
MIT
