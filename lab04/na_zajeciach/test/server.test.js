const supertest = require('supertest');
const assert = require('assert');
const fs = require('fs');

const server = supertest.agent('http://localhost:8000');

before(() => {
    fs.writeFileSync('test/products.json', '[]', 'utf8');
});

describe('GET /', () => {
    it('responds with "Home Page"', (done) => {
        server
            .get('/')
            .expect('Content-Type', /html/)
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(res.text.includes('Home Page'), true);
                done(err);
            });
    });
});



describe('GET /add', () => {
    it('responds with "Add Product"', (done) => {
        server
            .get('/add')
            .expect('Content-Type', /html/)
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(res.text.includes('Add Product'), true);
                done(err);
            });
    });
});


describe('GET /history', () => {
    it('responds with "No transaction history available for this customer."', (done) => {
        server
            .get('/history?customer=nonexistent')
            .expect('Content-Type', /html/)
            .expect(200)
            .end((err, res) => {
                assert.strictEqual(res.text.includes('No transaction history available for this customer.'), true);
                done(err);
            });
    });
});



describe('POST /add', () => {
    it('adds a product and redirects to the homepage', (done) => {
        const productData = {
            product: 'TestProduct',
            price: '10.50',
            quantity: '5'
        };

        server
            .post('/add')
            .type('form')
            .send(productData)
            .expect(302)
            .end((err, res) => {
                assert.strictEqual(res.header['location'], '/');
                done(err);
            });
    });

    it('verifies that the product was added to products.json', (done) => {
        supertest.agent('http://localhost:8000')
        .post('/add')
        .send({
            product: 'TestProduct',
            price: '10.99',
            quantity: '5'
        })
        .expect(302) // Oczekuj przekierowania
            .end((err, res) => {
                if (err) return done(err);
            
                // Dodatkowe sprawdzenie, czy produkt został dodany do products.json
                fs.readFile('src/products.json', 'utf8', (err, data) => {
                    if (err) return done(err);
            
                    const products = JSON.parse(data);
                    const addedProduct = products.find(product => product.name === 'TestProduct');
            
                    assert.notStrictEqual(addedProduct, undefined, 'Expected the product to be added to products.json');
            
                    done();
                });
            });
    });
});

after((done) => {
    // Usunięcie ostatniego wpisu z products.json po teście
    fs.readFile('src/products.json', 'utf8', (err, data) => {
        if (err) return done(err);

        const products = JSON.parse(data);
        if (products.length > 0) {
            products.pop(); // Usunięcie ostatniego elementu
            fs.writeFileSync('src/products.json', JSON.stringify(products), 'utf8');
        }

        done();
    });
});