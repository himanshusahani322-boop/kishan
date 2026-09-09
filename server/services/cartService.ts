import { db } from '../db/database';

export const cartService = {
  getCart(buyerId: string) {
    return db.getBuyerCart(buyerId);
  },

  addItem(buyerId: string, productId: string, quantityQuintals: number) {
    return db.addToBuyerCart(buyerId, productId, quantityQuintals);
  },

  updateQuantity(buyerId: string, productId: string, quantityQuintals: number) {
    return db.updateCartItemQuantity(buyerId, productId, quantityQuintals);
  },

  removeItem(buyerId: string, productId: string) {
    return db.removeFromBuyerCart(buyerId, productId);
  },

  clearCart(buyerId: string) {
    return db.clearBuyerCart(buyerId);
  },

  getWishlist(buyerId: string) {
    return db.getBuyerWishlist(buyerId);
  },

  toggleWishlist(buyerId: string, productId: string) {
    return db.toggleBuyerWishlist(buyerId, productId);
  }
};
