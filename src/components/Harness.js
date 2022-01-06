import App from './App';
import { GlobalStateProvider } from './GlobalStateProvider';

export default function Harness() {
  return <GlobalStateProvider><App /></GlobalStateProvider>;
}
