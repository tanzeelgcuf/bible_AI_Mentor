// Initialize MongoDB for One Million Preachers
db = db.getSiblingDB("one_million_preachers");

// Create collections
db.createCollection("users");
db.createCollection("conversations");
db.createCollection("workshops");
db.createCollection("donations");

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ facebook_id: 1 }, { sparse: true });
db.users.createIndex({ created_at: -1 });

db.conversations.createIndex({ user_id: 1, assistant_type: 1 });
db.conversations.createIndex({ updated_at: -1 });

db.workshops.createIndex({ order: 1 }, { unique: true });
db.workshops.createIndex({ category: 1 });

db.donations.createIndex({ created_at: -1 });
db.donations.createIndex({ status: 1 });

print("✓ MongoDB initialized for One Million Preachers");
