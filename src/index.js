/* eslint-disable no-await-in-loop, no-promise-executor-return, no-console */
// noinspection JSIgnoredPromiseFromCall

import { XMLParser } from 'fast-xml-parser';
import * as R from 'ramda';
import scale from 'scale-color-perceptual';

function sleep(ms) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(message) {
  // eslint-disable-next-line no-console
  console.log(message);
}

const ATTR_PREFIX = '@_';

const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ATTR_PREFIX,
});

const PAGE_SIZE = 100;

const USERNAME = 'kouphax';
const CACHE_KEY = `plays.${encodeURIComponent(USERNAME)}`;

async function playsPage(username, page = 1) {
  const encodedUsername = encodeURIComponent(username);
  return fetch(`https://www.boardgamegeek.com/xmlapi2/plays?username=${encodedUsername}&page=${page}`)
    .then((response) => response.text())
    .then((xml) => XML_PARSER.parse(xml));
}

async function plays(username) {
  log('getting page 1');

  const page1 = await playsPage(username);
  const total = parseInt(page1.plays['@_total'], 10);
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const pages = [page1];

  for (let i = 2; i <= pageCount; i++) {
    log(`getting page ${i}`);
    await sleep(2000); // rate limit
    const page = await playsPage(username, i);
    pages.push(page);
  }

  log('complete');

  return pages.flatMap((page) => page.plays.play);
}

async function main() {
  const cache = window.localStorage.getItem(CACHE_KEY);

  if (cache === null) {
    const p = await plays(USERNAME);
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(p));
  } else {
    log('loading from cache');
  }

  const data = JSON.parse(window.localStorage.getItem(CACHE_KEY));

  const groupByYear = R.groupBy(R.pipe(R.prop('@_date'), R.take(4)));

  const groupByMonth = R.groupBy(R.pipe(R.prop('@_date'), R.take(7), R.drop(5)));

  // eslint-disable-next-line no-console
  const playsByYearByMonth = R.pipe(
    groupByYear,
    R.map(groupByMonth),
  )(data);

  // const playCountByYearAndMonth = R.zipObj(
  //   R.keys(playsByYearAndMonth),
  //   R.pipe(R.values, R.map(R.length))(playsByYearAndMonth),
  // );
  //
  // console.dir(playCountByYearAndMonth);
  //
  const emptyRow = R.always(R.map(R.always(0), R.range(1, 13)));

  const yearsPlayed = R.pipe(
    R.keys,
    R.map(R.take(4)),
    R.uniq,
    R.sortBy(R.identity),
    R.map((year) => [
      year,
      R.reduce(
        (row, [month, playsForMonth]) => R.set(
          R.lensIndex(parseInt(month, 10) - 1),
          R.length(playsForMonth),
          row,
        ),
        emptyRow(),
        R.toPairs(playsByYearByMonth[year]),
      )]),
  )(playsByYearByMonth);

  const max = R.pipe(
    R.map(R.last),
    R.flatten,
    R.reduce(R.max, -Infinity),
  )(yearsPlayed);

  console.dir(max);

  const scaler = (x) => (x === 0 ? '#fff' : scale.viridis(1 - (x / max)));

  const tableEl = document.getElementById('app');
  tableEl.innerHTML = `
      <tr>
        <td class="y-legend" rowspan="${R.pipe(R.keys, R.length, R.inc, R.inc, R.inc)(yearsPlayed)}">Year</td>
        <td></td>
        <td colspan="13"><h1>Boardgame Plays by Month</h1></td>
        <td id="scale-container" rowspan="${R.pipe(R.keys, R.length, R.inc, R.inc, R.inc)(yearsPlayed)}">${max}<div id="scale"></div>0</td>
      </tr>`;

  for (const [year, months] of yearsPlayed) {
    tableEl.innerHTML += `<tr><th class="year">${year}</th>${months.map((m) => `<td style="width: 48px; background-color: ${scaler(m)}; color: ${scaler(m)}">${m}</td>`).join('')}</tr>`;
  }

  tableEl.innerHTML += `<tr><th></th>${R.range(1, 13).map((m) => `<th>${m}</th>`).join('')}</tr>`;
  tableEl.innerHTML += '<tr><td></td><td></td><td class="x-legend" colspan="13">Month</td></tr>';

  document.getElementById('scale').style.background = `linear-gradient(0deg, ${scaler(1)} 0%, ${scaler(max / 2)} 50%, ${scaler(max)} 100%)`;
}

main();
