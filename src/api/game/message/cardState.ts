export type CardType = 'cavalry' | 'infantry' | 'artillery' | 'jolly';

export interface Card {
    id: number;
    type: CardType;
    region: string;
}

export interface CardState {
    cards: Card[];
}
