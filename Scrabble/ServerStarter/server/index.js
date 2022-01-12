import {createServer} from 'http';
import {parse} from 'url';
import {writeFile, readFileSync, existsSync} from 'fs';

let database;
if (existsSync("database.json")) {
    database = JSON.parse(readFileSync("database.json"));
} else {
    database = {
        wordScores: [],
        gameScores: []
    };
}

createServer(async (req, res) => {
    const parsed = parse(req.url, true);

    if (parsed.pathname === '/wordScore') {
        let body = '';
        req.on('data', data => body += data);
        req.on('end', () => {
            const data = JSON.parse(body);
            database.wordScores.push({
                name: data.name,
                word: data.word,
                score: data.score
            });
            
            writeFile("database.json", JSON.stringify(database), err => {
                if (err) {
                    console.err(err);
                } else res.end();
            });
        });
    } else if (parsed.pathname === '/gameScore') {
        let body = '';
        req.on('data', data => body += data);
        req.on('end', () => {
            const data = JSON.parse(body);
            database.gameScores.push({
                name: data.name,
                score: data.score
            });
            
            writeFile("database.json", JSON.stringify(database), err => {
                if (err) {
                    console.err(err);
                } else res.end();
            });
        });
    } else if (parsed.pathname === '/highestWordScores') {
        res.end(JSON.stringify(
            database.wordScores.sort((a, b) => b.score - a.score).filter((v, i) => i < 10)
        ));
    } else if (parsed.pathname === '/highestGameScores') {
        res.end(JSON.stringify(
            database.gameScores.sort((a, b) => b.score - a.score).filter((v, i) => i < 10)
        ));
    } else {
        res.writeHead(404);
        res.end();
    }
}).listen(8080);