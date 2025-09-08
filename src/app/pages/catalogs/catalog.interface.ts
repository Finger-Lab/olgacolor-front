export interface FilterParams {
    search?: string;
    category?: string;
}

export interface ICatalog {
    id: string;
    name: string;
    description?: string;
    category: string;
    thumbnailUrl: string;
    pdfUrl: string;
    order?: number;
    createdAt?: string;
    [key: string]: any;
}
