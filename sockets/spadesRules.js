// ♠️ Spades: the rules, the scoring and the bots, with no sockets in sight (sockets/spades_handler.js runs the table).
//
// Four seats, clockwise: 0 South, 1 West, 2 North, 3 East. Partners sit across: team 0 is seats 0 and 2, team 1 is
// seats 1 and 3. A card is a two-letter string: rank (2-9, T, J, Q, K, A) then suit (S, H, D, C), e.g. 'QS', 'TH'.
//
// Scoring (the common house rules):
//   - A team's bid is its two bids added up (a Nil bid adds nothing).
//   - Make it: 10 points a trick bid, plus 1 point for each extra trick (a "bag").
//   - Miss it ("set"): minus 10 points a trick bid.
//   - Nil: +100 if that player takes no tricks, -100 if they take any. Their tricks don't help their partner's bid;
//     they count as bags.
//   - Every 10 bags a team piles up costs it 100 points.
//   - First team to the target wins. Both over it: the higher score wins. A tie at the top: one more hand.

export const SUITS = ['S', 'H', 'C', 'D'];   // the order a hand is sorted in: black, red, black, red
const RANKS = '23456789TJQKA';
export const SUIT_NAMES = { S: 'Spades', H: 'Hearts', D: 'Diamonds', C: 'Clubs' };

export const rankOf = (card) => RANKS.indexOf(card[0]) + 2;   // 2..14
export const suitOf = (card) => card[1];
export const teamOf = (seat) => seat % 2;
export const partnerOf = (seat) => (seat + 2) % 4;
export const nextSeat = (seat) => (seat + 1) % 4;

export const freshDeck = () => SUITS.flatMap((s) => RANKS.split('').map((r) => r + s));

export const shuffle = (list) => {
    const out = [...list];
    for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
};

/** A hand in the order players like: by suit, high to low */
export const sortHand = (cards) => [...cards].sort((a, b) => SUITS.indexOf(suitOf(a)) - SUITS.indexOf(suitOf(b)) || rankOf(b) - rankOf(a));

/** Four hands of 13 */
export const deal = () => {
    const deck = shuffle(freshDeck());
    return [0, 1, 2, 3].map((seat) => sortHand(deck.slice(seat * 13, seat * 13 + 13)));
};

// ===================== PLAYING A TRICK =====================

/** The cards this hand may play now. `trick` is [{ seat, card }] in the order played. */
export const legalPlays = (hand, trick, spadesBroken) => {
    if (!hand.length) return [];
    if (trick.length) {
        // Follow the suit that was led if you can; if you can't, anything goes (spades included)
        const led = suitOf(trick[0].card);
        const following = hand.filter((c) => suitOf(c) === led);
        return following.length ? following : [...hand];
    }
    // Leading: no spades until they're broken, unless spades are all you have
    if (spadesBroken) return [...hand];
    const others = hand.filter((c) => suitOf(c) !== 'S');
    return others.length ? others : [...hand];
};

/** Who's winning the trick so far: the highest spade, or else the highest card of the suit that was led */
export const trickLeader = (trick) => {
    if (!trick.length) return null;
    let best = trick[0];
    for (const play of trick.slice(1)) {
        const sameSuit = suitOf(play.card) === suitOf(best.card);
        if (sameSuit && rankOf(play.card) > rankOf(best.card)) best = play;
        else if (!sameSuit && suitOf(play.card) === 'S') best = play;   // a spade beats any other suit
    }
    return best;
};

/** Does `card` beat the card that's winning now? */
const beats = (card, winning) => {
    if (suitOf(card) === suitOf(winning)) return rankOf(card) > rankOf(winning);
    return suitOf(card) === 'S';
};

// ===================== SCORING =====================

/**
 * One hand's score for each team. `bids` and `tricks` are per seat (a bid of 0 is Nil); `bags` is each team's pile
 * of bags before this hand. Returns per team: what they bid and took, the points, and the new bag pile.
 */
