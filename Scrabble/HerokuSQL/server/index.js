import {createServer} from 'http';
import {parse} from 'url';
import {join} from 'path';
import {writeFile, readFileSync, existsSync} from 'fs';
import pgp from "pg-promise";

// CREATE TABLE wordScores (name VARCHAR(255), word VARCHAR(255), score INT, PRIMARY KEY(name, word, score));
// CREATE TABLE gameScores (name VARCHAR(255), score INT, PRIMARY KEY(name, score));

// Local Postgres credentials
const username = "postgres";
const password = "admin";

const url = process.env.DATABASE_URL || `postgres://${username}:${password}@localhost/`;
const db = pgp()(url);

async function connectAndRun(task) {
    let connection = null;

    try {
        connection = await db.connect();
        return await task(connection);
    } catch (e) {
        throw e;
    } finally {
        try {
            connection.done();
        } catch(ignored) {

        }
    }
}

createServer(async (req, res) => {
    const parsed = parse(req.url, true);

    if (parsed.pathname === '/wordScore') {
        let body = '';
        req.on('data', data => body += data);
        req.on('end', async () => {
            const data = JSON.parse(body);
            await connectAndRun(db => db.none("INSERT INTO wordScores VALUES($1, $2, $3);", [data.name, data.word, data.score]));
            res.end();
        });
    } else if (parsed.pathname === '/gameScore') {
        let body = '';
        req.on('data', data => body += data);
        req.on('end', async () => {
            const data = JSON.parse(body);
            await connectAndRun(db => db.none("INSERT INTO gameScores VALUES($1, $2);", [data.name, data.score]));
            res.end();
        });
    } else if (parsed.pathname === '/highestWordScores') {
        res.end(JSON.stringify(
            await connectAndRun(db => db.any("SELECT * FROM wordScores ORDER BY score DESC LIMIT 10"))
        ));
    } else if (parsed.pathname === '/highestGameScores') {
        res.end(JSON.stringify(
            await connectAndRun(db => db.any("SELECT * FROM gameScores ORDER BY score DESC LIMIT 10"))
        ));
    } else {
        // If the client did not request an API endpoint, we assume we need to fetch a file.
        // This is terrible security-wise, since we don't check the file requested is in the same directory.
        // This will do for our purposes.
        const filename = parsed.pathname === '/' ? "index.html" : parsed.pathname.replace('/', '');
        const path = join("client/", filename);
        console.log("trying to serve " + path + "...");
        if (existsSync(path)) {
            if (filename.endsWith("html")) {
                res.writeHead(200, {"Content-Type" : "text/html"});
            } else if (filename.endsWith("css")) {
                res.writeHead(200, {"Content-Type" : "text/css"});
            } else if (filename.endsWith("js")) {
                res.writeHead(200, {"Content-Type" : "text/javascript"});
            } else {
                res.writeHead(200);
            }

            res.write(readFileSync(path));
            res.end();
        } else {
            res.writeHead(404);
            res.end();
        }
    }
}).listen(process.env.PORT || 8080);