# Trend Dashboard - How It Works

## 📊 **Complete System Overview**

The Trend Dashboard is a **dual-source trend intelligence system** that combines:
1. **Internal Trends** - Based on your platform's actual fit check data
2. **External Trends** - AI-analyzed fashion trends from Groq API

---

## 🔄 **Data Flow Architecture**

```
User Fit Check
    ↓
Fit Check History Saved (with is_trending flag)
    ↓
Trend Analyzer Processes Data
    ↓
API Endpoints Serve Trend Data
    ↓
Frontend Dashboard Displays Trends
```

---

## 🎯 **1. INTERNAL TREND DETECTION (Platform Data)**

### **How It Works:**

#### **Step 1: Fit Check Triggers Trend Check**
When a user performs a fit check:
- **File**: `api/fit_check_history_helper.py`
- **Function**: `save_fit_check_history()`

```python
# Line 27-37: Check if item is trending
is_trending = False
try:
    from integrations.trend_analyzer import TrendAnalyzer
    trend_analyzer = TrendAnalyzer(session)
    garment_type = garment_analysis.get("garment_type", "unknown")
    if garment_type != "unknown":
        is_trending = trend_analyzer.is_item_trending(garment_type, days=7)
```

**What happens:**
1. User checks a garment (e.g., "shirt")
2. System checks if "shirt" is trending
3. Saves `is_trending=True/False` in `FitCheckHistory` table

---

#### **Step 2: Trend Detection Algorithm**
**File**: `integrations/trend_analyzer.py`
**Function**: `is_item_trending()` (Line 21-70)

**Algorithm:**
```python
1. Get current period checks (last 7 days)
   - Count how many times "shirt" was checked

2. Get previous period checks (7-14 days ago)
   - Count how many times "shirt" was checked

3. Calculate Velocity:
   velocity = ((current_count - previous_count) / previous_count) * 100

4. Determine if Trending:
   - If velocity >= 20% → TRENDING
   - If previous_count == 0 and current_count >= 3 → NEW TREND
```

**Example:**
- Last 7 days: 15 shirt checks
- Previous 7 days: 10 shirt checks
- Velocity: ((15-10)/10) * 100 = **50%** → **TRENDING!** ✅

---

#### **Step 3: Detect All Trending Items**
**Function**: `detect_trending_items()` (Line 72-130)

**Process:**
1. Get ALL garment types checked in current period
2. For each garment type:
   - Calculate velocity
   - If velocity >= threshold (20%), add to trending list
3. Sort by velocity (highest first)
4. Return list of trending items

**Returns:**
```json
[
  {
    "item": "shirt",
    "current_checks": 15,
    "previous_checks": 10,
    "velocity": 50.0,
    "trend": "rising",
    "change": 5
  },
  {
    "item": "pants",
    "current_checks": 8,
    "previous_checks": 12,
    "velocity": -33.3,
    "trend": "falling",
    "change": -4
  }
]
```

---

#### **Step 4: User Trend Alignment**
**Function**: `calculate_trend_alignment()` (Line 200-250)

**How it works:**
1. Get current trending items (from Step 3)
2. Get user's recent checks (last 30 days)
3. Calculate alignment:
   ```
   alignment_score = (trending_items_user_checked / total_trending_items) * 100
   ```

**Example:**
- Trending items: ["shirt", "jacket", "dress", "pants", "shoes"]
- User checked: ["shirt", "jacket", "dress"]
- Alignment: (3/5) * 100 = **60% aligned** ✅

**Returns:**
```json
{
  "alignment_score": 60.0,
  "trending_items_checked": ["shirt", "jacket", "dress"],
  "trending_items_missed": ["pants", "shoes"],
  "total_trending": 5,
  "user_checked": 3
}
```

---

#### **Step 5: Style & Color Trends**
**Function**: `detect_style_trends()` (Line 150-190)

**Process:**
1. Get all fit checks in last 30 days
2. Count styles: `Counter(c.style for c in checks)`
3. Count colors: `Counter(c.color for c in checks)`
4. Return top 5 styles and colors

**Returns:**
```json
{
  "trending_styles": {
    "casual": 45,
    "formal": 30,
    "streetwear": 25
  },
  "trending_colors": {
    "black": 50,
    "white": 35,
    "blue": 20
  },
  "total_checks": 100
}
```

---

#### **Step 6: Trend Forecast**
**Function**: `forecast_trends()` (Line 280-302)

**Algorithm:**
1. Get current trends (last 7 days)
2. Get previous trends (7-14 days ago)
3. Calculate acceleration:
   ```
   acceleration = current_velocity - previous_velocity
   ```
4. If acceleration > 10% → "Rising"
5. If acceleration < -10% → "Falling"

**Example:**
- Shirt: current_velocity=50%, previous_velocity=30%
- Acceleration: 50% - 30% = **+20%** → **RISING** 📈

---

