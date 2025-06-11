# 🎯 Dummy Data Generation Script

This script generates realistic sales call data and inserts it into your Supabase database for testing the dashboard.

## Setup

### 1. Get your Supabase Service Role Key

1. Go to [Supabase Dashboard → Project Settings → API](https://supabase.com/dashboard/project/gktdkjeflginpvgsndyy/settings/api)
2. Copy the **service_role** key (not the anon key)
3. Keep this key secure - it has admin access to your database

### 2. Run the Script

**Generate 100 records (default):**
```bash
SUPABASE_SERVICE_KEY=your_service_role_key_here npm run generate-data
```

**Generate custom number of records:**
```bash
SUPABASE_SERVICE_KEY=your_service_role_key_here npm run generate-data 500
```

**For testing different amounts:**
```bash
# Small dataset (good for testing)
SUPABASE_SERVICE_KEY=your_service_role_key_here npm run generate-data 50

# Medium dataset (realistic weekly volume)
SUPABASE_SERVICE_KEY=your_service_role_key_here npm run generate-data 200

# Large dataset (stress testing)
SUPABASE_SERVICE_KEY=your_service_role_key_here npm run generate-data 1000
```

## What the Script Generates

### 📊 Realistic Call Data
- **Clients**: KLINICS, REALTY, SAASCO
- **Time Range**: Last 30 days
- **HeatCheck Scores**: Weighted distribution (40% = 0, realistic for sales)
- **Industry-Specific Needs**: Medical, real estate, software relevant
- **Realistic Analysis**: Both simple and detailed formats

### 📈 Data Distribution
- **40%** calls with HeatCheck score 0
- **20%** calls with scores 1-3
- **20%** calls with scores 4-6
- **15%** calls with scores 7-8
- **5%** calls with scores 9-10

### 🏥 KLINICS Sample Needs
- Medical consultation scheduling
- Insurance verification questions
- Specialist referral requests
- Lab results discussions

### 🏠 REALTY Sample Needs
- Property listing inquiries
- Home buying consultations
- Market analysis requests
- Investment property discussions

### 💻 SAASCO Sample Needs
- Software demo requests
- Pricing inquiries
- Implementation discussions
- Technical support consultations

## Sample Output

```
🎯 Sales Call Dummy Data Generator
==================================
Target: 100 records
Database: https://gktdkjeflginpvgsndyy.supabase.co

🚀 Generating 100 dummy call records...
📤 Inserting data into Supabase...
✅ Inserted batch 1/2 (50 records)
✅ Inserted batch 2/2 (50 records)
🎉 Successfully generated 100 dummy call records!

📊 Data Distribution:
By Client: { KLINICS: 35, REALTY: 33, SAASCO: 32 }
By HeatCheck Score: { '0': 42, '1': 8, '2': 6, '3': 7, '4': 9, '5': 8, '6': 7, '7': 6, '8': 4, '9': 2, '10': 1 }
```

## 🔒 Security Notes

- The service role key has full database access
- Never commit this key to version control
- Only use it for admin operations like this script
- The dashboard itself uses the anon key with RLS protection 