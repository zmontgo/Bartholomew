import config from "../config";

const deck = [
  "CA",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "C10",
  "CJ",
  "CQ",
  "CK",
  "HA",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "H7",
  "H8",
  "H9",
  "H10",
  "HJ",
  "HQ",
  "HK",
  "SA",
  "S1",
  "S2",
  "S3",
  "S4",
  "S5",
  "S6",
  "S7",
  "S8",
  "S9",
  "S10",
  "SJ",
  "SQ",
  "SK",
  "DA",
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
  "DJ",
  "DQ",
  "DK",
]

var playing: string[] = [];

const get_decks = async (): Promise<string[]> => {
  const tempDeck: string[] = [];

  for (var i = 0; i < config.decks; i++) {
    tempDeck.push(...deck)
  }

  return tempDeck;
}

const shuffle = async () => {
  const tempDeck = await get_decks();
  
  let currentIndex = tempDeck.length, randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex != 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [tempDeck[currentIndex], tempDeck[randomIndex]] = [
      tempDeck[randomIndex], tempDeck[currentIndex]];
  }

  playing = tempDeck;
}

export const draw = (): string => {
  return playing.pop()!;
}

export const get_hands = async () => {
  if (playing.length < 10) await shuffle();

  const dealer: string[] = [draw()];
  const player: string[] = [draw()];

  dealer.push(draw());
  player.push(draw());

  return [dealer, player];
}

export const shoe_size = async () => {
  return playing.length
}