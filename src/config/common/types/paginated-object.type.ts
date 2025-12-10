export interface PaginatedObjI {
  docs: Array<any>;
  pagination: {
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
    nextPage: number;
    page: number;
    prevPage: number;
    totalDocs: number;
    totalPages: number;
  };
}
