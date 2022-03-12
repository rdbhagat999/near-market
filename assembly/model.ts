import { AccountId, Amount, UnsignedInteger32 } from "./utils";

import {
  PersistentUnorderedMap,
  logging,
  context,
  PersistentSet,
  ContractPromiseBatch,
} from "near-sdk-as";

export const message = "This is the near protocol smart contract tutorial.";

// ft_set = {"accountId-tokenId"}
const ft_set = new PersistentSet<string>("s");

// ft_uMap = {"accountId": FungibleToken[]}
let ft_uMap = new PersistentUnorderedMap<string, FungibleToken[]>("u");

@nearBindgen
export class Item {
  id: UnsignedInteger32;
  title: string;
  backdropPath: string;
  releaseDate: string;
  voteAverage: f32;
}

@nearBindgen
export class FungibleToken {
  item: Item;
  price: Amount;
  created_at: string;

  constructor(item: Item, price: Amount, created_at: string) {
    this.item = item;
    this.price = price;
    this.created_at = created_at;
  }

  private static transfer_funds(transferTo: AccountId, funds: Amount): void {
    logging.log(`transferring ${funds} yN to ${transferTo}`);
    const beneficiary = ContractPromiseBatch.create(transferTo);
    beneficiary.transfer(funds);
  }

  private static create_fungible_token(
    item: Item,
    blockTimestamp: string
  ): FungibleToken {
    const attachedDepositInYoctoNear = context.attachedDeposit;

    logging.log(
      `attachedDepositInYoctoNear is ${attachedDepositInYoctoNear} yN`
    );

    return new FungibleToken(item, attachedDepositInYoctoNear, blockTimestamp);
  }

  public static get_info(): string {
    return message;
  }

  public static getFTListByAccountId(accountId: AccountId): FungibleToken[] {
    assert(
      accountId.length > 0,
      "Sender is required, put your account ID as sender!"
    );
    logging.log(`fetching fts owned by ${accountId}`);

    const isSender = ft_uMap.contains(accountId);

    return isSender ? ft_uMap.getSome(accountId) : [];
  }

  @mutateState()
  public static buy_fungible_token(item: Item): FungibleToken {
    const sender = context.sender;
    const contractName = context.contractName;
    const depositInYoctoNear = context.attachedDeposit;
    const blockTimestamp = `${context.blockTimestamp}`;

    logging.log(`${sender} is buyer`);

    logging.log(`${contractName} is seller`);

    logging.log(`ft_set.values() ${ft_set.values().toString()}`);

    assert(
      sender.length > 0,
      "Sender is required, put your account ID as sender!"
    );

    let buyer_ft_id = `${sender}-${item.id}`;
    let hasBought = ft_set.has(buyer_ft_id);

    logging.log(`hasBought ${hasBought}`);

    assert(!hasBought, `You have already bought this item.`);

    const ft = this.create_fungible_token(item, blockTimestamp);

    const isSender = ft_uMap.contains(sender);

    if (isSender) {
      const fts = ft_uMap.getSome(sender);
      fts.push(ft);
      ft_uMap.set(sender, fts);
    } else {
      ft_uMap.set(sender, [ft]);
    }

    logging.log(`adding ${buyer_ft_id}`);
    ft_set.add(buyer_ft_id);

    this.transfer_funds(contractName, depositInYoctoNear);

    logging.log(`${sender} bought an ft from ${contractName}`);
    logging.log(`ft_set.values() ${ft_set.values().toString()}`);

    return ft;
  }

  private static calculateSellPrice(price: Amount): Amount {
    // let itemPriceInYoctoNear = u128.mul(price, u128.fromF32(2));
    let itemPriceInYoctoNear = price;
    logging.log(`item sell price is ${itemPriceInYoctoNear} yN`);
    return itemPriceInYoctoNear;
  }

  @mutateState()
  public static sell_fungible_token(ft: FungibleToken): void {
    const seller = context.sender;
    const buyer = context.contractName;

    assert(
      seller.length > 0,
      "Seller is required, put your account ID as seller!"
    );

    logging.log(`ft_set.values() ${ft_set.values().toString()}`);

    logging.log(`${buyer} is buyer`);

    logging.log(`${seller} is seller`);

    let seller_ft_id = `${seller}-${ft.item.id}`;

    let sellerHasFT = ft_set.has(seller_ft_id);
    logging.log(`sellerHasFT ${sellerHasFT}`);

    assert(sellerHasFT, `You can only sell your own item.`);

    const sellPriceInYoctoNear = this.calculateSellPrice(ft.price);

    const isSender = ft_uMap.contains(seller);

    if (isSender) {
      const seller_fts = ft_uMap.getSome(seller);
      let updatedFTs = new Array<FungibleToken>();

      for (let i = 0; i < seller_fts.length; i++) {
        if (seller_fts[i].item.id != ft.item.id) {
          updatedFTs.push(seller_fts[i]);
        }
      }

      ft_uMap.set(seller, updatedFTs);
      logging.log(`updated ft_map for ${seller}`);
    } else {
      ft_uMap.set(seller, []);
      logging.log(`reset ft_map for ${seller}`);
    }

    logging.log(`deleteing ${seller_ft_id}`);
    ft_set.delete(seller_ft_id);

    this.transfer_funds(seller, sellPriceInYoctoNear);

    logging.log(`${seller} sold an ft to ${buyer}`);
    logging.log(`ft_set.values() ${ft_set.values().toString()}`);
  }
}