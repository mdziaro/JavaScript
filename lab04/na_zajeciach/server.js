const http = require('http');
const fs = require('fs');
const url = require('url');
const querystring = require('querystring');

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;

    if (req.method === 'GET') {
        if (path === '/add') {
            // Wyświetlenie formularza dodawania towaru
            sendFileContent(res, 'add.html');
        } else if (path === '/history') {
            const customerName = parsedUrl.query.customer;
            if (customerName) {
                // Pobierz historię klienta i wygeneruj stronę z historią
                const historyData = JSON.parse(fs.readFileSync('history.json', 'utf8'));
                const customerHistory = historyData[customerName] || [];
                
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.write(`<h1>Transaction History for ${customerName}</h1>`);
                if (customerHistory.length > 0) {
                    res.write('<ul>');
                    customerHistory.forEach(transaction => {
                        res.write('<li>');
                        res.write(`<strong>Transaction ID:</strong> ${transaction.transaction_id}<br>`);
                        res.write(`<strong>Products:</strong> ${transaction.products.join(', ')}<br>`);
                        res.write(`<strong>Total Price:</strong> ${transaction.total_price.toFixed(2)} PLN<br>`);
                        res.write('</li>');
                    });
                    res.write('</ul>');
                } else {
                    res.write('<p>No transaction history available for this customer.</p>');
                }
                res.end();
            } else {
                // Brak danych klienta - przekieruj na stronę główną
                res.writeHead(302, { 'Location': '/' });
                res.end();
            }
        } else if (path === '/products') {
            // Wyświetlenie listy produktów
            sendFileContent(res, 'products.json', 'application/json');
        } else if (path === '/customers') {
            // Wyświetlenie listy klientów
            sendFileContent(res, 'customers.json', 'application/json');
        } else if (path === '/') {
            // Wyświetlenie strony głównej
            sendFileContent(res, 'index.html');
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404 Not Found');
            res.end();
        }
    } else if (req.method === 'POST') {
        if (path === '/add') {
            // Operacja dodawania towaru
            handleAddProduct(req, res);
        } else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404 Not Found');
            res.end();
        }
    }
});

function sendFileContent(res, fileName, contentType = 'text/html') {
    fs.readFile(fileName, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write('404 Not Found');
            res.end();
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.write(data);
            res.end();
        }
    });
}

function handleAddProduct(req, res) {
    let body = '';
    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        const postData = querystring.parse(body);
        const product = {
            name: postData.product,
            price: parseFloat(postData.price),
            quantity: parseInt(postData.quantity)
        };

        // Zapis danych do pliku lub bazy danych (w tym przypadku zapis do pliku)
        const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));
        products.push(product);
        fs.writeFileSync('products.json', JSON.stringify(products, null, 2), 'utf8');

        // Przekierowanie na nową stronę po dodaniu towaru
        res.writeHead(302, { 'Location': '/' });
        res.end();
    });
}

const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
