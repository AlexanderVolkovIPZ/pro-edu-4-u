export type PriceRange = {
  minPrice: number | undefined;
  maxPrice: number | undefined;
};

export type AuctionFiltering = {
  data: {
    maxLotPriceExisted: number;
    minLotPriceExisted: number;
    maxLotPriceSelected: number;
    minLotPriceSelected: number;
    lotCategoriesExistedNames: string[];
    lotCategoriesSelectedNames: string[];
  };
  isFetched: boolean;
  onChangeFilters: (filters: { priceRange: PriceRange; categories: string | undefined }) => void;
};
