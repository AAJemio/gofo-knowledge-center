const { Client } = require('pg');

const checkConnection = async (dbName) => {
    const connectionString = `postgresql://admin:admin@localhost:5432/${dbName}`;
    console.log(`Testing connection to ${dbName}...`);
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log(`SUCCESS: Connected to ${dbName}`);
        await client.end();
        return true;
    } catch (err) {
        console.error(`FAILED: Could not connect to ${dbName}`);
        console.error(err.message);
        await client.end();
        return false;
    }
};

const credentials = [
    { user: 'admin', pass: 'admin' },
    { user: 'postgres', pass: 'admin' },
    { user: 'postgres', pass: 'postgres' },
    { user: 'postgres', pass: 'password' },
    { user: 'postgres', pass: '123456' },
];

(async () => {
    for (const cred of credentials) {
        const connectionString = `postgresql://${cred.user}:${cred.pass}@localhost:5432/postgres`;
        console.log(`Testing ${cred.user}:${cred.pass}...`);
        const client = new Client({ connectionString });
        try {
            await client.connect();
            console.log(`SUCCESS: Connected with ${cred.user}:${cred.pass}`);
            await client.end();
            return; // Stop on success
        } catch (err) {
            console.log(`Failed: ${err.message}`);
            await client.end();
        }
    }
    console.log('All attempts failed.');
})();
