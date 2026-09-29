import os
from pymongo import MongoClient

mongo_uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
db_name = os.getenv("MONGO_DB_NAME", "venturx")

client = MongoClient(mongo_uri)
db = client[db_name]

users_collection = db["users"]
subscriptions_collection = db["subscriptions"]
analytics_collection = db["analytics"]
campaigns_collection = db["campaigns"]
forecasts_collection = db["forecasts"]
recommendations_collection = db["recommendations"]
reports_collection = db["reports"]
settings_collection = db["settings"]
activity_logs_collection = db["activity_logs"]
dashboard_collection = db["dashboard"]
user_analytics_collection = db["user_analytics"]
crm_collection = db["crm"]
segmentation_collection = db["Segmentations"]
contenthub_collection = db["contenthub"]
branding_collection = db["branding"]
financials_collection = db["financials"]
print("MongoDB Connected Successfully")