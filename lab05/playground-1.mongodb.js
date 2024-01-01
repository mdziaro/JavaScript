/* global use, db */
// MongoDB Playground
// Use Ctrl+Space inside a snippet or a string literal to trigger completions.

const database = 'AGH';
const collection = 'students';

// Create a new database.
use(database);

// Create a new collection.
if (!db.getCollectionNames().includes(collection)) {
  db.createCollection(collection);
}

// The prototype form to create a collection:
/* db.createCollection( <name>,
  {
    capped: <boolean>,
    autoIndexId: <boolean>,
    size: <number>,
    max: <number>,
    storageEngine: <document>,
    validator: <document>,
    validationLevel: <string>,
    validationAction: <string>,
    indexOptionDefaults: <document>,
    viewOn: <string>,
    pipeline: <pipeline>,
    collation: <document>,
    writeConcern: <document>,
    timeseries: { // Added in MongoDB 5.0
      timeField: <string>, // required for time series collections
      metaField: <string>,
      granularity: <string>,
      bucketMaxSpanSeconds: <number>, // Added in MongoDB 6.3
      bucketRoundingSeconds: <number>, // Added in MongoDB 6.3
    },
    expireAfterSeconds: <number>,
    clusteredIndex: <document>, // Added in MongoDB 5.3
  }
)*/

// More information on the `createCollection` command can be found at:
// https://www.mongodb.com/docs/manual/reference/method/db.createCollection/

db.getCollection(collection).deleteMany({});

// Utwórz kilka dokumentów / rekordów w kolekcji students
db.students.insertMany([
  { "firstName": "Jan", "lastName": "Kowalski", "departmentAcronym": "WIET" },
  { "firstName": "Anna", "lastName": "Nowak", "departmentAcronym": "WMS" },
  { "firstName": "Adam", "lastName": "Mickiewicz", "departmentAcronym": "WI" }
]);

// Wyszukaj studentów określonego wydziału (np. WI)
db.students.find({ "departmentAcronym": "WIET" });
