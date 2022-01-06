import { createContext } from 'react';
import { useInterpret } from '@xstate/react';
import PropTypes from 'prop-types';
import { createIngestMachine } from '../state/ingestMachine';

export const GlobalStateContext = createContext({});

export const GlobalStateProvider = (props) => {
  const ingestService = useInterpret(createIngestMachine('kouphax'));

  return (
        <GlobalStateContext.Provider value={{ ingestService }}>
            {props.children}
        </GlobalStateContext.Provider>
  );
};

GlobalStateProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
