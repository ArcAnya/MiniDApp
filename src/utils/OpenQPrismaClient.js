import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import fetch from 'cross-fetch';

const GET_PRIVATE_REQUEST = gql`
  query ($id: String!) {
    request(id: $id) {
      id
      message
    }
  }
`;

const GET_USER = gql`
  query ($id: String, $email: String, $github: String) {
    user(id: $id, email: $email, github: $github) {
      id
      github
      username
      discord
      twitter
      devRoles
      otherRoles
      interests
      languages
      frameworks
      starredOrganizationIds
    }
  }
`;

export const GET_CONTRACT_PAGE = gql`
  query BountiesConnection(
    $after: ID
    $orderBy: String
    $sortOrder: String
    $organizationId: String
    $types: [String]
    $limit: PaginationInt!
    $category: String
    $repositoryId: String
    $title: String
  ) {
    bounties(
      after: $after
      limit: $limit
      orderBy: $orderBy
      sortOrder: $sortOrder
      organizationId: $organizationId
      types: $types
      category: $category
      repositoryId: $repositoryId
      title: $title
    ) {
      bountyConnection {
        nodes {
          tvl
          tvc
          requests(limit: 100) {
            nodes {
              id
              requestingUser {
                id
              }
            }
          }
          address
          organizationId
          repositoryId
          bountyId
          budgetValue
          type
          category
          watchingCount
          createdAt
          blacklisted
          organization {
            blacklisted
          }
        }
        cursor
      }
    }
  }
`;

class OpenQPrismaClient {
  constructor() {}

  uri = process.env.OPENQ_API_URL;
  httpLink = new HttpLink({ uri: this.uri, fetch, credentials: 'include' });

  client = new ApolloClient({
    uri: this.uri + '/graphql',
    link: this.httpLink,
    cache: new InMemoryCache(),
  });

  getPrivateRequest(id) {
    const promise = new Promise(async (resolve, reject) => {
      const variables = {
        id,
      };

      try {
        const result = await this.client.query({
          query: GET_PRIVATE_REQUEST,
          variables,
        });
        resolve(result.data.request);
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }

  getPublicUser(github) {
    const promise = new Promise(async (resolve, reject) => {
      const variables = {
        github,
      };

      try {
        const result = await this.client.query({
          query: GET_USER,
          variables,
        });
        resolve(result.data.user);
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }

  async getContractPage(after, limit, sortOrder, orderBy, types, organizationId, category, repositoryId, title) {
    const variables = { after, orderBy, limit, sortOrder, organizationId, repositoryId, title };
    if (types) {
      variables.types = types;
    }
    if (category) {
      variables.category = category;
    }
    if (sortOrder) {
      variables.sortOrder = sortOrder;
    }
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.query({
          query: GET_CONTRACT_PAGE,
          variables,
          fetchPolicy: 'no-cache',
        });
        resolve(result.data.bounties.bountyConnection);
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }
  
}

export default OpenQPrismaClient;
