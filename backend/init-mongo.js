// MongoDB initialization script
db = db.getSiblingDB('sensgrid');

// Create collections if they don't exist
db.createCollection('articles');
db.createCollection('users');

// Create indexes
db.articles.createIndex({ "title": "text", "content": "text" });
db.users.createIndex({ "email": 1 }, { unique: true });

print("Database initialized successfully");