## 🌐 **2. EXTERNAL TREND ANALYSIS (Groq AI)**

### **How It Works:**

#### **Step 1: Trigger External Analysis**
**File**: `integrations/external_trend_analyzer.py`
**Function**: `analyze_fashion_trends()` (Line 34-170)

**Process:**
1. User calls API: `POST /api/v1/trends/analyze-external`
2. System sends prompt to Groq AI (Llama 3.3 70B)
3. AI analyzes current fashion trends from:
   - Social media (Instagram, TikTok)
   - Fashion blogs
   - Runway shows
4. AI returns structured JSON with trends

**Groq AI Prompt:**
```
Analyze current fashion trends and identify:
1. Trending Garment Types (e.g., oversized blazers)
2. Trending Colors (e.g., sage green)
3. Trending Styles (e.g., minimalist, Y2K)
4. Trending Patterns (e.g., checkerboard)
5. Trending Materials (e.g., linen)
```

**AI Response:**
```json
{
  "trending_items": [
    {
      "item": "oversized blazer",
      "description": "Making a comeback in 2024",
      "popularity_score": 85,
      "trend_direction": "rising"
    }
  ],
  "trending_colors": [
    {
      "color": "sage green",
      "hex": "#87AE73",
      "popularity_score": 80
    }
  ],
  "confidence": 0.85
}
```

---

#### **Step 2: Store External Trends**
**File**: `api/trend_routes.py`
**Function**: `analyze_external_trends()` (Line 127-210)

**Process:**
1. Receive AI-analyzed trends
2. Store each trend in `ExternalTrend` table:
   - `trend_type`: "item", "color", "style", etc.
   - `trend_name`: "oversized blazer"
   - `popularity_score`: 85
   - `trend_direction`: "rising"
   - `source`: "groq_ai"
   - `expires_at`: 30 days from now

**Database Storage:**
```python
trend = ExternalTrend(
    trend_type="item",
    trend_name="oversized blazer",
    trend_data={...},
    popularity_score=85,
    trend_direction="rising",
    source="groq_ai",
    expires_at=datetime.utcnow() + timedelta(days=30)
)
```

---

#### **Step 3: Retrieve External Trends**
**Function**: `get_external_trends()` (Line 304-360)

**Process:**
1. Query `ExternalTrend` table
2. Filter by `is_active=True` and `created_at >= cutoff`
3. Group by `trend_type` (item, color, style, etc.)
4. Return organized trends

---

#### **Step 4: Combine Internal + External**
**Function**: `get_combined_trends()` (Line 374-410)

**Process:**
1. Get internal trends (platform data)
2. Get external trends (AI analysis)
3. Generate insights:
   - Find matches: Items trending both internally AND externally
   - Find gaps: External trends not yet checked on platform

**Returns:**
```json
{
  "internal_trends": {
    "trending_items": [...],
    "source": "platform_data"
  },
  "external_trends": {
    "trending_items": [...],
    "source": "external_ai"
  },
  "combined_insights": [
    "🔥 3 items are trending both on our platform AND externally: shirt, jacket, dress",
    "💡 2 trending items haven't been checked yet on our platform"
  ]
}
```

---

## 🌐 **3. API ENDPOINTS**

### **Available Endpoints:**

#### **1. GET `/api/v1/trends/current`**
- **Purpose**: Get trending items from platform data
- **Parameters**: `days` (default: 7), `min_velocity` (default: 20.0)
- **Returns**: List of trending items with velocity

#### **2. GET `/api/v1/trends/user-alignment/{user_id}`**
- **Purpose**: Calculate user's alignment with trends
- **Parameters**: `days` (default: 7)
- **Returns**: Alignment score, checked items, missed items

#### **3. GET `/api/v1/trends/styles`**
- **Purpose**: Get trending styles and colors
- **Parameters**: `days` (default: 30)
- **Returns**: Top styles and colors

#### **4. GET `/api/v1/trends/forecast`**
- **Purpose**: Forecast future trends
- **Parameters**: `days` (default: 7)
- **Returns**: Items with acceleration predictions

#### **5. GET `/api/v1/trends/external`**
- **Purpose**: Get AI-analyzed external trends
- **Parameters**: `days` (default: 7)
- **Returns**: External trends from database

#### **6. GET `/api/v1/trends/combined`**
- **Purpose**: Get combined internal + external trends
- **Parameters**: `days` (default: 7)
- **Returns**: Both sources with insights

#### **7. POST `/api/v1/trends/analyze-external`**
- **Purpose**: Trigger new external trend analysis
- **Parameters**: `season` (optional), `category` (optional)
- **Returns**: Analyzed trends and stored count

---

## 🎨 **4. FRONTEND DASHBOARD**

### **Component Structure:**

#### **File**: `website/src/components/TrendDashboard.tsx`

