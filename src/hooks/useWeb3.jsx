import { useWeb3React } from '@web3-react/core';

// This is a lightweight wrapper of web3React which allows the frontend to run in local mode without attempting to connect to any localhost chain
const useWeb3 = () => {
    const { provider, active, activate, chainId, deactivate, error, account } = useWeb3React();

    const chainIdEnv = chainId;
    return {
      library: provider,
      account,
      active,
      activate,
      chainId: chainIdEnv,
      deactivate,
      error,
      gnosisSafe: provider?.provider?.signer?.session?.peer?.metadata?.name === 'Safe Wallet' ? true : false,
    };
};

export default useWeb3;
