export interface Event {
    eventId: string;
    topicId: string;
    name: string;
    description: string;
}

export interface Market {
    marketId: string;
    eventId: string;
    label: string;
}

export interface Topic {
    id: string;
    topic: string;
}