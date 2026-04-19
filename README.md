# log-db

A from-scratch implementation of a log-structured key-value store, built to understand the internals of databases like Bitcask and LevelDB. Includes a 13-lesson interactive course covering storage engines, indexing, durability, transactions, query execution, and distributed systems.

## How it works

Every write is an **append** to a flat file — no in-place updates, no B-trees. A hash index in memory maps each key to the byte offset of its value in the file, enabling O(1) reads via a single `seek`.

```
Key write:   append "key,value\n" to disk
Key read:    index.get(key) → byte offset → fs.createReadStream({ start: offset })
Crash recovery: replay the log top-to-bottom to rebuild the index
Compaction:  rewrite the log keeping only the latest value per key
```

## Files

| File | Description |
|---|---|
| `log_db.js` | Core `LogDB` class in Node.js (ESM) |
| `db.sh` | Bash proof-of-concept (`db_set` / `db_get`) |
| `learn/index.html` | Interactive 13-lesson DB internals course |
| `.github/agents/socratic.agent.md` | Socratic AI mentor for DB internals |

## Usage

```bash
node log_db.js
```

The `LogDB` class can also be imported:

```js
import { LogDB } from './log_db.js';

const db = new LogDB('./database');
await db.buildIndex();   // replay log → rebuild in-memory index

await db.set('name', 'Alice');
await db.get('name');    // → 'Alice'
```

## DB Internals Lab

Open `learn/index.html` in a browser for an interactive course on database internals with diagrams, simulators, and quizzes:

| # | Lesson | Topic |
|---|--------|-------|
| 01 | What is a Database? | Foundations, read/write trade-off |
| 02 | Append-Only Log | Sequential I/O, immutability |
| 03 | Hash Index | In-memory key→offset mapping, Bitcask model |
| 04 | Crash Recovery | Log replay, partial write detection |
| 05 | Compaction | Space reclamation, write amplification |
| 06 | B+ Trees | Fan-out, node splits, range scans |
| 07 | WAL (Write-Ahead Log) | Durability protocol, fsync, checkpoints |
| 08 | LSM Trees | MemTable, SSTables, Bloom filters |
| 09 | Transactions & Isolation | ACID, MVCC, isolation levels |
| 10 | Query Layer | Parser → Optimizer → Executor, Volcano model |
| 11 | Replication | Leader/follower, quorums, CAP theorem |
| 12 | Sharding | Hash/range partitioning, consistent hashing |
| 13 | Raft Consensus | Leader election, log replication, safety |

Each lesson includes concept cards with deep explanations, interactive simulators, and a quiz.

### Socratic AI mentor

Use the **socratic** agent in GitHub Copilot Chat — either switch to it via the agent dropdown or mention `@socratic` inline:

```
why does WAL write before data?
B+ tree splits
MVCC vs locking
```

## Concepts

- **Append-only log** — writes are sequential, making them fast and durable
- **Hash index** — in-memory `Map` from key → byte offset; rebuilt on startup
- **Byte-level seeking** — `get()` opens a read stream starting at the exact value offset
- **Crash recovery** — replaying the log from byte 0 always produces a correct index
- **Compaction** — deduplicate the log by keeping only the latest value per key
- **B+ trees** — balanced tree with high fan-out for efficient range queries and point lookups
- **WAL** — write-ahead logging ensures durability before applying changes
- **LSM trees** — write-optimized storage with sorted runs and background compaction
- **MVCC** — multi-version concurrency control lets readers and writers coexist
- **Replication** — copying data across nodes for fault tolerance and read scaling
- **Sharding** — splitting data across nodes for write scaling and storage capacity
- **Raft** — consensus protocol for leader election and replicated state machines

## Requirements

Node.js 16+ (ESM, no dependencies)
