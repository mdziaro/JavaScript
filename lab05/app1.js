import express from 'express';
import morgan from 'morgan';
const app = express();

app.use(morgan('dev'));

app.use(express.urlencoded({ extended: true })); //aby przeszedl 3 test 

app.get('/', (request, response) => {
    response.send(`
        <!DOCTYPE html>
        <html lang="en">
           <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>First Express application</title>
           </head>
           <body>
              <main>
                 <h1>First Express application</h1>
                 <form method="GET" action="/submit">
                    <label for="name">Give your name</label>
                    <input name="name">
                    <br>
                    <input type="submit">
                    <input type="reset">
                 </form>
                 <img src="/windowsmeadow.jpg" alt="Łąka z Windowsa">
              </main>
           </body>
        </html>
    `);
});

app.get('/submit', (request, response) => {
    response.set('Content-Type', 'text/plain');
    response.send(`Hello ${request.query.name}`);
});

app.post('/', (request, response) => {
    response.set('Content-Type', 'text/plain');
    response.send(`Hello ${request.body.name}`);
});

app.use(express.static('public'));

app.listen(8000, () => {
    console.log('The server was started on port 8000');
    console.log('To stop the server, press "CTRL + C"');
});
