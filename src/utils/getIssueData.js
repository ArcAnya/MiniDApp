import { gql } from "@apollo/client";

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

export async function getIssueData(ids) {
    const promise = new Promise(async (resolve, reject) => {
      try {
        const result = await fetch("https://api.github.com/graphql", {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_PAT}`,
            "Content-Type": "application/json",
          },
            method: "POST",
            body: JSON.stringify({
              query: GET_ISSUES_BY_ID.loc.source.body,
              variables: {
                ids,
              },
              errorPolicy: 'all',
            }),
        });
        /* const result = await this.client.query({
          query: GET_ISSUES_BY_ID,
          variables: {
            ids,
          },
          errorPolicy: 'all',
        }); */
        resolve(this.parseIssuesData(result, reject));
      } catch (e) {
        reject(e);
      }
    });

    return promise;
  }