import { XMLParser } from 'fast-xml-parser';
import { sleep } from './utils';

const ATTR_PREFIX = '@_';

const XML_PARSER = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: ATTR_PREFIX,
});

export async function plays(username, page = 1) {
  const encodedUsername = encodeURIComponent(username);
  await sleep(2000); // enforced eager throttle
  return fetch(`https://www.boardgamegeek.com/xmlapi2/plays?username=${encodedUsername}&page=${page}`)
    .then((response) => response.text())
    .then((xml) => XML_PARSER.parse(xml));
}
