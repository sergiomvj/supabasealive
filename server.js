const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { createClient } = require('@supabase/supabase-js');
const { knex, initDb } = require('./database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

// Random words list
const words = ['Supabase', 'Alive', 'Heartbeat', 'Active', 'Keeping', 'Growth', 'Dynamic', 'Engine', 'Database', 'Cloud', 'Auto', 'Pulse', 'Vital', 'Flow'];

async function performHeartbeat(project) {
    try {
        const supabase = createClient(project.supabase_url, project.supabase_key);
        const randomWord = words[Math.floor(Math.random() * words.length)] + ' ' + new Date().toLocaleTimeString();

        const { error } = await supabase
            .from('alive')
            .insert([{ word: randomWord }]);

        if (error) throw error;

        await knex('projects')
            .where('id', project.id)
            .update({
                last_heartbeat: new Date(),
                status: 'active'
            });

        console.log(`Heartbeat success for ${project.name}: ${randomWord}`);
    } catch (err) {
        console.error(`Heartbeat failed for ${project.name}:`, err.message);
        await knex('projects')
            .where('id', project.id)
            .update({ status: 'error' });
    }
}

// Check every hour if any project needs a heartbeat
cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled heartbeat check...');
    const projects = await knex('projects').select('*');
    const now = new Date();

    for (const project of projects) {
        const lastHeartbeat = project.last_heartbeat ? new Date(project.last_heartbeat) : new Date(0);
        const diffHours = (now - lastHeartbeat) / (1000 * 60 * 60);

        if (diffHours >= project.frequency_hours) {
            await performHeartbeat(project);
        }
    }
});

// API Routes
app.get('/api/projects', async (req, res) => {
    const projects = await knex('projects').select('*');
    res.json(projects);
});

app.post('/api/projects', async (req, res) => {
    const { name, supabase_url, supabase_key, frequency_hours } = req.body;
    const [id] = await knex('projects').insert({
        name,
        supabase_url,
        supabase_key,
        frequency_hours: frequency_hours || 24
    });
    const newProject = await knex('projects').where('id', id).first();
    res.json(newProject);
});

app.put('/api/projects/:id', async (req, res) => {
    const { name, supabase_url, supabase_key, frequency_hours } = req.body;
    await knex('projects')
        .where('id', req.params.id)
        .update({
            name,
            supabase_url,
            supabase_key,
            frequency_hours: frequency_hours || 24
        });
    const updatedProject = await knex('projects').where('id', req.params.id).first();
    res.json(updatedProject);
});

app.delete('/api/projects/:id', async (req, res) => {
    await knex('projects').where('id', req.params.id).del();
    res.status(204).send();
});

app.post('/api/projects/:id/heartbeat', async (req, res) => {
    const project = await knex('projects').where('id', req.params.id).first();
    if (!project) return res.status(404).json({ error: 'Project not found' });

    await performHeartbeat(project);
    const updatedProject = await knex('projects').where('id', project.id).first();
    res.json(updatedProject);
});

// Start server
async function start() {
    await initDb();
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

start();
