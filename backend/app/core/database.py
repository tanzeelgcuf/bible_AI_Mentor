from motor.motor_asyncio import AsyncIOMotorClient
from .config import MONGODB_URL, DATABASE_NAME

# Database connection
client = AsyncIOMotorClient(MONGODB_URL)
db = client[DATABASE_NAME]

# Collections
users_collection = db.users
conversations_collection = db.conversations
workshops_collection = db.workshops
donations_collection = db.donations