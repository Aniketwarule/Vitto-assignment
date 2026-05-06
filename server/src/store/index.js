const { v4: uuidv4 } = require('uuid');

/**
 * In-memory data store for the lending decision system.
 * 
 * In production, this would be replaced with:
 * - PostgreSQL for business profiles (structured, ACID-compliant for financial data)
 * - MongoDB for application logs and audit trail (document-oriented, flexible schema)
 * 
 * The repository pattern used here makes swapping trivial.
 */
class DataStore {
  constructor() {
    this.applications = new Map();
  }

  generateId() {
    return uuidv4();
  }

  /**
   * Save a complete application (business profile + loan + decision)
   */
  saveApplication(application) {
    const now = new Date().toISOString();
    const record = {
      ...application,
      id: application.id || this.generateId(),
      createdAt: application.createdAt || now,
      updatedAt: now,
    };
    this.applications.set(record.id, record);
    return record;
  }

  /**
   * Find application by ID
   */
  getApplicationById(id) {
    return this.applications.get(id) || null;
  }

  /**
   * Get all applications sorted by creation date (newest first)
   */
  getAllApplications() {
    return Array.from(this.applications.values())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  /**
   * Get total count of applications
   */
  getCount() {
    return this.applications.size;
  }
}

// Singleton instance
module.exports = new DataStore();
