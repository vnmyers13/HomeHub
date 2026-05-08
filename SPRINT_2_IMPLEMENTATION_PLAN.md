# Sprint 2 Implementation Plan

## Overview
**Sprint Goal:** Family can create accounts, log in with PIN or password, admin can manage members

**Status:** Foundation complete (auth models created), ready for implementation

**Estimated Time:** 6-8 hours for complete implementation

---

## Task Breakdown

### T2.1: Database Migration (BLOCKER) ⚠️
**Status:** Models created, migration pending  
**Estimated Time:** 30 minutes  
**Dependencies:** None (Sprint 1 complete)

#### Current Blocker
Database path configuration issue for local development:
- Current: `sqlite+aiosqlite:///../data/db/homehub.db`
- Issue: Path resolution from `backend/` directory
- Solution: Create `data/db/` directory or adjust path

#### Steps
1. **Fix database path** (5 min)
   - Option A: Create `../data/db/` directory structure
   - Option B: Use absolute path for local dev
   - Option C: Use relative path from backend: `sqlite+aiosqlite:///../../data/db/homehub.db`

2. **Generate migration** (5 min)
   ```bash
   cd backend
   source .venv/bin/activate
   alembic revision --autogenerate -m "001_initial_schema"
   ```

3. **Review migration file** (10 min)
   - Check generated migration in `backend/alembic/versions/`
   - Verify tables: families, users, sessions
   - Verify columns match model specifications
   - Verify foreign keys and indexes

4. **Run migration** (5 min)
   ```bash
   alembic upgrade head
   ```

5. **Test migration roundtrip** (5 min)
   ```bash
   alembic downgrade -1
   alembic upgrade head
   ```

#### Acceptance Criteria
- [ ] `sqlite3 data/db/homehub.db '.tables'` shows families, users, sessions
- [ ] Migration roundtrip succeeds
- [ ] venv is active and verified

---

### T2.2: Auth API (BLOCKER) ⚠️
**Status:** Not started  
**Estimated Time:** 2-3 hours  
**Dependencies:** T2.1 complete

#### Files to Create

##### 1. `backend/app/schemas/__init__.py` (1 min)
Empty file for package initialization.

##### 2. `backend/app/schemas/auth.py` (30 min)
Pydantic models for auth endpoints:

```python
from pydantic import BaseModel, Field, ConfigDict

class SetupRequest(BaseModel):
    family_name: str = Field(min_length=1, max_length=200)
    timezone: str
    admin_display_name: str = Field(min_length=1, max_length=100)
    admin_password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    display_name: str
    password: str

class PinLoginRequest(BaseModel):
    user_id: str
    pin: str = Field(min_length=4, max_length=8)

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    display_name: str
    role: str
    color_hex: str
    ui_mode: str
    avatar_type: str
    avatar_value: str
    family_id: str

class SetupStatusResponse(BaseModel):
    setup_complete: bool
```

##### 3. `backend/app/routers/__init__.py` (1 min)
Empty file for package initialization.

##### 4. `backend/app/routers/auth.py` (1.5 hours)
Auth router with 5 endpoints:

**Key Implementation Details:**
- Use `get_current_user` dependency from `core.security`
- Hash passwords with `hash_password()` from `core.security`
- Verify passwords with `verify_password()` from `core.security`
- Create JWT tokens with `create_access_token()` from `core.security`
- Set httpOnly, SameSite=Strict, secure=True cookies
- Cookie max_age=2592000 (30 days)
- Case-insensitive display_name lookup: `lower(display_name)`
- PIN rate limiting: `check_pin_rate_limit(user_id)` from `core.security`
- Update `last_login_at` on successful login

**Endpoints:**
1. `GET /api/auth/setup/status` - Check if family exists
2. `POST /api/auth/setup` - Create family and admin user
3. `POST /api/auth/login` - Password login
4. `POST /api/auth/login/pin` - PIN login with rate limiting
5. `POST /api/auth/logout` - Clear cookie
6. `GET /api/auth/me` - Get current user (requires auth)

##### 5. Update `backend/app/main.py` (5 min)
```python
from app.routers import auth

app.include_router(auth.router)
```

#### Testing Strategy
1. **Manual API testing with curl:**
   ```bash
   # Setup
   curl -sk -X POST https://homehub.local/api/auth/setup \
     -H 'Content-Type: application/json' \
     -d '{"family_name":"Test","timezone":"UTC","admin_display_name":"Admin","admin_password":"password123"}'
   
   # Status check
   curl -sk https://homehub.local/api/auth/setup/status
   
   # Login
   curl -sk -X POST https://homehub.local/api/auth/login \
     -H 'Content-Type: application/json' \
     -d '{"display_name":"Admin","password":"password123"}'
   ```

