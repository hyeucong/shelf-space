export interface PaginationLinkType {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedData<T> {
    data: T[];
    links: PaginationLinkType[];
    current_page: number;
    last_page: number;
    per_page: number;
    first_page_url: string;
    last_page_url: string;
    from: number;
    to: number;
    total: number;
}
