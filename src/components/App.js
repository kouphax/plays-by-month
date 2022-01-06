import { useContext } from 'react';
import { useActor } from '@xstate/react';
import { GlobalStateContext } from './GlobalStateProvider';

export default function App() {
  const globalServices = useContext(GlobalStateContext);
  const [state] = useActor(globalServices.ingestService);

  switch (state.value) {
    case 'init':
      return <div>Initializing...</div>;
    case 'load':
      return <div>Loading...</div>;
    case 'process':
      return <div>Processing...</div>;
    case 'render':
      return <div>Rendering...</div>;
    case 'error':
      return <div>Error...</div>;
    default:
      return <div>Bad State...</div>;
  }
}