2. **Database verification:**
   ```bash
   sqlite3 data/db/homehub.db "SELECT * FROM families;"
   sqlite3 data/db/homehub.db "SELECT id, display_name, role FROM users;"
   ```

#### Acceptance Criteria
- [ ] Setup endpoint creates family and admin user
- [ ] Setup status returns `setup_complete: true` after setup
- [ ] Login endpoint returns UserResponse with cookie
- [ ] PIN login enforces rate limiting (5 attempts per 60s)
- [ ] Logout clears cookie
- [ ] /me endpoint returns current user when authenticated

---

### T2.3: Users API
**Status:** Not started  
**Estimated Time:** 2 hours  
**Dependencies:** T2.2 complete

#### Files to Create

##### 1. `backend/app/services/__init__.py` (1 min)
Empty file for package initialization.

##### 2. `backend/app/services/users.py` (45 min)
Avatar thumbnail generation service:

```python
import asyncio
from pathlib import Path
from PIL import Image

async def generate_thumbnail(
    source_path: str,
    dest_path: str,
    size: tuple[int, int] = (96, 96)
) -> None:
    """Generate thumbnail from image file."""
    def _generate():
        img = Image.open(source_path)
        img.thumbnail(size, Image.Resampling.LANCZOS)
        img.save(dest_path, "JPEG", quality=85)
    
    await asyncio.to_thread(_generate)
```

**Note:** Add pillow-heif support if needed for HEIC images.

##### 3. `backend/app/schemas/users.py` (30 min)
User CRUD schemas:

```python
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class PublicUserResponse(BaseModel):
    """Public user info for login screen."""
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    display_name: str
    avatar_type: str
    avatar_value: str
    color_hex: str

class CreateUserRequest(BaseModel):
    display_name: str = Field(min_length=1, max_length=100)
    role: str  # admin, co_admin, teen, child, guest
    color_hex: str = "#4F46E5"
    ui_mode: str = "standard"
    avatar_type: str = "emoji"
    avatar_value: str = "👤"
    pin: Optional[str] = None
    password: Optional[str] = None

class PatchUserRequest(BaseModel):
    display_name: Optional[str] = None
    role: Optional[str] = None
    color_hex: Optional[str] = None
    ui_mode: Optional[str] = None
    avatar_type: Optional[str] = None
    avatar_value: Optional[str] = None
    pin: Optional[str] = None
    password: Optional[str] = None
```

##### 4. `backend/app/routers/users.py` (45 min)
Users CRUD router:

**Endpoints:**
1. `GET /api/users/public` - No auth, returns PublicUserResponse list
2. `GET /api/users` - Requires auth, returns full UserResponse list
3. `POST /api/users` - Requires admin/co_admin role
4. `PATCH /api/users/{id}` - Own profile OR admin
5. `DELETE /api/users/{id}` - Admin only, soft delete (is_deleted=True)
6. `POST /api/users/{id}/avatar` - Upload avatar image

**Key Implementation Details:**
- Never return `pin_hash` or `password_hash` in responses
- Avatar upload: Save to `/data/photos/avatars/{user_id}.jpg`
- Generate thumbnail: `/data/photos/avatars/{user_id}_thumb.jpg` at 96x96
- Return avatar URL: `/photos/avatars/{user_id}_thumb.jpg`
- Cannot delete self (raise 400)
- Use `require_role` dependency for role checks

##### 5. Update `backend/app/main.py` (5 min)
```python
from app.routers import auth, users

app.include_router(auth.router)
app.include_router(users.router)
```

#### Acceptance Criteria
- [ ] Public users endpoint returns list without sensitive fields
- [ ] Create user endpoint requires admin role
- [ ] Avatar upload creates thumbnail
- [ ] Cannot delete own account
- [ ] Soft delete sets is_deleted=True

---

### T2.4: Frontend Pages (BLOCKER) ⚠️
**Status:** Not started  
**Estimated Time:** 2-3 hours  
**Dependencies:** T2.2, T2.3 complete

#### Files to Create

##### 1. `frontend/src/api/auth.ts` (30 min)
TanStack Query hooks:

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from './client';

export const useSetupStatus = () => {
  return useQuery({
    queryKey: ['setup-status'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/auth/setup/status');
      return data;
    },
  });
};

export const useSetup = () => {
  return useMutation({
    mutationFn: async (setupData) => {
      const { data } = await apiClient.post('/api/auth/setup', setupData);
      return data;
    },
  });
};

