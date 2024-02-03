import * as fs from 'node:fs';
import * as path from 'node:path';
import * as url from 'node:url';
import { deepEqual } from 'fast-equals';
// eslint-disable-next-line import/no-unresolved
import PQueue from 'p-queue';
import * as pako from 'pako';
import { DataFiles, Scrimmage, Team } from '../src/models';

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

function getDataFile(key: keyof DataFiles, extension: string): string {
  const currentFile = url.fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFile), `../data/${key}.${extension}`);
}

async function getData<T extends keyof DataFiles>(key: T): Promise<DataFiles[T]> {
  const file = getDataFile(key, 'bin');
  if (!fs.existsSync(file)) {
    return {};
  }

  const content = await fs.promises.readFile(file);
  return JSON.parse(pako.inflate(content, { to: 'string' }));
}

async function setData<T extends keyof DataFiles>(key: T, data: DataFiles[T]): Promise<void> {
  const dataDirectory = path.dirname(getDataFile(key, 'bin'));
  if (!fs.existsSync(dataDirectory)) {
    await fs.promises.mkdir(dataDirectory, { recursive: true });
  }

  await Promise.all([
    fs.promises.writeFile(getDataFile(key, 'bin'), pako.deflate(JSON.stringify(data))),
    fs.promises.writeFile(getDataFile(key, 'txt'), Date.now().toString()),
  ]);
}

async function request<T>(url: string): Promise<PaginatedResponse<T>> {
  console.log(`GET ${url}`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`GET ${url} -> HTTP ${response.status}`);
  }

  const data = await response.json();
  return data as PaginatedResponse<T>;
}

async function scrapeTeams(): Promise<void> {
  console.log('Scraping teams');
  const teams: DataFiles['teams'] = {};

  const urlPrefix = 'https://api.battlecode.org/api/team/bc24/t/?format=json&ordering=pk&page=';

  const firstPage = await request(urlPrefix + '1');
  const pageCount = Math.ceil(firstPage.count / 10);

  const queue = new PQueue({ concurrency: 4 });

  for (let i = 1; i <= pageCount; i++) {
    queue.add(async () => {
      const page = await request<Team>(urlPrefix + i.toString());
      for (const team of page.results) {
        teams[team.id.toString()] = team;
      }
    });
  }

  await queue.onIdle();
  await setData('teams', teams);
}

async function scrapeScrimmages(): Promise<void> {
  console.log('Scraping scrimmages');
  const scrimmages = await getData('scrimmages');

  const urlPrefix = 'https://api.battlecode.org/api/compete/bc24/match/?format=json&page=';

  const firstPage = await request(urlPrefix + '1');
  const pageCount = Math.ceil(firstPage.count / 10);

  const queue = new PQueue({ concurrency: 4 });

  let lastChanged = 0;
  for (let i = 1; i <= pageCount; i++) {
    const promise = queue.add(async () => {
      const page = await request<Scrimmage>(urlPrefix + i.toString());
      for (const scrimmage of page.results) {
        if (!deepEqual(scrimmages[scrimmage.id.toString()], scrimmage)) {
          lastChanged = Math.max(lastChanged, i);
        }

        scrimmages[scrimmage.id.toString()] = scrimmage;
      }
    });

    if (i % (queue.concurrency * 5) === 0) {
      await promise;
      if (i - lastChanged > 10) {
        console.log('No new scrimmage data for >10 pages');
        break;
      }
    }
  }

  await queue.onIdle();
  await setData('scrimmages', scrimmages);
}

await scrapeTeams();
await scrapeScrimmages();
