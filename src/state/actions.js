import { assign } from 'xstate';

const LOCAL_STORAGE_PREFIX = '@app.';

function localGet(key) {
  return window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`);
}
function localSet(key, value) {
  return window.localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(value));
}

export const readFromLocalCache = assign({
  cache: ({ user }) => localGet(user),
});

export function writeToLocalCache({ user }, { data }) {
  localSet(user, data);
}

export const setPlayCache = assign({
  cache: (context, { data }) => data,
});

export const setPlayData = assign({
  data: (context, { data }) => data,
});
