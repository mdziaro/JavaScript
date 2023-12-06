const dbPromise = createIndexedDB();

function createIndexedDB() {
  const dbName = 'SklepDB';
  const dbVersion = 1;

  const request = window.indexedDB.open(dbName, dbVersion);

  request.onupgradeneeded = function (event) {
    const db = event.target.result;
    
    if (!db.objectStoreNames.contains('products')) {
      const productStore = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true });
      productStore.createIndex('name', 'name', { unique: false });
    }

    if (!db.objectStoreNames.contains('customers')) {
      const customerStore = db.createObjectStore('customers', { keyPath: 'id', autoIncrement: true });
      customerStore.createIndex('firstName', 'firstName', { unique: false });
      customerStore.createIndex('lastName', 'lastName', { unique: false });
    }
  };

  return new Promise((resolve, reject) => {
    request.onsuccess = function (event) {
      resolve(event.target.result);
    };

    request.onerror = function (event) {
      reject(`Błąd przy otwieraniu bazy danych: ${event.target.error}`);
    };
  });
}

function addInitialData() {
  const products = [
    { name: 'Fiat Tipo', quantity: 1, price: 50000 },
    { name: 'Fiat 500', quantity: 5, price: 20000 },
    { name: 'Przyczepa z Plandeką', quantity: 8, price: 4000 },
    { name: 'Przyczepa Jednoosiowa', quantity: 30, price: 1000 },
    
  ];

  const customers = [
    { firstName: 'Jan', lastName: 'Kowalski' },
    { firstName: 'Anna', lastName: 'Nowak' },
    { firstName: 'Piotr', lastName: 'Wiśniewski' }
  ];

  dbPromise.then(db => {
    const transaction = db.transaction(['products', 'customers'], 'readwrite');

    // Dodaj produkty
    products.forEach(product => {
      const productStore = transaction.objectStore('products');
      productStore.add(product);
    });

    // Dodaj klientów
    customers.forEach(customer => {
      const customerStore = transaction.objectStore('customers');
      customerStore.add(customer);
    });
  });
}

function executeCommand() {
  const commandInput = document.getElementById('commandInput').value;

  switch (commandInput.toLowerCase()) {
    case 'lista produktów':
      console.group('Lista Produktów');
      listProducts();
      break;
    case 'lista klientów':
      console.group('Lista Klientów');
      listCustomers();
      break;
    case 'help':
      console.group('Pomoc');
      help();
      break;
    default:
      console.error('Nieznane polecenie. Wprowadź poprawne polecenie.');
      break;
  }

  console.groupEnd();
}

function listProducts() {
  dbPromise.then(db => {
    const transaction = db.transaction('products', 'readonly');
    const productStore = transaction.objectStore('products');
    const request = productStore.openCursor();

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        console.log(`ID: ${cursor.key}, Nazwa: ${cursor.value.name}, Ilość: ${cursor.value.quantity}, Cena: ${cursor.value.price}`);
        cursor.continue();
      } else {
        console.log('Koniec listy produktów.');
      }
    };

    request.onerror = function () {
      console.error('Błąd podczas listowania produktów.');
    };
  });
}

function listCustomers() {
  dbPromise.then(db => {
    const transaction = db.transaction('customers', 'readonly');
    const customerStore = transaction.objectStore('customers');
    const request = customerStore.openCursor();

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        console.log(`ID: ${cursor.key}, Imię: ${cursor.value.firstName}, Nazwisko: ${cursor.value.lastName}`);
        cursor.continue();
      } else {
        console.log('Koniec listy klientów.');
      }
    };

    request.onerror = function () {
      console.error('Błąd podczas listowania klientów.');
    };
  });
}

function help() {
  console.log('Dostępne polecenia:');
  console.log('  - "lista produktów": Wyświetla listę produktów');
  console.log('  - "lista klientów": Wyświetla listę klientów');
  console.log('  - "help": Wyświetla pomoc (to menu)');
}

// Dodaj zahardcodowane dane przy starcie
addInitialData();
