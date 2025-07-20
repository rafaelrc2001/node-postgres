import pg from 'pg';


export const pool = new pg.Pool({
    user: "postgres",
    host: "localhost",
    password: "Drrc2001",
    database: "nodepg",
    port: "5433",
});




