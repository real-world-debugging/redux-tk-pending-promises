
export const getCartQuantity = (cart): number =>
  Object.values(cart).reduce((price, entry) => price + entry.quantity, 0);
