import fs from 'fs-extra';
import { argv } from 'node:process';
import readline from 'readline';
import { exec } from 'child_process';

const filename = 'licznik_uruchomien.txt';

async function incrementCounter() {
  try {
    let count = 1;

    // Odczytaj wartość licznika z pliku, jeśli istnieje
    if (await fs.pathExists(filename)) {
      const data = await fs.readFile(filename, 'utf-8');
      count = parseInt(data) + 1;
    }

    // Zapisz zaktualizowaną wartość licznika do pliku
    await fs.writeFile(filename, count.toString());

    console.log(`Liczba uruchomień: ${count}`);
  } catch (error) {
    console.error(`Wystąpił błąd: ${error.message}`);
  }
}

async function executeCommands() {
  console.log('Wprowadź komendy — naciśnięcie Ctrl+D kończy wprowadzanie danych');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  rl.on('line', async (line) => {
    if (line.trim() !== '') {
      // Wykonaj komendę systemową
      console.log(`Wynik komendy: ${line}`);
      exec(line, (error, stdout, stderr) => {
        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);
        if (error) console.error(`Błąd podczas wykonywania komendy: ${error.message}`);
      });
    }
  });

  rl.on('close', () => {
    console.log('Koniec wprowadzania danych.');
  });
}

async function main() {
  if (argv.includes('--sync')) {
    await incrementCounter();
  } else if (argv.includes('--async')) {
    // Odczytaj wartość licznika asynchronicznie
    try {
      const data = await fs.readFile(filename, 'utf-8');
      const count = parseInt(data) || 0;

      // Zapisz zaktualizowaną wartość licznika asynchronicznie
      await fs.writeFile(filename, (count + 1).toString());
      console.log(`Liczba uruchomień: ${count + 1}`);
    } catch (err) {
      console.error(`Wystąpił błąd podczas odczytu/zapisu pliku: ${err.message}`);
    }
  } else {
    await executeCommands();
  }
}

main();
