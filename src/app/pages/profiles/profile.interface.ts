export interface FilterParams {
    search?: string;
    category?: string;
}

export interface IProfile {
    id: string;
    name?: string;
    description?: string;
    equivalence?: string;
    images?: string[];
    categories?: string[];
    systemTypes?: string[];
    weight?: string;
    [key: string]: any;
}