import { createMachine } from 'xstate';
import {
  readFromLocalCache, setPlayCache, setPlayData, writeToLocalCache,
} from './actions';
import { dataMissing } from './guards';
import { loadData, processData } from './services';

export function createIngestMachine(user) {
  return createMachine({
    id: 'ingest',
    initial: 'init',
    context: {
      user,
    },
    states: {
      init: {
        // on entry to initial state, read data from local storage
        entry: 'readFromLocalCache',
        // init state will immediately determine if the user needs to be loaded,
        // is already loaded or needs update
        always: [
          { target: 'load', cond: 'dataMissing' },
          { target: 'process' },
        ],
      },
      load: {
        invoke: {
          src: 'loadData',
          onDone: {
            target: 'process',
            actions: [
              'writeToLocalCache',
              'setPlayCache',
            ],
          },
          onError: 'error',
        },
      },
      process: {
        invoke: {
          src: 'processData',
          onDone: {
            target: 'render',
            actions: [
              'setPlayData',
            ],
          },
          onError: 'error',
        },
      },
      render: {
        final: true,
      },
      error: {
        final: true,
      },
    },
  }, {
    guards: {
      dataMissing,
    },
    actions: {
      readFromLocalCache,
      writeToLocalCache,
      setPlayCache,
      setPlayData,
    },
    services: {
      loadData,
      processData,
    },
  });
}
