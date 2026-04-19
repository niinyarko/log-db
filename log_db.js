import * as fs from 'fs';
import * as readline from 'readline';

export class LogDB {

  /**
   * 
   * @param {string} dbPath The path to the database file.
   */
  constructor(dbPath) {
    this.dbPath = dbPath;

    this.index = new Map();
  }

  /**
   * 
   * Builds the in-memory index by reading the entire database file.
   */
  async buildIndex() {
    if (!fs.existsSync(this.dbPath)) {
      console.log('Database file not found, starting with an empty index.');
      return;
    }

    const stream = fs.createReadStream(this.dbPath, { encoding: 'utf8'});
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

    let offset = 0;

    for await (const line of rl) {
      if (line) {
        const [key] = line.split(',', 1);
        const offsetValue = offset + Buffer.from(key + ',').length;
        this.index.set(key, offsetValue);
      }

      offset += Buffer.from(line).length + 1;
    }

    console.log('Index built successfully')
  }

  /**
   * 
   * @param {string} key 
   * @param {string} value 
   */
  async set(key, value) {
    const line = `${key},${value}\n`

    let stats;

    try {
      stats = await fs.promises.stat(this.dbPath)
    } catch (error) {
      if (error.code === 'ENOENT') {
        stats = { size: 0 };
      } else {
        throw error;
      }
    }

    const {size: offset } = stats;
    await fs.promises.appendFile(this.dbPath, line);
    const valueOffset = offset + Buffer.from(key + ',').length;
    this.index.set(key, valueOffset);
  }


  /**
   * @param {string} key
   */
  async get(key) {
    const valueOffset = this.index.get(key);
    if (valueOffset === undefined) {
      return null;
    }

    const stream = fs.createReadStream(this.dbPath, { encoding: 'utf8', start: valueOffset });
    const rl = readline.createInterface({ input: stream, crlfDelay: Infinity })

    for await (const line of rl) {
      rl.close();
      stream.close();

      return line
    }

    return null;
  }
}

async function main() {
  console.log('Initializing database...');
  const db = new LogDB('./database');
  await db.buildIndex();

  console.log('\n--- Reading existing values ---');
  let name = await db.get('name');
  let city = await db.get('city');
  console.log(`GET name -> ${name}`);   // Should be 'Alice'
  console.log(`GET city -> ${city}`);   // Should be 'NYC'

  console.log('\n--- Setting new values ---');
  await db.set('name', 'Bob');
  console.log("SET name -> 'Bob'");
  
  await db.set('status', 'active');
  console.log("SET status -> 'active'");

  console.log('\n--- Reading values again ---');
  name = await db.get('name');
  let status = await db.get('status');
  console.log(`GET name -> ${name}`);   // Should now be 'Bob'
  console.log(`GET status -> ${status}`); // Should be 'active'
}

main();