export const scoreHand = (bids, tricks, bags) => [0, 1].map((team) => {
    const seats = [team, team + 2];
    const nils = seats.filter((s) => bids[s] === 0).map((s) => ({ seat: s, made: tricks[s] === 0, points: tricks[s] === 0 ? 100 : -100 }));
    const bidders = seats.filter((s) => bids[s] > 0);
    const contract = bidders.reduce((sum, s) => sum + bids[s], 0);
    const took = bidders.reduce((sum, s) => sum + tricks[s], 0);
    const nilTricks = seats.filter((s) => bids[s] === 0).reduce((sum, s) => sum + tricks[s], 0);

    let contractPoints = 0;
    let newBags = nilTricks;                     // a Nil bidder's tricks are bags
    let made = null;                             // null: nothing to make (both bid Nil)
    if (contract > 0) {
        made = took >= contract;
        if (made) {
            contractPoints = contract * 10;
            newBags += took - contract;
        } else contractPoints = -contract * 10;
    } else newBags += took;

    const nilPoints = nils.reduce((sum, n) => sum + n.points, 0);
    let pile = (bags[team] || 0) + newBags;
    let bagPenalty = 0;
    while (pile >= 10) {
        pile -= 10;
        bagPenalty -= 100;
    }
    return {
        team,
        contract,
        took,
        tricks: seats.reduce((sum, s) => sum + tricks[s], 0),
        made,
        contractPoints,
        nils,
        bags: newBags,
        bagPenalty,
        bagPile: pile,
        points: contractPoints + newBags + nilPoints + bagPenalty,
    };
});

/** After a hand: the winning team (0 or 1), or null to keep playing */
export const winnerOf = (scores, target) => {
    const over = [0, 1].filter((t) => scores[t] >= target);
    if (!over.length) return null;
    if (scores[0] === scores[1]) return null;     // level at the top: one more hand
    return scores[0] > scores[1] ? 0 : 1;
};

// ===================== 🤖 THE BOTS =====================
// A steady, sensible partner: not a card shark. Also plays for anyone who runs out of time or drops out.

const bySuit = (hand) => Object.fromEntries(SUITS.map((s) => [s, hand.filter((c) => suitOf(c) === s)]));
const lowest = (cards) => cards.reduce((lo, c) => (rankOf(c) < rankOf(lo) ? c : lo), cards[0]);
const highest = (cards) => cards.reduce((hi, c) => (rankOf(c) > rankOf(hi) ? c : hi), cards[0]);
const has = (cards, rank) => cards.some((c) => c[0] === rank);

/** How many tricks this hand should take, roughly */
export const estimateTricks = (hand) => {
    const suits = bySuit(hand);
    const spades = suits.S;
    let est = 0;
    // Spades: the top ones, if they're guarded, then length
    let honors = 0;
    if (has(spades, 'A')) honors += 1;
    if (has(spades, 'K') && spades.length >= 2) honors += 1;
    if (has(spades, 'Q') && spades.length >= 3) honors += 1;
    if (has(spades, 'J') && spades.length >= 4) honors += 0.5;
    est += honors + Math.max(0, spades.length - 3);
    // The other suits: aces and guarded kings and queens
    let ruffs = 0;
    for (const s of ['H', 'C', 'D']) {
        const cards = suits[s];
        if (has(cards, 'A')) est += cards.length >= 6 ? 0.6 : 1;
        if (has(cards, 'K') && cards.length >= 2 && cards.length <= 5) est += has(cards, 'A') ? 0.9 : 0.6;
        if (has(cards, 'Q') && cards.length >= 3 && cards.length <= 4 && (has(cards, 'A') || has(cards, 'K'))) est += 0.4;
        if (cards.length === 0) ruffs += 1;
        else if (cards.length === 1) ruffs += 0.5;
    }
    // Short suits let spades take tricks, if there are spades to spare
    const spareSpades = Math.max(0, spades.length - honors);
    est += Math.min(ruffs, spareSpades * 0.8);
    return est;
};

/** Could this hand go Nil? Weak, short in spades, no high cards to get stuck with */
const looksNil = (hand) => {
    const suits = bySuit(hand);
    if (suits.S.length > 3 || suits.S.some((c) => rankOf(c) >= 11)) return false;
    if (hand.some((c) => c[0] === 'A' || c[0] === 'K')) return false;
    // Each side suit needs low cards to duck with (or be short)
    return ['H', 'C', 'D'].every((s) => suits[s].length <= 1 || suits[s].some((c) => rankOf(c) <= 5));
};

/** A bot's bid. `bids` is everyone's so far (null: not bid yet). */
export const botBid = (hand, seat, bids) => {
    const est = estimateTricks(hand);
    const partnerBid = bids[partnerOf(seat)];
    if (est < 1.2 && partnerBid !== 0 && looksNil(hand)) return 0;
    let bid = Math.round(est);
    // A partner who went Nil needs cover: bid a little more boldly
    if (partnerBid === 0) bid = Math.round(est + 0.4);
    // Don't push the table far past 13
    const others = bids.reduce((sum, b, s) => (s !== seat && b !== null ? sum + b : sum), 0);
    if (others + bid > 14) bid = Math.max(1, 14 - others);
    return Math.max(1, Math.min(13, bid));
};

/**
 * A bot's card. `view`: { hand, trick, seat, bids, tricks, spadesBroken, played } — `played` is every card
 * already played this hand (for knowing which cards are the best left in a suit).
 */
