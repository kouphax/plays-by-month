import * as bgg from '../utils/bgg';
import { sleep } from '../utils/utils';

async function fetchPlays(user) {
  const pages = [];

  for (let page = 1; ; page++) {
    const p = await bgg.plays(user, page);
    if (p.plays && p.plays.play && p.plays.play.length > 0) {
      pages.push(...p.plays.play);
    } else {
      break;
    }
  }

  return pages;
}

async function processPlays(raw) {
  await sleep(5000);
  return raw;
}

export function loadData({ user }) {
  return fetchPlays(user).catch((err) => {
    // catch and release
    console.error(err);
    throw err;
  });
}

export function processData({ cache }) {
  return processPlays(cache).catch((err) => {
    // catch and release
    console.error(err);
    throw err;
  });
}
