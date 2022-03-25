# `Near Market`

Buy and sell movie posters and store information on near blockchain.

## Description

This repository includes a complete project structure for AssemblyScript contracts targeting the NEAR platform.

The example here is very basic. It's a simple contract demonstrating the following concepts:

- a single contract
- the difference between `view` vs. `change` methods

```ts
  // [view method] return information about the project
  public getProjectInfo(): string {}

  // [view method] returns an array of posters owned by an account
  public fetchMovieListByAccountId(accountId: AccountId): MoviePoster[] {}

  // [change method] returns a poster bought by context.sender
  @mutateState()
  public buyMoviePoster(item: Item): MoviePoster {}

  // [change method] called to sell a poster bought by context.sender
  @mutateState()
  public sellMoviePoster(ft: MoviePoster): void {}
```

## Usage

### Getting started

(see below for video recordings of each of the following steps)

INSTALL `NEAR CLI` first like this: `npm i -g near-cli`

1. open git bash
2. run `npm install` from project directory and frontend directory
3. run `near login` from project directory
4. run `npm run dev` from project directory
5. Modify the line in`frontend/src/lib/config.js`that sets the account name of the contract.

   Set it to the account id you got from previous step.

   `CONTRACT_NAME=dev-xxxxxxxxxxxx-xxxxxxxxxxxxxx`

6. Modify the line in`assembly/__tests__/index.spec.ts`that sets the accountId.

   Set it to the account id of your testnet account.

   `accountId=process.env.CONTRACT_NAME || "your-account-id.testnet"`

7. run `npm run test` from project directory
8. run `npm start` from frontend directory

## Videos

**`1. Install required packages using npm package manager`**

This video shows the installation of required packages using npm package manager.

[![loom](https://cdn.loom.com/sessions/thumbnails/ff192b7c4be54952a23289a04f9388ec-with-play.gif)](https://www.loom.com/share/ff192b7c4be54952a23289a04f9388ec?sharedAppSource=personal_library)

**`2. Build and deploy smart contract`**

This video shows the build and deployment of the contract.

[![loom](https://cdn.loom.com/sessions/thumbnails/b60f843a6db54d9abad84c44841e9a02-with-play.gif)](https://www.loom.com/share/b60f843a6db54d9abad84c44841e9a02?sharedAppSource=personal_library)

**`3. App demo`**

This video shows contract methods being called from the react frontend.

[![loom](https://cdn.loom.com/sessions/thumbnails/f719e7fea2754e11889ec520d3df15f2-with-play.gif)](https://www.loom.com/share/f719e7fea2754e11889ec520d3df15f2)

## Deploy contract under sub-account

Each account on NEAR can have at most one contract deployed to it. If you've already created an account such as `your-name.testnet`, you can deploy your contract to `near-market.your-name.testnet`. Assuming you've already created an account on [NEAR Wallet], here's how to create `near-market.your-name.testnet`:

1. Authorize NEAR CLI, following the commands it gives you:

   near login

2. Create a subaccount (replace `YOUR-NAME` below with your actual account name):

   near create-account near-market.YOUR-NAME.testnet --masterAccount YOUR-NAME.testnet
