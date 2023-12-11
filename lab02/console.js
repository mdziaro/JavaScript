clearIndexedDB();
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
      customerStore.createIndex('fullName', ['firstName', 'lastName'], { unique: false }); 

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

function clearIndexedDB() {
  const dbName = 'SklepDB';

  const deleteRequest = window.indexedDB.deleteDatabase(dbName);

  deleteRequest.onsuccess = function () {
    //console.log('Baza danych usunięta pomyślnie.');
  };

  deleteRequest.onerror = function () {
    console.error('Błąd podczas usuwania bazy danych.');
  };
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
    const productStore = transaction.objectStore('products');
    products.forEach(product => {
      // Sprawdź, czy produkt już istnieje przed dodaniem
      const request = productStore.get(product.name);
      request.onsuccess = function (event) {
        if (!event.target.result) {
          productStore.add(product);
        }
      };
    });

    // Dodaj klientów
    const customerStore = transaction.objectStore('customers');
    customers.forEach(customer => {
      customerStore.add(customer);
    });
  });
}


function executeCommand() {
  const commandInput = document.getElementById('commandInput').value;
  const commandArgs = commandInput.split(' ');

  const command = commandArgs[0].toLowerCase();
  

  switch (command) {
    case 'sell':
      const customerFullName = `${commandArgs[1]} ${commandArgs[2]}`;
      const productId = parseInt(commandArgs[3]);
      const quantity = parseInt(commandArgs[4]);
      if (!isNaN(productId) && !isNaN(quantity) && commandArgs[1] && commandArgs[2]) {
        sellProduct(customerFullName, productId, quantity);
      } else {
        console.error('Nieprawidłowe argumenty. Użyj: "sell [imię] [nazwisko] [id_produktu] [ilosc] "');
      }
      break;
    case 'lista':
      const product = commandArgs[1];
      if (product === 'produktów') {
        console.group('Lista Produktów');
        listProducts();
        console.groupEnd();
      } else if (product === 'klientów') {
        console.group('Lista Klientów');
        listCustomers();
        console.groupEnd();
      } else {
        console.error('Nieznane polecenie. Wprowadź poprawne polecenie.');
      }
      break;
    case 'help':
      console.group('Pomoc');
      help();
      console.groupEnd();
      break;
    default:
      console.error('Nieznane polecenie. Wprowadź poprawne polecenie.');
      break;
  }
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

function sellProduct(customerName, product, quantity) {
  const [firstName, lastName] = customerName.split(' ');

  dbPromise.then(db => {
    const transaction = db.transaction(['customers', 'products'], 'readwrite');

    const customerStore = transaction.objectStore('customers');
    const productStore = transaction.objectStore('products');

    const customerIndex = customerStore.index('fullName');
    const customerRequest = customerIndex.openCursor(IDBKeyRange.only([firstName, lastName]));

    customerRequest.onsuccess = function (event) {
      const cursor = event.target.result;

      if (!cursor) {
        console.error('Nieprawidłowy klient.');
        return;
      }

      const customer = cursor.value;

      const productRequest = productStore.get(product);

      productRequest.onsuccess = function (event) {
        const product = event.target.result;

        if (!product) {
          console.error('Nieprawidłowy produkt.');
          return;
        }

        if (quantity <= 0) {
          console.error('Nie można sprzedawać ujemnej ilości produktu.');
          return;
        }

        if (product.quantity < quantity) {
          console.error('Brak wystarczającej ilości produktu w magazynie.');
          return;
        }

        // Update product quantity
        product.quantity -= quantity;
        productStore.put(product);

        // Add the purchase to the customer's history
        if (!customer.purchases) {
          customer.purchases = [];
        }

        customer.purchases.push({
          product: product.id,
          quantity,
          price: product.price,
        });

        cursor.update(customer);

        console.log(`Sprzedano ${quantity} szt. produktu ID ${product.id} klientowi ${customerName}.`);
      };
    };
  });
}




function listCustomerPurchases(customerId) {
  dbPromise.then(db => {
    const transaction = db.transaction('customers', 'readonly');
    const customerStore = transaction.objectStore('customers');
    const request = customerStore.get(customerId);

    request.onsuccess = function (event) {
      const customer = event.target.result;

      if (customer && customer.purchases && customer.purchases.length > 0) {
        console.group(`Historia zakupów klienta ${customer.firstName} ${customer.lastName}`);
        
        let totalAmount = 0;
        customer.purchases.forEach(purchase => {
          const productInfo = `ID produktu: ${purchase.product}, Ilość: ${purchase.quantity}, Cena: ${purchase.price}`;
          console.log(productInfo);
          totalAmount += purchase.quantity * purchase.price;
        });

        console.log(`Sumaryczna cena zakupów: ${totalAmount}`);
        
        console.groupEnd();
      } else {
        console.log('Brak historii zakupów dla danego klienta.');
      }
    };

    request.onerror = function () {
      console.error('Błąd podczas pobierania historii zakupów klienta.');
    };
  });
}


function help() {
  console.log('Dostępne polecenia:');
  console.log('  - "sell [produkt] [ilosc] [klient]": Sprzedaje określoną ilość produktu danemu klientowi');
  console.log('  - "lista produktów": Wyświetla listę produktów');
  console.log('  - "lista klientów": Wyświetla listę klientów');
  console.log('  - "help": Wyświetla pomoc (to menu)');
}


// Dodaj zahardcodowane dane przy starcie
addInitialData();
