#!/usr/bin/env node
// An offline stand-in for gutenberg_backend, serving the books in
// fixtures/books/ with the same routes and response shapes. Questions are
// answered extractively from the fixture text; nothing leaves the machine.
//
//   node scripts/demo-api.mjs            # listens on PORT, default 8000
//
// Only for demos, screenshots and working on the frontend without the real
// backend. Scores and word counts in the fixtures are illustrative.

import { createServer } from 'node:http';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), '..', 'fixtures', 'books');
const PORT = Number(process.env.PORT ?? 8000);
const ALLOWED_ORIGIN = process.env.CORS_ORIGINS ?? '*';

const books = new Map(
  readdirSync(FIXTURES)
    .filter((name) => name.endsWith('.json'))
    .map((name) => [name.replace(/\.json$/, ''), JSON.parse(readFileSync(join(FIXTURES, name), 'utf8'))]),
);

const STOPWORDS = new Set(
  'a an and are as at be by did do does for from had has have he her his how i in is it its me my of on or she that the their them they this to was what when where which who whom why will with you your about book'.split(' '),
);

function words(text) {
  return text.toLowerCase().match(/[a-z’']+/g)?.filter((w) => !STOPWORDS.has(w)) ?? [];
}

function sentences(text) {
  return text
    .replace(/\s+/g, ' ')
    .split(/(?<!\b(?:Mr|Mrs|Dr|St|Messrs)\.)(?<=[.!?”])\s+(?=[“A-Z_])/)
    .map((s) => s.replace(/_/g, '').trim())
    .filter(Boolean);
}

/** The two sentences sharing the most words with the question, in reading order. */
export function answerFromText(pages, question) {
  const asked = new Set(words(question));
  const scored = sentences(pages.join('\n\n')).map((sentence, index) => ({
    sentence,
    index,
    score: words(sentence).filter((w) => asked.has(w)).length,
  }));
  const best = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 2)
    .sort((a, b) => a.index - b.index);
  if (best.length === 0) return 'The demo excerpt of this book does not mention that.';
  return best.map((s) => s.sentence).join(' ');
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    ...headers,
  });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  try {
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

const server = createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  if (req.method === 'OPTIONS') return send(res, 204);
  if (pathname === '/health') return send(res, 200, { status: 'healthy', mode: 'demo' });

  if (req.method === 'POST' && pathname === '/tts/chunks') {
    const { text = '' } = await readJson(req);
    const chunks = sentences(String(text));
    return send(res, 200, { chunks, total_chunks: chunks.length });
  }
  if (req.method === 'POST' && pathname === '/tts') {
    return send(res, 501, { detail: 'Speech synthesis is not available in demo mode' });
  }

  const match = pathname.match(/^\/books\/([^/]+)(?:\/([a-z-]+))?$/);
  if (!match) return send(res, 404, { detail: 'Not found' });
  const [, id, action] = match;
  const fixture = books.get(decodeURIComponent(id));
  if (!fixture) return send(res, 404, { detail: 'Book not found' });

  if (req.method === 'GET' && !action) return send(res, 200, fixture.book);
  if (req.method === 'GET' && action === 'readability') return send(res, 200, fixture.readability);
  if (req.method === 'GET' && action === 'content') return send(res, 200, fixture.content);
  if (action === 'sentiment') return send(res, 200, fixture.sentiment);
  if (req.method === 'POST' && action === 'ask') {
    const { query = '' } = await readJson(req);
    return send(res, 200, {
      query,
      response: answerFromText(fixture.content.pages, String(query)),
      book_id: fixture.book.id,
    });
  }
  return send(res, 404, { detail: 'Not found' });
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(PORT, () => {
    console.log(`demo API on :${PORT} with books ${[...books.keys()].join(', ')}`);
  });
}
