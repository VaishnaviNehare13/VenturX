import sys

path = r'c:\Users\Vaishnavi\Downloads\Startup-Management_Major-Final\Startup-Management_Major-main\frontend\src\js\segmentation.js'
with open(path, 'r', encoding='utf-8') as f:
    c = f.read()

injection = """
  updateUI(data);

  const segmentationPayload = {

      user_email:
          window.LiveMongoPayload?.user?.email ||
          "founder@startup.com",

      total_customers: 2240,

      silhouette_score: 0.355,

      segments_count: 4,

      algorithm: "K-Means + UMAP",

      segments: [

          {
              segment: "At Risk",
              count: 1123,
              avg_order: 12.0,
              frequency: 8.6,
              recency_days: 50.9,
              income: 35483
          },

          {
              segment: "Average",
              count: 574,
              avg_order: 62.2,
              frequency: 21.3,
              recency_days: 69.9,
              income: 73280
          },

          {
              segment: "Low Engagement",
              count: 542,
              avg_order: 43.8,
              frequency: 21.1,
              recency_days: 23.4,
              income: 64670
          },

          {
              segment: "High Value",
              count: 1,
              avg_order: 1679,
              frequency: 1.0,
              recency_days: 53,
              income: 51382
          }
      ],

      recommendations: [

          {
              segment: "High Value",
              strategy: "VIP treatment and exclusive offers",
              channel: "SMS + Email"
          },

          {
              segment: "Average",
              strategy: "Loyalty programs and promotions",
              channel: "In-app + Email"
          },

          {
              segment: "Low Engagement",
              strategy: "Re-engagement campaigns",
              channel: "Email + Retargeting"
          },

          {
              segment: "At Risk",
              strategy: "Win-back campaigns",
              channel: "Phone + Email"
          }
      ]
  };

  console.log(
      "SEGMENTATION INPUT:",
      segmentationPayload
  );

  const segmentationResponse =
      await window.API.Segmentation.saveSegmentation(
          segmentationPayload
      );

  console.log(
      "SEGMENTATION RESPONSE:",
      segmentationResponse
  );
"""

if "SEGMENTATION INPUT" not in c:
    c = c.replace("  updateUI(data);", injection)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(c)
    print("Patched segmentation.js")
else:
    print("Already patched")
