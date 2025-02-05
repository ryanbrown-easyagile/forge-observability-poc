# Context Creeper - Forge POC
This Proof of Concept was created to make it visible what is available to a Forge app via the contexts that are provided.  This was to inform us of whether or not Forge currently exposes information that is required in our current applications, such as the current Board ID.

This was done by creating a simple app that consists of a Forge Function which runs on the Server Side and a Custom UI written with React and Vite.

## Findings
 - At the time of writing (June 7th, 2024), for an equivlant application to TeamRhythm where the current board is necessary, a [Jira Project Page](https://developer.atlassian.com/platform/forge/manifest-reference/modules/jira-project-page/) supported application does _**not**_ receive the required current Board ID, neither on the client side or server side.
 - Contexts are generic enough that the same code can be used in many places, in this interest the exact same page and function is included as a Jira Project Page, Admin Page, Global Page and Issue Panel.

## Building and Running
### Prerequisites
 - NodeJS
 - Docker
 - Atlassian Dev Environment

### Initial setup
First, install the dependencies
```
yarn install
```

Second, you need to get your Forge configured.  This should just be as simple as creating an API token (don't lose this, add it to your 1Password) at https://id.atlassian.com/manage/api-tokens and then running 
```
yarn forge login
```
and follow the prompts.

### Building
There are two apps to build.  The first is the Custom UI app:
```
cd static/client-app
yarn install
yarn build
```

The second app is the Forge function, which is from the project root (this is how forge CLI forces codebases to be structured, would much rather be using Yarn Workspaces or NX, but that's for another day)
```
yarn install
yarn build
```

### Deploying
Finally, to deploy to your dev environment, you should just need to run the following:
```
yarn forge deploy
```