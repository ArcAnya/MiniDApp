import { ApolloClient, HttpLink, InMemoryCache, gql } from '@apollo/client';
import fetch from 'cross-fetch';

const GET_ISSUES_BY_ID = gql`
  query ($ids: [ID!]!) {
    nodes(ids: $ids) {
      ... on Issue {
        closed
        title
        body
        url
        id
        number
        titleHTML
        bodyHTML
        timelineItems(first: 100, itemTypes: CROSS_REFERENCED_EVENT) {
          edges {
            node {
              ... on CrossReferencedEvent {
                source {
                  ... on PullRequest {
                    url
                    createdAt
                    merged
                    title
                    author {
                      login
                    }
                  }
                }
              }
            }
          }
        }
        assignees(first: 1) {
          nodes {
            name
            login
            url
            avatarUrl
          }
        }
        labels(first: 10) {
          edges {
            node {
              name
              color
            }
          }
        }
        createdAt
        repository {
          id
          url
          description
          name
          languages(first: 10) {
            edges {
              node {
                name
                color
              }
            }
          }
          owner {
            login
            avatarUrl
          }
        }
      }
    }
  }
`;

const GET_USERS_BY_IDS = gql`
  query GetUsers($ids: [ID!]!) {
    nodes(ids: $ids) {
      __typename
      ... on User {
        name
        login
        bio
        id
        url
        avatarUrl
      }
    }
  }
`;

class GithubRepository {
  constructor() {}

  uri = "https://api.github.com/graphql";
  authToken = process.env.REACT_APP_PAT;

  httpLink = new HttpLink({
    uri: this.uri,
    fetch,
    headers: {
        Authorization: `Bearer ${this.authToken}`,
        "Content-Type": "application/json",
      },
  });

  client = new ApolloClient({
    uri: this.uri,
    link: this.httpLink,
    cache: new InMemoryCache(),
    errorPolicy: 'all',
  });

  parseIssuesData(rawIssuesResponse, reject) {
    const responseData = rawIssuesResponse.data.nodes;
    return responseData
      .filter((event) => event?.__typename === 'Issue')
      .map((elem) => {
        try {
          const { title, body, url, createdAt, closed, id, bodyHTML, titleHTML } = elem;
          const repoName = elem.repository.name;
          const prs = elem.timelineItems.edges.map((edge) => edge.node);
          const avatarUrl = elem.repository.owner.avatarUrl;
          const owner = elem.repository.owner.login;
          const repoDescription = elem.repository.description;
          const repoId = elem.repository.id;
          const repoUrl = elem.repository.url;
          const assignees = elem.assignees.nodes;
          const number = elem.number;
          const labels = elem.labels.edges.map((edge) => edge.node);
          const languages = elem.repository.languages.edges.map((languages) => languages.node);

          return {
            id,
            title,
            body,
            url,
            languages,
            repoName,
            owner,
            avatarUrl,
            labels,
            createdAt,
            closed,
            bodyHTML,
            titleHTML,
            assignees,
            number,
            repoUrl,
            repoDescription,
            prs,
            repoId,
          };
        } catch (err) {
          reject(err);
          let id, url, repoName, owner, avatarUrl, labels, createdAt, closed, titleHTML, assignees;
          return {
            id,
            assignees,
            url,
            repoName,
            owner,
            avatarUrl,
            labels,
            createdAt,
            closed,
            titleHTML,
            bodyHTML: '',
          };
        }
      });
  }

  async getIssueData(ids) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.query({
          query: GET_ISSUES_BY_ID,
          variables: {
            ids,
          },
          errorPolicy: 'all',
        });
        resolve(this.parseIssuesData(result, reject));
      } catch (e) {
        reject(e);
      }
    });

    return promise;
  }

  async fetchUsersByIds(ids) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await this.client.query({
          query: GET_USERS_BY_IDS,
          variables: {
            ids,
          },
          errorPolicy: 'all',
        });
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
    return promise;
  }
}

export default GithubRepository;
