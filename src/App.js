import { Web3ReactProvider } from '@web3-react/core';
import './App.css';
import ClaimsTracking from './ClaimsTracking.js';
import { useEffect, useState } from 'react';
import OpenQSubgraphClient from './utils/OpenQSubgraphClient';
import { metaMask, metaMaskHooks } from './utils/connectors';

const openQSubgraphClient = new OpenQSubgraphClient();

function App() {
  const orgData = {
    id: "O_kgDOBddOwA",
    login: "SporkDAOOfficial",
  }
  const connectors = [
    [metaMask, metaMaskHooks],
  ];
  const [TVLBalances, setTVLBalances] = useState([]);
  const [payoutBalances, setPayoutBalances] = useState([]);
  const fetchFilters = (filters) => {};
  useEffect(() => {
    const fetchTotals = async (orgId) => {
      try {
        const fetchedData = await openQSubgraphClient.getTotalFundedPerOrganizationId(orgId);
        const fetchedTotalPayouts = await openQSubgraphClient.getTotalPayoutPerOrganizationId(orgId);
        setPayoutBalances(fetchedTotalPayouts);
        setTVLBalances(fetchedData);
      } catch (err) {
        console.log(err, '[name].js1');
      }
    };
    fetchTotals(orgData.id);
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <p>
          Check out the data.
        </p>
        
        <Web3ReactProvider connectors={connectors} key={JSON.stringify(connectors)}>
          <ClaimsTracking fetchFilters={fetchFilters} TVLBalances={TVLBalances} payoutBalances={payoutBalances} />
        </Web3ReactProvider>
      </header>
    </div>
  );
}

export default App;
