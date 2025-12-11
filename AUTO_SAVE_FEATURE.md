# Auto-Save History Feature

## Overview
The Auto-Save History feature allows users to control whether their resume analysis results are automatically saved to the MongoDB database. This gives users flexibility in managing their data persistence.

## How It Works

### 1. User Settings (Frontend)
- Located in: **Settings > Preferences Tab**
- Users can toggle the "Auto-save History" option
- Setting is stored in `localStorage` as `autoSave` (boolean)
- Default: **Enabled** (true)

### 2. Analysis Request Flow

```
User performs analysis
    ↓
Frontend reads autoSave from localStorage
    ↓
Sends autoSave flag with analysis request
    ↓
Backend checks autoSave flag
    ↓
If autoSave = true → Save to MongoDB
If autoSave = false → Return temporary result (not saved)
```

### 3. Implementation Details

#### Frontend (Settings.jsx)
```javascript
// State management
const [autoSave, setAutoSave] = useState(true);

// Save preference
const handleSavePreferences = () => {
  localStorage.setItem('autoSave', autoSave.toString());
  // ...
};
```

#### Frontend (api.js)
```javascript
export const analyzeResume = async (resumeText, jobDescription) => {
  // Read autoSave preference
  const autoSave = localStorage.getItem('autoSave') !== 'false';
  
  const requestBody = {
    resumeText,
    jobDescription,
    autoSave  // Include in request
  };
  
  const response = await api.post('/analyze', requestBody);
  return response.data;
};
```

#### Backend (analysis.controller.js)
```javascript
export const analyzeResume = async (req, res, next) => {
  const { resumeText, jobDescription, autoSave = true } = req.body;
  const userId = req.user._id;
  
  // ... perform analysis ...
  
  let saved = false;
  
  // Only save if autoSave is enabled AND database is connected
  if (autoSave && mongoose.connection.readyState === 1) {
    analysis = await Analysis.create(analysisData);
    saved = true;
    logger.info(`Analysis saved to database: ${analysisId}`);
  } else {
    logger.info('AutoSave disabled - analysis not persisted');
    analysis = { ...analysisData, _id: 'temp-' + Date.now() };
  }
  
  res.json({
    success: true,
    analysisId: analysisId,
    saved: saved,  // Indicates whether saved to DB
    // ... analysis results ...
  });
};
```

## User Experience

### When Auto-Save is ENABLED (Default)
✅ Analysis results are saved to MongoDB database  
✅ User can access history from History page  
✅ Results persist across browser sessions  
✅ Each user has their own separate history  
✅ Can review past analyses anytime  

### When Auto-Save is DISABLED
⚠️ Analysis results are temporary  
⚠️ Results NOT saved to database  
⚠️ History page will not show these analyses  
⚠️ Results lost when page is closed/refreshed  
💡 Useful for quick tests or privacy-sensitive analyses  

## Benefits

### For Users
1. **Privacy Control**: Don't save sensitive analysis results
2. **Storage Management**: Reduce database clutter for test analyses
3. **Flexibility**: Choose what to save on a per-session basis
4. **Transparency**: Clear indication of what's being saved

### For System
1. **Database Efficiency**: Reduces unnecessary storage
2. **User-Specific**: Each user's setting is independent
3. **Logging**: Clear logs indicate when/why data is not saved
4. **Backward Compatible**: Defaults to enabled for existing behavior

## Settings Page Changes

### Removed from Preferences Tab
- ❌ Language selector (not implemented in backend)
- ❌ Notifications toggle (not implemented in backend)

### Kept in Preferences Tab
- ✅ Theme selector (Light/Dark/Auto)
- ✅ Auto-save History toggle

### UI Improvements
- Added info box explaining auto-save behavior
- Clear description: "Automatically save analysis results to your account"
- Updated save success message to mention auto-save applies to next analysis

## Technical Details

### Database Schema
- Analysis documents linked to User via `userId` (ObjectId reference)
- User model has `analysisHistory` array of Analysis references
- Each analysis is user-specific (enforced by authentication middleware)

### Response Format
```json
{
  "success": true,
  "analysisId": "673a1b2c3d4e5f6a7b8c9d0e",
  "saved": true,
  "matchScore": 85,
  "skills": { "matched": [...], "missing": [...] },
  "gaps": [...],
  "recommendations": [...],
  "topTip": "...",
  "createdAt": "2025-12-11T05:45:00.000Z"
}
```

The `saved` field indicates whether the analysis was persisted to the database.

## Testing the Feature

### Test Case 1: Auto-Save Enabled
1. Go to Settings > Preferences
2. Ensure "Auto-save History" is ON (toggle is blue)
3. Click "Save Preferences"
4. Perform a resume analysis
5. Check History page → Analysis should appear
6. Refresh page → Analysis persists

### Test Case 2: Auto-Save Disabled
1. Go to Settings > Preferences
2. Turn OFF "Auto-save History" toggle
3. Click "Save Preferences"
4. Perform a resume analysis
5. Analysis completes successfully
6. Check History page → Analysis does NOT appear
7. Refresh page → Analysis is gone

### Test Case 3: Per-User Independence
1. User A enables auto-save → analyses saved
2. User B disables auto-save → analyses not saved
3. Both users' settings are independent
4. Each user sees only their own saved analyses

## Future Enhancements

Potential improvements:
- Add per-analysis save option (override global setting)
- Export temporary analyses before closing
- Warning when auto-save is disabled
- Session storage fallback for temporary analyses
- Batch delete old analyses

## Logging

Backend logs provide clear visibility:
```
✅ "AutoSave enabled - Analysis saved to database: 673a1b2c..."
⚠️ "AutoSave disabled - analysis not persisted to database"
ℹ️ "Database not connected - returning analysis without persistence"
```

## Summary

The Auto-Save History feature gives users full control over their data persistence while maintaining a seamless user experience. It's user-specific, works independently for each user, and provides clear feedback about what's being saved.

**Key Point**: Each user's auto-save setting is stored in their browser's localStorage and sent with each analysis request, ensuring that the setting works dynamically and independently for each user.
