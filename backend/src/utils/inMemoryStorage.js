// Temporary in-memory user storage for development when MongoDB is not available
// WARNING: This is NOT for production use - data is lost on server restart

const users = new Map();

export const inMemoryStorage = {
  // Find user by query
  findOne: async (query) => {
    for (const [id, user] of users.entries()) {
      if (query.email && user.email === query.email) return user;
      if (query.contactNumber && user.contactNumber === query.contactNumber) return user;
      if (query.username && user.username === query.username) return user;
      if (query._id && id === query._id) return user;
      if (query.$or) {
        for (const condition of query.$or) {
          if (condition.email && user.email === condition.email) return user;
          if (condition.contactNumber && user.contactNumber === condition.contactNumber) return user;
          if (condition.username && user.username === condition.username) return user;
        }
      }
    }
    return null;
  },

  // Create new user
  create: async (userData) => {
    const id = Date.now().toString();
    const user = {
      _id: id,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.set(id, user);
    return user;
  },

  // Update user
  update: async (id, updates) => {
    const user = users.get(id);
    if (!user) return null;
    
    Object.assign(user, updates, { updatedAt: new Date() });
    users.set(id, user);
    return user;
  },

  // Find by ID
  findById: async (id) => {
    return users.get(id) || null;
  },

  // Get all users (for debugging)
  getAll: () => Array.from(users.values()),

  // Clear all (for testing)
  clear: () => users.clear()
};
