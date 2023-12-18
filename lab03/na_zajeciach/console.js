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
      productStore.createIndex('description', 'description', { unique: false });
      productStore.createIndex('price', 'price', { unique: false });
      productStore.createIndex('image', 'image', { unique: false });
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

  

  deleteRequest.onerror = function () {
    console.error('Błąd podczas usuwania bazy danych.');
  };
}


function addInitialData() {
  const productsData = [
    { name: 'Fiat Tipo', description:"Najlepsze Auto pod Słońcem", quantity: 1, price: 50000, image: 'car1.jpg'  },
    { name: 'Fiat 500', description:"Drugie Najlepsze auto pod Słońcem", quantity: 5, price: 20000, image: 'car2.jpg'  },
    { name: 'Przyczepa z Plandeką', description:"Najlepsza Przyczepa w okolicy", quantity: 8, price: 4000, image: 'car3.jpg'  },
    { name: 'Przyczepa Jednoosiowa', description:"Może nie jest najlepsza, ale jaka tania!", quantity: 30, price: 1000, image: 'car4.jpg'  },
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
    productsData.forEach(product => {
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

document.getElementById('car1').addEventListener('click', function () {
  trySellproduct(1);
});

document.getElementById('car2').addEventListener('click', function () {
  trySellproduct(2);
});

document.getElementById('car3').addEventListener('click', function () {
  trySellproduct(3);
});

document.getElementById('car4').addEventListener('click', function () {
  trySellproduct(4);
});

function trySellproduct(productId) {
  const productContainer = document.getElementById(`car${productId}`);
  
  // Sprawdź, czy produkt ma klasę 'out-of-stock'
  if (productContainer.classList.contains('out-of-stock')) {
    window.alert(`Tego produktu nie ma w magazynie.`);
    return;
  }
  else { 
    const quantity = parseInt(prompt('Podaj ilość sztuk do sprzedaży:'));
    handleproductClick(productId, quantity);
  }
}

function handleproductClick(productId, quantity) {
  const customerName = prompt('Podaj imię i nazwisko klienta:');
  
  // Sprawdź, czy podano poprawne wartości
  if (customerName && !isNaN(quantity) && quantity > 0) {
    // Wywołaj funkcję odpowiedzialną za sprzedaż
    sellproduct(customerName, productId, quantity);
    // Zaktualizuj liczbę dostępnych egzemplarzy
    updateAvailableStock(productId, quantity);
  } else {
    alert('Podano nieprawidłowe dane. Sprzedaż anulowana.');
  }
}

function updateAvailableStock(productId, soldQuantity) {
  dbPromise.then(db => {
    const transaction = db.transaction('products', 'readwrite');
    const productStore = transaction.objectStore('products');
    const request = productStore.get(productId);

    request.onsuccess = function (event) {
      const product = event.target.result;

      if (product) {
        if (product.quantity >= soldQuantity) {
          //console.log(product.quantity, soldQuantity)
          product.quantity -= soldQuantity;
          // Aktualizuj dostępność produktu
          productStore.put(product);
          updateproductAvailability(product.id, product.quantity > 0);

        } 
      } else {
        console.error('Nieprawidłowy produkt.');
      }
    };

    request.onerror = function () {
      console.error('Błąd podczas aktualizacji ilości dostępnych egzemplarzy.');
    };

    // Dodaj poniższą linię, aby rozwiązać problem
    transaction.oncomplete = function () {
      renderproductsFromDB();
    };
  });
}




function listProducts() {
  console.log('Dostępne Produkty:');
  listproducts();
}

function listCustomers() {
  console.log('Lista Klientów:');
  listCustomers();
}

function showPurchaseHistory() {
  const customerName = prompt('Podaj nazwę klienta:');
  if (customerName) {
    listCustomerPurchases(customerName);
  } else {
    console.error('Nieprawidłowa nazwa klienta.');
  }
}


function listproducts() {
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

function sellproduct(customerName, product, quantity) {
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

function updateproductAvailability(productId, isAvailable) {
  const productContainer = document.getElementById(`car${productId}`);
  if (!isAvailable) {
    //console.log("Xd");
    productContainer.classList.add('out-of-stock');
  } else {
    //console.log("not xd");
    productContainer.classList.remove('out-of-stock');
  }

}

function listCustomerPurchases(customerName) {
  dbPromise.then(db => {
    const transaction = db.transaction('customers', 'readonly');
    const customerStore = transaction.objectStore('customers');
    
    // Użyj indeksu 'fullName', aby znaleźć klienta na podstawie imienia i nazwiska
    const customerIndex = customerStore.index('fullName');
    const request = customerIndex.get(customerName.split(' '));

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


function renderCarBox(product, carContainer) {
  const carBox = document.createElement('div');
  carBox.className = 'car-box';
  carBox.id = `car${product.id}`;

  carBox.innerHTML = `
    <img class="car-img" src="${product.image}" alt="${product.name}">
    <div class="car-info">
      <h3>${product.name}</h3>
      <ul>
        <li>${product.description}</li>
        <li>Cena: ${product.price} zł</li>
        <li>Dostępne egzemplarze: ${product.quantity}</li>
      </ul>
    </div>
  `;

  // Dodaj obsługę kliknięcia dla każdego elementu 'car-box'
  carBox.addEventListener('click', function () {
    trySellproduct(product.id);
  });

  // Dodaj element 'car-box' do kontenera
  carContainer.appendChild(carBox);

  return carBox;
}

function renderproductsFromDB() {
  dbPromise.then(db => {
    const transaction = db.transaction('products', 'readonly');
    const productStore = transaction.objectStore('products');
    const request = productStore.openCursor();

    const carContainer = document.querySelector('.car-container');

    // Wyczyść aktualną zawartość kontenera przed dodaniem nowych produktów
    carContainer.innerHTML = '';

    request.onsuccess = function (event) {
      const cursor = event.target.result;
      if (cursor) {
        const product = cursor.value;

        // Utwórz elementy HTML dla każdego produktu
        const carBox = renderCarBox(product, carContainer);

        // Dodaj klasę 'out-of-stock' jeśli ilość produktu jest mniejsza niż 1
        if (product.quantity < 1) {
          carBox.classList.add('out-of-stock');
        }

        // Rekurencyjnie wywołaj funkcję dla następnego elementu
        cursor.continue();
      }
    };

    request.onerror = function () {
      console.error('Błąd podczas wczytywania produktów z bazy danych.');
    };
  });
}

// Wywołaj funkcję do renderowania produktów po załadowaniu strony
document.addEventListener('DOMContentLoaded', function () {
  renderproductsFromDB();
});
