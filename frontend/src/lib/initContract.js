import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import * as buffer from "buffer";
import getConfig from "./config";

window.Buffer = buffer.Buffer;

const nearConfig = getConfig(process.env.NODE_ENV || "development");

// Initialize contract & set global variables
export async function initContract() {
  const config = Object.assign(nearConfig, {
    deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() },
  });
  console.log("NODE_ENV", process.env.NODE_ENV);

  // Initialize connection to the NEAR testnet
  const near = await connect(config);

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // Load in account data
  window.currentUser = "";

  if (window.walletConnection.getAccountId()) {
    window.currentUser = {
      accountId: window.walletConnection.getAccountId(),
      balance: (await window.walletConnection.account().state()).amount,
    };
  }

  window.contractName = nearConfig.contractName;

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(
    window.walletConnection.account(),
    nearConfig.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: ["getProjectInfo", "fetchMovieListByAccountId"],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ["buyMoviePoster", "sellMoviePoster"],
      sender: window.walletConnection.getAccountId(),
    }
  );
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName, "NEAR App");
}
