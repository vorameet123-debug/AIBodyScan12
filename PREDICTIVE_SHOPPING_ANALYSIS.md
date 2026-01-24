# Feature 3: Predictive Shopping Assistant - Analysis & Recommendations

## ✅ **VERDICT: YES, but start with a simplified MVP**

---

## 📊 Current Foundation Assessment

### ✅ What You Already Have:
1. **Purchase Tracking** ✅
   - `FitCheckHistory.purchased` - Boolean flag
   - `FitCheckHistory.purchased_at` - Timestamp
   - `FitCheckHistory.purchase_intent` - "yes", "maybe", "no"
   - Purchase routes exist (`/api/v1/wardrobe/mark-purchased`)

2. **Wardrobe Analytics** ✅
   - `detect_wardrobe_gaps()` - Identifies missing essentials
   - Wardrobe composition analysis
   - Color/style distribution

3. **Rich Data Available** ✅
   - Garment types, colors, styles
   - Fit scores
   - Formality levels
   - Check timestamps

### ❌ What's Missing:
- Purchase pattern detection
- Seasonal predictions
- Event-based predictions
- Notification system
- Prediction storage

---

## 🎯 **Recommended Implementation Strategy**

### **Phase 1: MVP (Start Here) - 2-3 weeks**

#### **1. Simple Gap-Based Predictions** ⭐ HIGHEST PRIORITY
**Why:** Uses existing `detect_wardrobe_gaps()` - minimal new code

**Implementation:**
```python
# integrations/predictive_assistant.py
class PredictiveAssistant:
    def get_shopping_suggestions(self, user_id: int) -> List[Dict]:
        """Get shopping suggestions based on wardrobe gaps"""
        # Use existing wardrobe_analytics.detect_wardrobe_gaps()
        gaps = wardrobe_analytics.detect_wardrobe_gaps(user_id)
        
        suggestions = []
        for gap in gaps:
            suggestions.append({
                'type': 'wardrobe_gap',
                'item': gap['item'],
                'category': gap['category'],
                'reason': gap['reason'],
                'priority': gap['priority'],
                'confidence': 0.8,  # High confidence for gaps
                'suggested_action': f"Consider adding {gap['item']} to complete your {gap['category']} wardrobe"
            })
        return suggestions
```

**API Endpoint:**
```python
GET /api/v1/predictions/shopping/{user_id}
# Returns: List of suggestions with reasons
```

**Frontend:**
- Simple card component showing "You might need: [item]"
- Dismiss button
- Link to fit checker for that item type

---

#### **2. Purchase Pattern Detection** ⭐ HIGH VALUE
**Why:** Uses existing `purchased_at` data - just needs analysis

**Implementation:**
```python
def detect_purchase_patterns(self, user_id: int) -> Dict:
    """Detect average purchase intervals"""
    query = select(FitCheckHistory).where(
        FitCheckHistory.user_id == user_id,
        FitCheckHistory.purchased == True,
        FitCheckHistory.purchased_at.isnot(None)
    ).order_by(FitCheckHistory.purchased_at)
    
    purchases = self.session.exec(query).all()
    
    if len(purchases) < 2:
        return None  # Need at least 2 purchases
    
    # Calculate average days between purchases
    intervals = []
    for i in range(1, len(purchases)):
        days = (purchases[i].purchased_at - purchases[i-1].purchased_at).days
        intervals.append(days)
    
    avg_interval = sum(intervals) / len(intervals)
    last_purchase = purchases[-1].purchased_at
    days_since_last = (datetime.utcnow() - last_purchase).days
    
    # If user typically purchases every X days and it's been X+ days
    if days_since_last >= avg_interval * 0.8:  # 80% of average interval
        return {
            'type': 'purchase_pattern',
            'reason': f'You typically shop every {avg_interval:.0f} days. It\'s been {days_since_last} days since your last purchase.',
            'confidence': 0.6,
            'suggested_action': 'Time for a wardrobe refresh?'
        }
    return None
```

---

#### **3. Wishlist Reminders** ⭐ EASY WIN
**Why:** Uses existing `purchase_intent` field

