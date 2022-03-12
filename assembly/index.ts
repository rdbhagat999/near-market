// The entry file of your WebAssembly module.

import { FungibleToken, Item } from "./model";
import { AccountId } from "./utils";

// VIEW METHODS
export function getProjectInfo(): string {
  return FungibleToken.get_info();
}

export function fetchFungibleTokenListByAccountId(
  accountId: AccountId
): FungibleToken[] {
  return FungibleToken.getFTListByAccountId(accountId);
}

// CHANGE METHODS
export function buyFungibleToken(item: Item): FungibleToken {
  return FungibleToken.buy_fungible_token(item);
}

export function sellFungibleToken(ft: FungibleToken): void {
  FungibleToken.sell_fungible_token(ft);
}
