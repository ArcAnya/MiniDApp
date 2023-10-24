import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import fetch from 'cross-fetch';

export const GET_TOTAL_FUNDED_PER_ORGANIZATION_ID = gql`
  query GetTotalFundedPerOrganizationId($organizationId: ID!) {
    organizationFundedTokenBalances(where: { organization: $organizationId }) {
      id
      volume
    }
  }
`;

const GET_USER_BY_GITHUB_ID = gql`
  query GetUserAddressWithGithubId($github: String!) {
    users(where: { externalUserId: $github }) {
      id
    }
  }
`;

const GET_BOUNTIES_BY_CONTRACT_ADDRESSES = gql`
  query GetBountiesByContractAddresses($contractAddresses: [ID]!, $types: [String]) {
    bounties(where: { bountyAddress_in: $contractAddresses, bountyType_in: $types }) {
      bountyAddress
      bountyId
      bountyMintTime
      bountyClosedTime
      status
      fundingGoalTokenAddress
      fundingGoalVolume
      payoutTokenVolume
      payoutTokenAddress
      payoutSchedule
      closerData
      bountyType
      claimedTransactionHash
      alternativeName
      alternativeLogo
      tierWinners
      supportingDocumentsCompleted
      claims {
        tier
      }
      payouts {
        id
      }
      deposits {
        id
        refunded
        refundTime
        expiration
        tokenAddress
        volume
        sender {
          id
        }
        receiveTime
      }
      refunds {
        tokenAddress
        volume
      }
      payouts {
        tokenAddress
        volume
        payoutTime
        closer {
          id
        }
      }
      issuer {
        id
      }
      bountyTokenBalances {
        volume
        tokenAddress
      }
    }
  }
`;

class OpenQSubgraphClient {
  constructor() {}

  uri = process.env.OPENQ_SUBGRAPH_SSR_HTTP_URL;

  httpLink = new HttpLink({ uri: this.uri, fetch });

  client = new ApolloClient({
    uri: this.uri,
    link: this.httpLink,
    cache: new InMemoryCache(),
  });

  async getTotalFundedPerOrganizationId(organizationId) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.query({
          query: GET_TOTAL_FUNDED_PER_ORGANIZATION_ID,
          variables: { organizationId },
        });
        resolve(result.data.organizationFundedTokenBalances);
      } catch (e) {
        reject(e);
      }
    });

    return promise;
  }

  async getBountiesByContractAddresses(contractAddresses, types = ['0', '1', '2', '3']) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.query({
          query: GET_BOUNTIES_BY_CONTRACT_ADDRESSES,
          variables: { contractAddresses, types },
        });
        resolve(result.data.bounties);
      } catch (e) {
        reject(e);
      }
    });

    return promise;
  }

  async getUserByGithubId(github) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.query({
          query: GET_USER_BY_GITHUB_ID,
          variables: { github },
        });
        resolve(result.data.users[0] ? result.data.users[0] : null);
      } catch (e) {
        reject(e);
      }
    });

    return promise;
  }

}

export default OpenQSubgraphClient;