**Implementation:**
```python
def get_wishlist_reminders(self, user_id: int) -> List[Dict]:
    """Remind users about items they wanted to buy"""
    query = select(FitCheckHistory).where(
        FitCheckHistory.user_id == user_id,
        FitCheckHistory.purchased == False,
        FitCheckHistory.purchase_intent.in_(['yes', 'maybe'])
    ).order_by(FitCheckHistory.checked_at.desc())
    
    wishlist = self.session.exec(query).all()
    reminders = []
    
    for item in wishlist:
        days_old = (datetime.utcnow() - item.checked_at).days
        
        # Remind if item is 7+ days old and still not purchased
        if days_old >= 7:
            reminders.append({
                'type': 'wishlist_reminder',
                'item': item.garment_type,
                'fit_score': item.fit_score,
                'days_old': days_old,
                'reason': f'You showed interest in this {item.garment_type} {days_old} days ago',
                'confidence': 0.7,
                'suggested_action': 'Still interested? Check fit again or purchase now'
            })
    
    return reminders
```

---

### **Phase 2: Enhanced Features - 2-3 weeks**

#### **4. Seasonal Predictions** (Simplified)
**Why:** Simple date-based logic, no weather API needed initially

**Implementation:**
```python
def get_seasonal_suggestions(self, user_id: int) -> List[Dict]:
    """Suggest seasonal items based on current month"""
    current_month = datetime.utcnow().month
    
    # Simple seasonal mapping
    seasonal_items = {
        'winter': ['jacket', 'coat', 'sweater', 'boots'],  # Dec-Feb
        'spring': ['light_jacket', 'raincoat'],  # Mar-May
        'summer': ['shorts', 'tank_top', 'sandals'],  # Jun-Aug
        'fall': ['jacket', 'sweater', 'jeans']  # Sep-Nov
    }
    
    season = self._get_season(current_month)
    needed_items = seasonal_items.get(season, [])
    
    # Check if user has these items
    wardrobe = wardrobe_analytics.get_wardrobe_composition(user_id, 'purchased')
    owned_types = set(wardrobe.get('by_type', {}).keys())
    
    suggestions = []
    for item in needed_items:
        if item not in owned_types:
            suggestions.append({
                'type': 'seasonal',
                'item': item,
                'reason': f'{season.title()} is here! You might need {item}',
                'confidence': 0.7,
                'season': season
            })
    
    return suggestions
```

---

#### **5. Database Model for Predictions**
```python
# Add to fashion_iq_models.py
class UserPrediction(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    prediction_type: str = Field(max_length=50)  # 'wardrobe_gap', 'purchase_pattern', 'wishlist', 'seasonal'
    item_category: Optional[str] = Field(default=None, max_length=50)
    reason: str
    confidence_score: float = Field(default=0.0)  # 0-1
    suggested_action: Optional[str] = Field(default=None)
    dismissed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    expires_at: Optional[datetime] = Field(default=None)  # Auto-expire old predictions
```

---

### **Phase 3: Advanced (Optional) - 4+ weeks**

#### **6. Event-Based Predictions**
- Calendar integration (Google Calendar API)
- Holiday detection
- Special occasions

#### **7. Notification System**
- Email notifications (SendGrid/Mailgun)
- Push notifications (if mobile app)
- In-app notification center

#### **8. Machine Learning Predictions**
- Purchase probability scoring
- Item recommendation engine
- Trend-based suggestions

---

## 🎨 **Frontend Implementation**

### **Simple MVP Component:**
```typescript
// PredictiveAlerts.tsx
interface Prediction {
  type: string;
  item?: string;
  reason: string;
  confidence: number;
  suggested_action?: string;
}

export const PredictiveAlerts: React.FC<{ userId: number }> = ({ userId }) => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  
  useEffect(() => {
    fetchPredictions();
  }, [userId]);
  
  const fetchPredictions = async () => {
    const response = await axios.get(`/api/v1/predictions/shopping/${userId}`);
    setPredictions(response.data.predictions);
  };
  
  const dismissPrediction = async (predictionId: number) => {
    await axios.post(`/api/v1/predictions/dismiss/${predictionId}`);
    fetchPredictions(); // Refresh
  };
  
  if (predictions.length === 0) return null;
  
  return (
    <div className="space-y-3">
      {predictions.map((pred, idx) => (
        <motion.div
          key={idx}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-blue-900">{pred.reason}</h4>
              {pred.suggested_action && (
                <p className="text-sm text-blue-700 mt-1">{pred.suggested_action}</p>
              )}
              <div className="mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {Math.round(pred.confidence * 100)}% confidence
                </span>
              </div>
            </div>
            <button
              onClick={() => dismissPrediction(pred.id)}
              className="text-blue-600 hover:text-blue-800"
            >
              ✕
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
```

