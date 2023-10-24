import { useState, useEffect } from 'react';
import TokenClient from '../utils/TokenClient';
function useAsync(asyncFn, onSuccess, deps) {
  useEffect(() => {
    let isActive = true;
    asyncFn().then((data) => {
      if (isActive) {
        onSuccess(data);
      }
    });
    return () => {
      isActive = false;
    };
  }, [onSuccess, deps]);
}
const useGetTokenValues = (tokenBalances) => {
  const [tokenValues, setTokenValues] = useState(null);

  const getParsedTokenValues = async () => {
    if (JSON.stringify(tokenValues) !== '{}' && tokenBalances) {
      try {
        const value = await TokenClient.parseTokenValues(tokenBalances);
        return value;
      } catch (err) {
        console.log('useGetTokenValues1', err);
      }
    }
    if (tokenBalances?.length === 0) {
      return { total: 0 };
    }
  };
  useAsync(getParsedTokenValues, setTokenValues, tokenBalances);

  return [tokenValues, setTokenValues];
};

export default useGetTokenValues;
