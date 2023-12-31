import http from 'http';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Zmienna przechowująca ścieżkę do bieżącego pliku.
 * @type {string}
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Zmienna przechowująca katalog bieżącego pliku.
 * @type {string}
 */
const __dirname = dirname(__filename);

/**
 * Ścieżka do pliku gościnnego.
 * @type {string}
 */
const guestbookFilePath = join(__dirname, 'guestbook.txt');

/**
 * Funkcja wczytująca wpisy z księgi gościnnej.
 * @returns {string[]} Tablica wpisów.
 */
function loadGuestbook() {
    try {
        const data = fs.readFileSync(guestbookFilePath, 'utf8');
        return data.split('\n').filter(entry => entry.trim() !== '');
    } catch (error) {
        console.error('Error loading guestbook:', error.message);
        return [];
    }
}

/**
 * Funkcja zapisująca nowy wpis w księdze gościnnej.
 * @param {string} name - Imię i nazwisko autora wpisu.
 * @param {string} message - Treść wpisu.
 */
function saveEntry(name, message) {
    const entry = `${name}\n${message}\n`;
    fs.appendFileSync(guestbookFilePath, entry);
}

/**
 * Generuje HTML na podstawie wczytanych wpisów z księgi gościnnej.
 * @returns {string} Wygenerowany HTML.
 */
function generateGuestbookHTML() {
    const entries = loadGuestbook();
    let guestbookHTML = '';

    for (let i = 0; i < entries.length; i += 2) {
        const name = entries[i];
        const message = entries[i + 1];
        guestbookHTML += `
            <div class="card-body">
                <div class="card-text">
                    <h2>${name}</h2>
                    <p>${message}</p>
                </div>
                <hr>
            </div>`;
    }

    return guestbookHTML;
}

/**
 * Obsługuje żądanie HTTP.
 * @param {http.IncomingMessage} request - Obiekt reprezentujący przychodzące żądanie.
 * @param {http.ServerResponse} response - Obiekt reprezentujący odpowiedź serwera.
 */
function handleRequest(request, response) {
    if (request.method === 'GET' && request.url === '/') {
        const guestbookHTML = generateGuestbookHTML();

        const html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>Guestbook</title>
                <link rel="stylesheet" href="styles.css">
            </head>
            <body>
                ${guestbookHTML}
                <fieldset>
                    <legend>Nowy wpis:</legend>
                    <form method="POST" action="/submit">
                        <div class="form-group">
                            <label for="name">Twoje imię i nazwisko</label>
                            <input type="text" class="form-control" name="name" placeholder="Imię Nazwisko...   ">
                        </div>
                        <div class="form-group">
                            <label for="content">Treść wpisu</label>
                            <textarea class="form-control" name="message" rows="3" placeholder="Treść wpisu..."></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary">Dodaj wpis</button>
                    </form>
                </fieldset>
            </body>
            </html>`;

        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        response.write(html);
        response.end();
    } else if (request.method === 'POST' && request.url === '/submit') {
        let data = '';
        request.on('data', chunk => {
            data += chunk;
        });

        request.on('end', () => {
            const params = new URLSearchParams(data);
            const name = params.get('name');
            const message = params.get('message');

            if (name && message) {
                saveEntry(name, message);
                response.writeHead(302, { 'Location': '/' });
                response.end();
            } else {
                response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
                response.write('Bad Request: Missing name or message');
                response.end();
            }
        });
    } else {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.write('Not Found');
        response.end();
    }
}

/**
 * Obiekt serwera HTTP.
 * @type {http.Server}
 */
const server = http.createServer(handleRequest);

/**
 * Port, na którym serwer nasłuchuje.
 * @type {number}
 */
const port = 8000;

// Start serwera
server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}/`);
});
