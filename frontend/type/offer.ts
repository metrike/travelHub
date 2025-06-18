export interface Offer {
    _id: string;
    from: string;
    to: string;
    departDate: string;
    returnDate: string;
    provider: string;
    price: number;
    currency: string;
    legs?: {
        flightNum: string;
        dep: string;
        arr: string;
        duration: number;
    }[];
    hotel?: {
        name: string;
        nights: number;
        price: number;
    };
    activity?: {
        title: string;
        price: number;
    };
    relatedOffers?: string[];
}

export default Offer