---

## 📋 **Implementation Checklist**

### **Week 1: Backend Foundation**
- [ ] Create `predictive_assistant.py` service
- [ ] Add `UserPrediction` model to `fashion_iq_models.py`
- [ ] Implement gap-based predictions (use existing `detect_wardrobe_gaps()`)
- [ ] Implement wishlist reminders
- [ ] Create API endpoint: `GET /api/v1/predictions/shopping/{user_id}`

### **Week 2: Purchase Patterns**
- [ ] Implement purchase pattern detection
- [ ] Add seasonal predictions (simplified)
- [ ] Create dismiss endpoint: `POST /api/v1/predictions/dismiss/{prediction_id}`
- [ ] Add prediction expiration logic

### **Week 3: Frontend**
- [ ] Create `PredictiveAlerts.tsx` component
- [ ] Add to dashboard as widget
- [ ] Implement dismiss functionality
- [ ] Add notification badge (optional)

---

## 💡 **Key Suggestions**

### **1. Start Simple**
- Don't build complex ML models initially
- Use rule-based predictions (gaps, patterns, seasons)
- Can enhance later with ML

### **2. Make It Opt-In**
- Let users enable/disable predictions
- Allow them to choose notification frequency
- Respect user preferences

### **3. Focus on Value**
- Prioritize high-confidence predictions
- Show only 3-5 suggestions at a time
- Don't overwhelm users

### **4. Track Effectiveness**
- Measure: How many predictions lead to purchases?
- A/B test different prediction types
- Iterate based on user feedback

### **5. Integration Points**
- Link predictions to fit checker
- Suggest specific items from wishlist
- Show predictions in wardrobe analytics page

---

## 🚀 **Quick Start (This Week)**

**Minimum Viable Feature (2-3 days):**

1. **Backend (1 day):**
   ```python
   # integrations/predictive_assistant.py
   class PredictiveAssistant:
       def get_shopping_suggestions(self, user_id: int):
           # Just use existing wardrobe_analytics.detect_wardrobe_gaps()
           gaps = wardrobe_analytics.detect_wardrobe_gaps(user_id)
           return [{'type': 'gap', 'item': g['item'], 'reason': g['reason']} 
                   for g in gaps]
   ```

2. **API (1 day):**
   ```python
   @app.get("/api/v1/predictions/shopping/{user_id}")
   async def get_predictions(user_id: int):
       assistant = PredictiveAssistant(session)
       return {"predictions": assistant.get_shopping_suggestions(user_id)}
   ```

3. **Frontend (1 day):**
   - Simple card showing gaps
   - Add to dashboard

**This gives you 80% of the value with 20% of the effort!**

---

## ⚠️ **Things to Avoid**

1. **Don't over-engineer** - Start with simple rules
2. **Don't spam users** - Limit to 3-5 predictions max
3. **Don't ignore data quality** - Only show high-confidence predictions
4. **Don't forget opt-out** - Always let users disable

---

## 📊 **Success Metrics**

Track these to measure success:
- **Engagement:** % of users viewing predictions
- **Conversion:** % of predictions leading to fit checks
- **Purchase Rate:** % of predictions leading to purchases
- **Dismiss Rate:** % of predictions dismissed (if too high, adjust)

---

## ✅ **Final Recommendation**

**YES, implement Feature 3, but:**

1. **Start with MVP** (gaps + wishlist reminders) - 1 week
2. **Add purchase patterns** - 1 week  
3. **Add seasonal** - 1 week
4. **Polish & test** - 1 week

**Total: 4 weeks for a solid predictive assistant**

This feature will:
- ✅ Increase user engagement
- ✅ Differentiate your platform
- ✅ Provide real value to users
- ✅ Use existing data effectively
- ✅ Be relatively simple to implement

**Start this week with the gap-based predictions - it's the easiest win!** 🎯
