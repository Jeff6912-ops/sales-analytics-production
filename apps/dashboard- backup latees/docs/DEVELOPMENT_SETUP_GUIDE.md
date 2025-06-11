# 🚀 Development Setup Guide
## Dashboard Project Setup & Common Issues

---

## 📁 **IMPORTANT: Directory Navigation**

**⚠️ Common Issue**: Running `npm run dev` from wrong directory

```bash
# ❌ WRONG - This will fail
cd /Users/davidv/sales_analysis
npm run dev  # Error: Could not read package.json

# ✅ CORRECT - Navigate to dashboard project
cd /Users/davidv/sales_analysis/sales-dashboard
npm run dev  # Success: Next.js starts on localhost:3000
```

**Why this matters**: The Next.js project is in the `sales-dashboard` subdirectory, not the root `sales_analysis` directory.

---

## 🎯 **Quick Start (5 Minutes)**

```bash
# 1. Navigate to correct directory
cd /Users/davidv/sales_analysis/sales-dashboard

# 2. Install dependencies (if needed)
npm install

# 3. Start development server
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## 📋 **Current Project Status**

### **✅ Phase 1: Foundation Complete**
- Next.js 15 project setup with TypeScript
- shadcn/ui components integrated
- Supabase client configuration
- Professional dashboard shell with tabbed interface
- Database validation component

### **🟡 Phase 2: In Progress (30% Complete)**
- Enhanced UI with metric cards and responsive design
- Database investigation completed (SQL functions exist!)
- Missing dashboard view identified as main blocker

### **❗ Current Blockers**
1. **Missing Database View**: `dashboard_call_data_with_team` needs to be created
2. **Environment Configuration**: .env.local configured but connection needs testing
3. **Query Implementation**: Need to replace demo data with real database queries

---

## 🔧 **Environment Setup**

### **1. Environment Variables**
File: `.env.local` (already configured)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://gktdkjeflginpvgsndyy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdrdGRramVmbGdpbnB2Z3NuZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE0NzU3MTMsImV4cCI6MjA0NzA1MTcxM30.HJd-cugdgNMp5M3-4KhXjCzOtdRgIgHh4LgF4i4wqTU
```

### **2. Database Schema Status**
- ✅ **SQL Functions Exist**: `extract_heatcheck_score`, `extract_call_outcome`, etc.
- ❌ **Missing View**: `dashboard_call_data_with_team` (SQL created in `/sql/` folder)
- ✅ **Base Tables**: `call_messages`, `clients`, `team_members` confirmed

---

## 🖥️ **Dashboard Features Currently Working**

### **✅ Functional Components**
- Responsive tabbed interface (Overview, Database, Team Performance, Reports & Exports)
- Professional metric cards with icons and loading states
- Database validation component with connection testing
- Team performance demo setup
- Mobile-responsive design

### **🔍 Database Validation Tab**
Navigate to: `http://localhost:3000/dashboard` → **Database tab**
- Tests connection to production Supabase
- Validates data completion rates
- Shows SQL function availability
- Identifies missing views/tables

### **📊 Demo Data Display**
- Performance metrics with realistic numbers
- Recent activity feed
- Team performance placeholders
- Export functionality framework

---

## 🚨 **Troubleshooting Common Issues**

### **Issue 1: npm run dev fails**
```bash
# Error: Could not read package.json
# Solution: Check directory
pwd  # Should show: /Users/davidv/sales_analysis/sales-dashboard
cd sales-dashboard  # If you're in parent directory
npm run dev
```

### **Issue 2: Port already in use**
```bash
# Error: Port 3000 is already in use
# Solution: Kill process or use different port
lsof -ti:3000 | xargs kill -9  # Kill process on port 3000
# OR
npm run dev -- --port 3001  # Use different port
```

### **Issue 3: TypeScript errors**
```bash
# Clear Next.js cache if TypeScript errors persist
rm -rf .next
npm run dev
```

### **Issue 4: Database connection fails**
1. Check environment variables in `.env.local`
2. Use Database Validation tab to test connection
3. Verify Supabase project is active

---

## 📈 **Next Development Steps**

### **Immediate (Next Session)**
1. **Create Missing Database View**
   ```bash
   # Run the SQL file we created
   psql -h db.gktdkjeflginpvgsndyy.supabase.co -U postgres -f sql/create_dashboard_view.sql
   ```

2. **Test Database Connection**
   - Use Database Validation tab
   - Verify view creation successful
   - Test sample queries

3. **Replace Demo Data**
   - Update dashboard components to use real data
   - Implement loading states
   - Add error handling

### **Short-term (This Week)**
1. Complete interactive filtering
2. Add real-time data subscriptions
3. Implement export functionality
4. Polish UI/UX

---

## 📁 **Project Structure**

```
sales-dashboard/
├── src/
│   ├── app/
│   │   ├── dashboard/          # Main dashboard page
│   │   │   └── page.tsx       # Tabbed dashboard interface
│   │   ├── api/               # API routes (auth, data)
│   │   └── globals.css        # Global styles
│   ├── components/
│   │   ├── dashboard/         # Dashboard components
│   │   │   ├── DashboardShell.tsx
│   │   │   ├── MetricCards.tsx
│   │   │   └── DatabaseValidator.tsx
│   │   └── ui/               # shadcn/ui components
│   ├── lib/
│   │   ├── supabase/         # Database clients
│   │   └── utils.ts          # Utilities
│   └── types/                # TypeScript definitions
├── sql/                      # Database SQL files
│   ├── create_dashboard_view.sql
│   └── test_dashboard_queries.sql
├── .env.local               # Environment variables
└── package.json             # Dependencies
```

---

## 🔗 **Useful Development URLs**

- **Dashboard**: http://localhost:3000/dashboard
- **API Health**: http://localhost:3000/api/health (if created)
- **Supabase Dashboard**: https://supabase.com/dashboard/project/gktdkjeflginpvgsndyy

---

## 📝 **Development Notes**

### **Recent Session Progress (Dec 6, 2024)**
- ✅ Fixed directory navigation issue
- ✅ Enhanced dashboard UI with professional components
- ✅ Investigated database schema using Supabase MCP
- ✅ Discovered SQL extraction functions exist (major progress!)
- ✅ Identified missing dashboard view as main blocker
- ✅ Created SQL files to resolve database issues
- ✅ Updated documentation with current status

### **Key Discoveries**
- **SQL Functions Work**: `extract_heatcheck_score()`, `extract_call_outcome()`, etc. are operational
- **Database Structure**: Confirmed tables and relationships match documentation
- **Main Blocker**: Missing view `dashboard_call_data_with_team` needs creation
- **Environment**: Properly configured, just needs view creation for full functionality

---

*Last updated: December 6, 2024* 