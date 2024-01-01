import express from 'express';
import morgan from 'morgan';
import path from 'path';
import { MongoClient } from 'mongodb';

const app = express();
app.locals.pretty = app.get('env') === 'development';

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

// Adres URL bazy danych MongoDB
const mongoUrl = 'mongodb://127.0.0.1:27017';

// Utwórz połączenie z bazą danych
const client = new MongoClient(mongoUrl);

// Połącz się z bazą danych przed uruchomieniem serwera
client.connect()
    .then(() => {
        console.log('Connected to MongoDB');

        // Ustawienie katalogu views
        app.set('views', path.join(process.cwd(), 'views'));

        // Ustawienie silnika widoków na Pug
        app.set('view engine', 'pug');

        app.get('/', async (request, response) => {
            try {
                // Pobierz wszystkich studentów z bazy danych
                const allStudents = await client.db('AGH').collection('students').find().toArray();
        
                // Renderowanie widoku 'students' i przekazanie danych
                response.render('students', { students: allStudents, showDepartmentColumn: false });
            } catch (error) {
                console.error('Error retrieving all students:', error);
                response.status(500).send('Internal Server Error');
            }
        });


        app.get('/:department', async (request, response) => {
            const { department } = request.params;
            const departmentAcronym = department.toUpperCase();

            try {
                // Pobierz dane z bazy danych dla danego wydziału
                const students = await client.db('AGH').collection('students').find({ "departmentAcronym": departmentAcronym }).toArray();

                // Renderowanie widoku 'students' i przekazanie danych
                response.render('students', { students, showDepartmentColumn: true });
            } catch (error) {
                console.error('Error retrieving students:', error);
                response.status(500).send('Internal Server Error');
            }
        });

        app.listen(8000, () => {
            console.log('The server was started on port 8000');
            console.log('To stop the server, press "CTRL + C"');
        });
    })
    .catch((err) => console.error('Error connecting to MongoDB:', err));

app.use(express.static('public'));

export default app;
