// The entry file of your WebAssembly module.

import { FungibleToken, Item } from "./model";
import { AccountId } from "./utils";

// VIEW METHODS

// return information about the project
export function getProjectInfo(): string {
  return FungibleToken.get_info();
}

// returns an array of fungible tokens owned by an account
export function fetchFungibleTokenListByAccountId(
  accountId: AccountId
): FungibleToken[] {
  return FungibleToken.getFTListByAccountId(accountId);
}

// CHANGE METHODS

// returns a fungible token bought by context.sender
export function buyFungibleToken(item: Item): FungibleToken {
  return FungibleToken.buy_fungible_token(item);
}

// called to sell a fungible token bought by context.sender
export function sellFungibleToken(ft: FungibleToken): void {
  FungibleToken.sell_fungible_token(ft);
}
