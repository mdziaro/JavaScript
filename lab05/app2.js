import express from 'express';
import morgan from 'morgan';
import path from 'path';

const app = express();
app.locals.pretty = app.get('env') === 'development';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Tablica obiektów students
let students = [
    {
        fname: 'Jan',
        lname: 'Kowalski',
    },
    {
        fname: 'Anna',
        lname: 'Nowak',
    },
];

// Ustawienie katalogu views
app.set('views', path.join(process.cwd(), 'views'));

// Ustawienie silnika widoków na Pug
app.set('view engine', 'pug');

// Obsługa formularza GET dla index
app.get('/', (request, response) => {
    // Renderowanie widoku 'index'
    response.render('index');
});

// Obsługa formularza GET dla students
app.get('/students', (request, response) => {
    // Renderowanie widoku 'students' i przekazanie tablicy students
    response.render('students', { students });
});

app.listen(8000, () => {
    console.log('The server was started on port 8000');
    console.log('To stop the server, press "CTRL + C"');
});

app.use(express.static('public'));


export default app; 
