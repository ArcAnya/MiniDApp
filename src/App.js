import { Web3ReactProvider } from '@web3-react/core';
import './App.css';
import ClaimsTracking from './ClaimsTracking.js';
import { initializeConnector } from '@web3-react/core';
import { MetaMask } from '@web3-react/metamask';

function onError(error) {
  console.debug(`web3-react error: ${error}`);
}


function App() {
  const [metaMask, metaMaskHooks] = initializeConnector((actions) => new MetaMask({ actions, onError }));
  const connectors = [
    [metaMask, metaMaskHooks]
  ];
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Check out the data.
        </p>
        <Web3ReactProvider connectors={connectors}>
        <ClaimsTracking />
        </Web3ReactProvider>
      </header>
    </div>
  );
}

export default App;
