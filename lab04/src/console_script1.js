/* **** */
/* ES6  */
/* **** */
import fs from 'fs-extra';
import { argv } from 'node:process';

/************************* */
function read_sync() {
    console.log(`1.\t\x1B[32mWykonano pierwszą linię funkcji "read_sync()"\x1B[0m`);
    console.log('2.\t\x1B[33mWywołano funkcję \'readFileSync()\'\x1B[0m');
    let data = fs.readFileSync(argv[1]);
    console.log('3.\t\x1B[33mWczytano zawartość pliku — jest ona dostępna w zmiennej \'data\'\x1B[0m');
    console.log(`4.\t\x1B[32mWykonano ostatnią linię funkcji "read_sync()"\x1B[0m`);
}

function read_async() {
    console.log(`5.\t\x1B[32mWykonano pierwszą linię funkcji "read_async()"\x1B[0m`);
    console.log('6.\t\x1B[33mWywołano funkcję \'readFile()\'\x1B[0m');
    fs.readFile(argv[1], (err, data) => {
        if (err) throw err;
        console.log('7.\t\x1B[33mWczytano zawartość pliku — jest ona dostępna w zmiennej \'data\'\x1B[0m');
    });
    console.log(`8.\t\x1B[32mWykonano ostatnią linię funkcji "read_async()"\x1B[0m`);
}
/************************* */

console.clear()
console.log(`\x1B[31mSynchroniczny odczyt pliku "${argv[1]}"\x1B[0m`);
read_sync();
console.log('------------------');
console.log(`\x1B[31mAsynchroniczny odczyt pliku "${argv[1]}"\x1B[0m`);
read_async();
console.log('9.\t\x1B[34mWykonano ostatnią linię skryptu\x1B[0m');
