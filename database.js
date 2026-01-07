const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: './database.sqlite'
    },
    useNullAsDefault: true
});

async function initDb() {
    const exists = await knex.schema.hasTable('projects');
    if (!exists) {
        await knex.schema.createTable('projects', table => {
            table.increments('id').primary();
            table.string('name').notNullable();
            table.string('supabase_url').notNullable();
            table.string('supabase_key').notNullable();
            table.integer('frequency_hours').defaultTo(24);
            table.timestamp('last_heartbeat');
            table.string('status').defaultTo('active');
        });
        console.log('Database initialized');
    }
}

module.exports = { knex, initDb };
