import { useState, useEffect } from 'react';
import useWeb3 from './useWeb3';
import chainIdDeployEnvMap from '../utils/chainDeployEnvMap';

const useIsOnCorrectNetwork = (props) => {
  const { chainId, error, account } = useWeb3(props);
  const [isOnCorrectNetwork, setIsOnCorrectNetwork] = useState(true);

  useEffect(() => {
    if (
      error?.message?.includes('Unsupported chain id') ||
      (chainIdDeployEnvMap['production']['chainId'] !== chainId && account)
    ) {
    } else {
      setIsOnCorrectNetwork(true);
    }
  }, [chainId, error?.message, account]);
  return [isOnCorrectNetwork, setIsOnCorrectNetwork];
};

export default useIsOnCorrectNetwork;
