export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-IN").format(price);
};

export const getDiscountPercent = (discount: number, price: number) => {
  if (!price) return 0;
  return Math.round((discount / price) * 100);
};
