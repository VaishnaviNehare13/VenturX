from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")

db = client["venturx"]

users_collection = db["users"]
subscriptions_collection = db["subscriptions"]
analytics_collection = db["analytics"]
campaigns_collection = db["campaigns"]
forecasts_collection = db["forecasts"]
recommendations_collection = db["recommendations"]
reports_collection = db["reports"]
settings_collection = db["settings"]
activity_logs_collection = db["activity_logs"]

print("MongoDB Connected Successfully")