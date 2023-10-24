import axios from 'axios';
import { ethers } from 'ethers';
import polygonMainnetEnumerable from '../constants/openq-polygon-mainnet-enumerable.json';
import polygonMainnetIndexable from '../constants/openq-polygon-mainnet-indexable.json';
import superFluidPolygonIndexable from '../constants/superfluid-polygon-mainnet-indexable.json';
import superFluidPolygonEnumerable from '../constants/superfluid-polygon-mainnet-enumerable.json';

class TokenClient {
  constructor() {
    switch (process.env.NEXT_PUBLIC_DEPLOY_ENV || process.env.DEPLOY_ENV) {
      case 'production':
        this.superFluidLocalIndexable = superFluidPolygonIndexable;
        this.superfluidEnumerable = superFluidPolygonEnumerable;
        this.openqIndexableTokens = polygonMainnetIndexable;
        this.openqEnumerableTokens = polygonMainnetEnumerable;
        break;
      default:
        this.superFluidLocalIndexable = superFluidPolygonIndexable;
        this.superfluidEnumerable = superFluidPolygonEnumerable;
        this.openqIndexableTokens = polygonMainnetIndexable;
        this.openqEnumerableTokens = polygonMainnetEnumerable;
    }
  }
  firstTenPrices = {};

  url = process.env.COIN_API_URL;
  async getTokenValues(tokenVolumes, url) {
    const promise = new Promise((resolve, reject) => {
      axios
        .post(url, tokenVolumes)
        .then((result) => {
          resolve({ ...result.data });
        })
        .catch((error) => {
          reject(error);
        });
    });
    return promise;
  }

  parseTokenValues = async (tokenBalances) => {
    if (tokenBalances) {
      let tokenVolumes = {};
      if (Array.isArray(tokenBalances)) {
        for (let i = 0; i < tokenBalances.length; i++) {
          const tokenMetadata = this.getToken(tokenBalances[i].tokenAddress);
          const tokenAddress = tokenMetadata.valueAddress || this.getToken(tokenAddress).valueAddress;
          if (tokenVolumes[tokenAddress]) {
            tokenVolumes[tokenAddress] = {
              volume: parseInt(tokenVolumes[tokenAddress]) + parseInt(tokenBalances[i].volume),
              decimals: tokenMetadata.decimals,
            };
          } else {
            tokenVolumes[tokenAddress.toLowerCase()] = {
              volume: tokenBalances[i].volume,
              decimals: tokenMetadata.decimals,
            };
          }
        }
      } else {
        const tokenMetadata = await this.getToken(tokenBalances.tokenAddress);
        tokenVolumes[tokenMetadata.valueAddress] = {
          volume: tokenBalances.volume,
          decimals: tokenMetadata.decimals,
        };
      }
      const data = { tokenVolumes, network: 'polygon-pos' };
      const url = this.url + '/tvl';
      //only query tvl for bounties that have deposits
      let fetchValues = false;
      if (JSON.stringify(data.tokenVolumes) !== '{}') {
        await new Promise((resolve) => setTimeout(resolve, 200));

        while (!fetchValues) {
          const tokenValues = { tokenPrices: {}, tokens: {}, total: 0 };
          let total = 0;
          for (let key in tokenVolumes) {
            const lowercaseKey = key.toLowerCase();
            if (this.firstTenPrices[lowercaseKey] && !fetchValues) {
              const multiplier = parseInt(tokenVolumes[key].volume) / Math.pow(10, tokenVolumes[key].decimals);
              const value = this.firstTenPrices[lowercaseKey].usd;
              tokenValues.tokens[lowercaseKey] = value * multiplier;
              tokenValues.tokenPrices[lowercaseKey] = Math.round(parseFloat(value) * 100) / 100;
              total = total + value * multiplier;
            } else {
              fetchValues = true;
            }
          }
          tokenValues.total = Math.round(parseFloat(total) * 100) / 100;
          if (JSON.stringify(tokenValues) !== '{"tokenPrices":{},"tokens":{},"total":0}' && !fetchValues) {
            return tokenValues;
          }
        }

        try {
          const tokenValues = await this.getTokenValues(data, url);
          return tokenValues;
        } catch (error) {
          throw new Error(error);
        }
      } else {
        return null;
      }
    }
  };

  getToken(address) {
    const checkSummedAddress = ethers.utils.getAddress(address);
    const lowerCaseAddress = address.toLowerCase();
    if (this.openqIndexableTokens[checkSummedAddress]) {
      return this.openqIndexableTokens[checkSummedAddress];
    }
    if (this.openqIndexableTokens[lowerCaseAddress]) {
      return this.openqIndexableTokens[lowerCaseAddress];
    }
    return {
      chainId: 137,
      name: `${address.substring(0, 5)}
			...
			${address.substring(39)}`,
      symbol: 'CUSTOM',
      decimals: 18,
      address: checkSummedAddress,
      path: '/crypto-logos/ERC20.svg',
    };
  }
}

export default TokenClient;