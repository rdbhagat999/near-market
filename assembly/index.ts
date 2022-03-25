// The entry file of your WebAssembly module.

import { MoviePoster, Item } from "./model";
import { AccountId } from "./utils";

// VIEW METHODS

// return information about the project
export function getProjectInfo(): string {
  return MoviePoster.get_info();
}

// returns an array of posters owned by an account
export function fetchMovieListByAccountId(accountId: AccountId): MoviePoster[] {
  return MoviePoster.getMovieListByAccountId(accountId);
}

// CHANGE METHODS

// returns a poster bought by context.sender
export function buyMoviePoster(item: Item): MoviePoster {
  return MoviePoster.buy_movie_poster(item);
}

// called to sell a poster bought by context.sender
export function sellMoviePoster(ft: MoviePoster): void {
  MoviePoster.sell_movie_poster(ft);
}
