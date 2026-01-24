# Fashion IQ - Quick Integration Guide

## Step 1: Add to App.tsx

**File**: `d:\3Dmodel\website\src\App.tsx`

**1. Add import** (line 11, after ClothingFitChecker import):
```typescript
import { FashionIQPage } from './components/FashionIQPage';
```

**2. Add route** (line 175, after /fit-checker route):
```typescript
<Route
  path="/fashion-iq"
  element={
    <ProtectedRoute>
      <MainLayout onLogout={handleLogout}>
        <FashionIQPage />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

## Step 2: Add to Navigation.tsx

**File**: `d:\3Dmodel\website\src\components\Navigation.tsx`

Add this link in your navigation menu:
```typescript
<Link to="/fashion-iq" className="nav-link">
  Fashion IQ
</Link>
```

## Step 3: Test

1. Save both files
2. Frontend should auto-reload
3. You should see "Fashion IQ" link in navigation
4. Click it to view your Fashion IQ dashboard

## Quick Test URL

After adding the route, you can directly visit:
`http://localhost:3000/fashion-iq`