// Similar hooks for: useLogin, usePinLogin, useLogout, useMe, usePublicUsers
```

##### 2. `frontend/src/pages/SetupWizard.tsx` (1 hour)
Three-step setup wizard:

**Step 1:** Family name + timezone selector
- Use `Intl.supportedValuesOf('timeZone')` for timezone list
- Searchable combobox (shadcn Select)

**Step 2:** Admin credentials
- Display name input
- Password input (min 8 chars)
- Confirm password (must match)

**Step 3:** Summary + submit
- Show entered values
- Submit button calls `useSetup` mutation
- On success: navigate to `/dashboard`

##### 3. `frontend/src/pages/Login.tsx` (1 hour)
User selection + PIN/password entry:

**User Grid:**
- Load users via `usePublicUsers`
- Display avatar cards (120x120px minimum)
- Show avatar (emoji or image) + display_name

**PIN Pad:**
- Custom 3x3 grid + 0 + backspace
- Build PIN string digit by digit
- Auto-submit when 4-8 chars entered
- Show attempt counter on 429 response

**Password Input:**
- Text input + submit button
- Call `useLogin` mutation

##### 4. `frontend/src/pages/admin/ManageUsers.tsx` (45 min)
User management interface:

**Features:**
- List family members with role badges
- Add member button opens Sheet (shadcn)
- Edit member (same Sheet, pre-filled)
- Delete member (confirmation Dialog)
- Form fields: display_name, role, color_hex, ui_mode, PIN, password

**Access Control:**
- Redirect to `/dashboard` if not admin/co_admin

##### 5. `frontend/src/components/OfflineBanner.tsx` (15 min)
Offline detection banner:

```typescript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);
  
  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

if (isOnline) return null;

return (
  <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-2 text-center z-50">
    You are offline - showing saved data
  </div>
);
```

##### 6. `frontend/src/components/InstallPrompt.tsx` (30 min)
PWA install prompt:

**Features:**
- Capture `beforeinstallprompt` event
- Show install button when available
- iOS Safari detection + instructions
- Store `ios-install-shown` in localStorage
- Dismissible prompts

#### Acceptance Criteria
- [ ] Navigate to https://homehub.local redirects to /setup
- [ ] Complete 3-step setup lands on /dashboard
- [ ] Login page shows family member cards
- [ ] PIN pad works without number input
- [ ] Wrong PIN 5 times shows lockout message
- [ ] Manage users page requires admin role
- [ ] Offline banner appears when offline

---

## Implementation Order

### Phase 1: Backend Foundation (2-3 hours)
1. Fix database path issue
2. Generate and run migration (T2.1)
3. Create auth schemas and router (T2.2)
4. Test auth endpoints with curl
5. Create user service and router (T2.3)
6. Test users endpoints

### Phase 2: Frontend Implementation (2-3 hours)
1. Create auth API hooks
2. Build SetupWizard page
3. Build Login page with PIN pad
4. Build ManageUsers page
5. Add OfflineBanner component
6. Add InstallPrompt component

### Phase 3: Integration Testing (1 hour)
1. Test complete setup flow
2. Test login with password
3. Test login with PIN
4. Test user management
5. Test offline behavior
6. Test PWA install prompt

### Phase 4: Documentation & Commit (30 min)
1. Update Memory Bank
2. Update CHANGELOG.md
3. Commit Sprint 2 completion
4. Push to GitHub

---

## Known Issues & Solutions

### Issue 1: Database Path
**Problem:** Local migration fails due to path resolution  
**Solution:** Create `data/db/` directory or use absolute path

### Issue 2: Python 3.14 Compatibility
**Problem:** SQLAlchemy 2.0.36 has typing issues with Python 3.14  
**Solution:** ✅ Resolved - Using Python 3.12

### Issue 3: Cookie Security
**Problem:** Cookies require HTTPS  
**Solution:** ✅ Caddy provides TLS via `tls internal`

---

## Success Criteria

Sprint 2 is complete when:
- [ ] All 4 tasks (T2.1-T2.4) completed
- [ ] All blocker tasks verified with acceptance checks
- [ ] Sprint goal achieved: "Family can create accounts, log in with PIN or password, admin can manage members"
- [ ] All acceptance checks pass
- [ ] Documentation updated
- [ ] Changes committed to GitHub

---

## Next Steps After Sprint 2

Once Sprint 2 is complete, the project will be ready for:
- **Sprint 3:** Calendar Core (events, recurrence, ICS feeds)
- **Sprint 4:** Device Integration
- **Sprint 5:** Scheduling & Automation
- **Sprint 6:** Photos & Polish

---

## Estimated Total Time: 6-8 hours

- T2.1: 30 minutes
- T2.2: 2-3 hours
- T2.3: 2 hours
- T2.4: 2-3 hours
- Testing & Documentation: 1.5 hours
