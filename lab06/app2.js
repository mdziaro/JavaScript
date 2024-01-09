import express from 'express';
import morgan from 'morgan';
import { encodeXML } from 'entities';
import cors from 'cors';
const app1 = express();
const app2 = express();

app1.set('view engine', 'pug');
app1.locals.pretty = app1.get('env') === 'development';

app2.use(morgan('dev'));
app2.use(express.urlencoded({ extended: false }));

// Dodanie middleware'u CORS

const corsOptions = {
    origin: 'http://localhost:8001', // lub dowolne inne źródło, z którego pochodzi żądanie
    credentials: true,
  };

app2.use(cors(corsOptions));

app1.get('/', function (request, response) {
    response.render('index2');
});

app2.all('/submit', function (req, res) {
    let name = req.query.name ?? req.body.name;

    switch (req.accepts(['html', 'text', 'json', 'xml'])) {
        case 'json':
            res.type('application/json');
            res.json({ welcome: `Hello '${name}'` });
            console.log(`\x1B[32mThe server sent a JSON document to the browser using the '${req.method}' method\x1B[0m`);
            break;

        case 'xml':
            name = name !== undefined ? encodeXML(name) : '';
            res.type('application/xml');
            res.send(`<welcome>Hello '${name}'</welcome>`);
            console.log(`\x1B[32mThe server sent an XML document to the browser using the '${req.method}' method\x1B[0m`);
            break;

        default:
            res.type('text/plain');
            res.send(`Hello '${name}'`);
            console.log(`\x1B[32mThe server sent plain text to the browser using the '${req.method}' method\x1B[0m`);
    }
});

app2.listen(8000, function () {
    console.log('The server was started on port 8000');
    app1.listen(8001, function () {
        console.log('The server was started on port 8001');
        console.log('To stop the servers, press "CTRL + C"');
    });
});