#### **Data Loading (Line 19-53):**
```typescript
useEffect(() => {
    loadTrendData();
}, [userId, days]);

const loadTrendData = async () => {
    // Load all data in parallel
    const [trendsRes, alignmentRes, stylesRes, forecastRes] = await Promise.all([
        TrendAPI.getCurrentTrends(days),           // Internal trends
        TrendAPI.getUserAlignment(userId, days),   // User alignment
        TrendAPI.getStyleTrends(30),               // Style/color trends
        TrendAPI.getTrendForecast(days)            // Forecasts
    ]);
    
    // Update state
    setTrendingItems(trendsRes.trends);
    setAlignment(alignmentRes.alignment);
    setStyleTrends(stylesRes.style_trends);
    setForecasts(forecastRes.forecasts);
};
```

#### **UI Sections:**

**1. Period Selector (Line 90-100)**
- Dropdown: 7/14/30 days
- Updates all data when changed

**2. User Alignment Card (Line 102-150)**
- Shows alignment score (0-100%)
- Displays trending items checked vs missed
- Color-coded: Green (70%+), Yellow (40-70%), Red (<40%)

**3. Trending Items List (Line 152-190)**
- Shows all trending items
- Displays velocity percentage
- Trend icons: ↑ (rising), ↓ (falling), → (stable)

**4. Style & Color Trends (Line 192-240)**
- Two columns: Styles and Colors
- Shows top 5 with check counts

**5. Trend Forecast (Line 242-280)**
- Shows items with acceleration
- Indicates "Rising" or "Falling"
- Confidence score

---

## 🔄 **Complete User Journey**

### **Scenario: User Checks a Shirt**

1. **User performs fit check:**
   - Uploads shirt image
   - System analyzes fit

2. **System saves fit check:**
   - `save_fit_check_history()` called
   - Checks if "shirt" is trending
   - Calculates: Last 7 days = 15 checks, Previous = 10 checks
   - Velocity = 50% → **TRENDING!**
   - Saves `is_trending=True` in database

3. **Fashion IQ updates:**
   - Recalculates trend awareness score
   - User's trend alignment improves

4. **Dashboard updates:**
   - User visits `/trends` page
   - Dashboard loads:
     - Current trends (shirt now appears)
     - User alignment (increases)
     - Style trends (updated)

5. **User sees:**
   - "Shirt" in trending items list
   - "You're 75% aligned with trends!"
   - "You checked 3 of 5 trending items"

---

## 🎯 **Key Features**

### **1. Real-Time Trend Detection**
- Trends calculated from actual user behavior
- Updates automatically as users check items
- No manual curation needed

### **2. Velocity-Based Algorithm**
- Compares current period vs previous period
- 20%+ increase = trending
- Accounts for new trends (3+ checks with no previous data)

### **3. User Alignment Score**
- Gamification element
- Shows how "trendy" user is
- Encourages checking trending items

### **4. External AI Analysis**
- Groq AI analyzes fashion trends
- Stored in database for fast retrieval
- Can be updated weekly/daily

### **5. Combined Intelligence**
- Matches internal vs external trends
- Shows what's trending both on platform AND externally
- Identifies gaps (external trends not yet checked)

### **6. Trend Forecasting**
- Acceleration-based predictions
- Shows which items are rising/falling
- Confidence scores

---

## 📊 **Data Sources**

### **Internal (Platform Data):**
- `FitCheckHistory` table
- Real user fit checks
- Actual behavior data

### **External (AI Analysis):**
- `ExternalTrend` table
- Groq AI analysis
- Fashion industry trends

---

## 🔧 **Configuration**

### **Trend Detection Thresholds:**
- **Default velocity threshold**: 20%
- **Default analysis period**: 7 days
- **New trend threshold**: 3+ checks with no previous data

### **External Trends:**
- **Model**: Llama 3.3 70B Versatile
- **Expiration**: 30 days
- **Update frequency**: Manual (via API) or scheduled

---

## 🚀 **Performance Optimizations**

1. **Parallel API Calls**: Frontend loads all data simultaneously
2. **Database Indexing**: `checked_at` and `is_trending` indexed
3. **Caching**: External trends stored in database (no repeated AI calls)
4. **Lazy Loading**: Trend analysis only when needed

---

## 📈 **Future Enhancements**

1. **Scheduled Jobs**: Auto-update external trends daily
2. **Regional Trends**: Trends by location
3. **Seasonal Patterns**: Detect seasonal trends
4. **ML Predictions**: More sophisticated forecasting
5. **Real-time Updates**: WebSocket for live trend updates

---

## 🎓 **Summary**

The Trend Dashboard is a **dual-source intelligence system** that:
- ✅ Analyzes your platform's actual user behavior
- ✅ Integrates AI-analyzed external fashion trends
- ✅ Calculates user alignment with trends
- ✅ Forecasts future trends
- ✅ Provides actionable insights

**It's like having a fashion trend analyst that watches both your users AND the entire fashion industry!** 🎯