export const botPlay = ({ hand, trick, seat, bids, tricks, spadesBroken, played = [] }) => {
    const legal = legalPlays(hand, trick, spadesBroken);
    if (legal.length === 1) return legal[0];
    const gone = new Set([...played, ...trick.map((p) => p.card)]);
    // The best card left in a suit (nobody else can beat it)
    const isBoss = (card) => {
        for (let r = rankOf(card) + 1; r <= 14; r++) {
            const higher = RANKS[r - 2] + suitOf(card);
            if (!gone.has(higher) && !hand.includes(higher)) return false;
        }
        return true;
    };
    const partner = partnerOf(seat);
    const myNil = bids[seat] === 0;
    const partnerNil = bids[partner] === 0;
    const team = teamOf(seat);
    const teamBid = [team, team + 2].reduce((sum, s) => sum + (bids[s] > 0 ? bids[s] : 0), 0);
    const teamTook = [team, team + 2].reduce((sum, s) => sum + (bids[s] > 0 ? tricks[s] : 0), 0);
    const need = teamBid - teamTook;
    const nonSpades = (cards) => cards.filter((c) => suitOf(c) !== 'S');

    // ---- Leading ----
    if (!trick.length) {
        if (myNil) {
            const safe = nonSpades(legal);
            return lowest(safe.length ? safe : legal);
        }
        // Cash a sure winner, if we still need tricks (or partner's Nil needs covering)
        if (need > 0 || partnerNil) {
            const bosses = legal.filter(isBoss);
            const sideBoss = nonSpades(bosses);
            if (sideBoss.length) return highest(sideBoss);
            if (bosses.length) return highest(bosses);
        }
        if (partnerNil) {
            const side = nonSpades(legal);
            return highest(side.length ? side : legal);
        }
        // Otherwise, a low card from the longest side suit
        const suits = bySuit(legal);
        const longest = ['H', 'C', 'D'].filter((s) => suits[s].length).sort((a, b) => suits[b].length - suits[a].length)[0];
        return lowest(longest ? suits[longest] : legal);
    }

    const winning = trickLeader(trick);
    const position = trick.length;                      // 1: second to play, 2: third, 3: last
    const isLast = position === 3;
    const led = suitOf(trick[0].card);
    const following = suitOf(legal[0]) === led && legal.every((c) => suitOf(c) === led);
    const winners = legal.filter((c) => beats(c, winning.card));
    const losers = legal.filter((c) => !beats(c, winning.card));
    const partnerWinning = winning.seat === partner;

    // ---- My Nil: stay under ----
    if (myNil) {
        if (losers.length) {
            // Following: the highest card that still loses. Off suit: throw away the most dangerous card.
            const sideLosers = nonSpades(losers);
            return highest(sideLosers.length ? sideLosers : losers);
        }
        // Every card wins: the last to play dumps the biggest; otherwise hope someone after goes higher
        return isLast ? highest(legal) : lowest(legal);
    }

    // ---- Partner's Nil: take the trick away from them ----
    if (partnerNil) {
        const partnerPlayed = trick.some((p) => p.seat === partner);
        if (partnerWinning && winners.length) return following ? highest(winners) : lowest(winners);
        if (!partnerPlayed && winners.length) return highest(winners);   // go high before partner plays
        if (!winners.length) return following ? lowest(legal) : lowest(nonSpades(legal).length ? nonSpades(legal) : legal);
        return lowest(winners);
    }

    // ---- Our bid's made: don't win tricks we don't need (bags) ----
    const discard = () => {
        const side = nonSpades(losers.length ? losers : legal);
        return lowest(side.length ? side : (losers.length ? losers : legal));
    };
    if (need <= 0) return losers.length ? (following ? highest(losers) : discard()) : lowest(legal);

    // ---- Partner's winning: leave it, unless an opponent can still beat it ----
    const partnerSafe = partnerWinning && (isLast || isBoss(winning.card) || suitOf(winning.card) === 'S' && led !== 'S');
    if (partnerSafe) return following ? lowest(legal) : discard();

    if (!winners.length) return following ? lowest(legal) : discard();

    if (following) {
        if (isLast) return lowest(winners);
        // Second to play: low, unless we hold the best card
        if (position === 1) {
            const boss = winners.filter(isBoss);
            return boss.length ? lowest(boss) : lowest(legal);
        }
        // Third: high enough to make the last player work for it
        const boss = winners.filter(isBoss);
        return boss.length ? lowest(boss) : highest(winners);
    }
    // Can't follow: trump with the smallest spade that wins
    return lowest(winners);
};
