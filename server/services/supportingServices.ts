import { db } from '../db/database';
import { Review, Weather, WeatherAlert, ColdStorage, Article, ArticleCategory, Notification } from '../db/schema';

export const reviewService = {
  getForProduct(productId: string) {
    return db.getReviewsForProduct(productId);
  },

  getForFarmer(farmerId: string) {
    return db.getReviewsForFarmer(farmerId);
  },

  add(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt' | 'isVerifiedPurchase' | 'status'>) {
    return db.addReview(reviewData);
  }
};

export const weatherService = {
  getForLocation(district: string, state?: string) {
    return db.getWeatherForecasts(district);
  },

  getAlerts(location?: string) {
    if (location) {
      return db.getWeatherAlertsByLocation(location);
    }
    return db.getAllWeatherAlerts();
  },

  createAlert(data: Omit<WeatherAlert, 'id' | 'createdAt'>) {
    return db.createWeatherAlert(data);
  }
};

export const coldStorageService = {
  search(params: { district?: string; state?: string; minCapacityTonnes?: number }) {
    return db.getAllColdStorages(params.district);
  },

  getById(id: string) {
    return db.getColdStorageById(id);
  }
};

export const articleService = {
  getAll(category?: string) {
    return db.getAllArticles(category);
  },

  getById(id: string) {
    return db.getArticleById(id);
  },

  getCategories() {
    return db.getAllArticleCategories();
  }
};

export const notificationService = {
  getForUser(userId: string) {
    return db.getUserNotifications(userId);
  },

  send(notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) {
    return db.sendNotification(notification);
  },

  markRead(notificationId: string) {
    return db.markNotificationAsRead(notificationId);
  }
};
