# StayEase — Technical Design Document

> Version 2.0 — Updated to include Hotel Comparison Feature

---

## 1. Architecture Overview

StayEase follows a classic **three-tier architecture**:

```
┌─────────────────────────────────────────────────┐
│              Browser (React + Vite)              │  Port 5173
│  Pages, Components, Context, API layer (Axios)   │
└──────────────────────────┬──────────────────────┘
                           │ HTTP (JSON)
                           │ Vite dev proxy → :8080
┌──────────────────────────▼──────────────────────┐
│          Spring Boot REST API                    │  Port 8080
│  Controllers → Services → Repositories           │
└──────────────────────────┬──────────────────────┘
                           │ JDBC (HikariCP)
┌──────────────────────────▼──────────────────────┐
│                  MySQL 8                         │  Port 3306
│  stayease database — Hotels, Rooms, Bookings     │
└─────────────────────────────────────────────────┘
```

**CORS:** `CorsConfig.java` allows `http://localhost:5173` during development.  
**Dev proxy:** `vite.config.js` proxies `/api/*` to `http://localhost:8080` so the browser only speaks to port 5173.

---

## 2. Database Design

### Entity Relationship Diagram

```
HOTELS ──< HOTEL_AMENITIES
  │
  └──< ROOMS ──< BOOKINGS
```

### Tables

#### `HOTELS`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Auto-increment |
| name | VARCHAR(255) | Not null |
| city | VARCHAR(100) | Not null, indexed for search |
| address | VARCHAR(500) | |
| description | TEXT | |
| star_rating | DECIMAL(2,1) | 1.0 – 5.0 |
| image_url | VARCHAR(500) | External image URL |

#### `HOTEL_AMENITIES`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| hotel_id | BIGINT FK | → HOTELS.id |
| amenity_name | VARCHAR(100) | e.g. "Free WiFi", "Pool" |

#### `ROOMS`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| hotel_id | BIGINT FK | → HOTELS.id |
| category | VARCHAR(100) | e.g. "Deluxe Room" |
| description | TEXT | |
| price_per_night | DECIMAL(10,2) | |
| total_rooms | INT | Physical room count |

#### `BOOKINGS`
| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| room_id | BIGINT FK | → ROOMS.id |
| reference_id | VARCHAR(36) | UUID, unique |
| guest_name | VARCHAR(255) | |
| guest_email | VARCHAR(255) | |
| guest_phone | VARCHAR(20) | |
| check_in_date | DATE | |
| check_out_date | DATE | |
| total_price | DECIMAL(10,2) | Computed at booking time |
| status | ENUM | CONFIRMED / CANCELLED |

---

## 3. Backend Design

### 3.1 Package Structure

```
com.stayease
├── config         — CORS, data seeding
├── controller     — REST endpoints (HotelController, BookingController)
├── dto            — Request/response DTOs (no domain leakage)
├── entity         — JPA entities (plain Java — no Lombok)
├── exception      — Custom exceptions + GlobalExceptionHandler
├── repository     — Spring Data JPA + custom JPQL queries
└── service        — Business logic (HotelService, BookingService)
```

### 3.2 API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/hotels` | List hotels, optional `?city=` filter |
| GET | `/api/hotels/{id}` | Hotel detail with amenities |
| GET | `/api/hotels/{id}/rooms` | Rooms with optional `?checkIn=&checkOut=` |
| GET | `/api/hotels/{id}/rooms/{roomId}` | Single room + availability |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/{ref}` | Get booking by reference ID |
| PATCH | `/api/bookings/{ref}/cancel` | Cancel a booking |

### 3.3 Key Design Decisions

#### No Lombok in Entities
Lombok was initially included but caused `cannot find symbol` compilation errors due to annotation processor issues with JDK 25. All entity classes use **explicit getters and setters**.

#### Avoid MultipleBagFetchException
Hibernate throws `MultipleBagFetchException` when two `@OneToMany` collections are eagerly JOIN FETCHed simultaneously. The solution: `HotelRepository` has two separate queries:
- `findByIdWithAmenities(id)` — JOIN FETCHes only the amenities collection
- Rooms are loaded separately via `RoomRepository`

#### Overbooking Prevention
`BookingService.createBooking()` uses a **pessimistic write lock** (`PESSIMISTIC_WRITE`) on the `Room` entity and counts overlapping bookings before inserting:

```java
// Counts confirmed bookings for the room that overlap [checkIn, checkOut)
int booked = bookingRepository.countOverlappingBookings(roomId, checkIn, checkOut);
if (booked >= room.getTotalRooms()) throw new RoomNotAvailableException(...);
```

#### Safe Date Parsing
`HotelController` includes a `parseLocalDateSafely()` helper that returns `null` for `undefined`, empty, or malformed date strings instead of throwing 400 errors.

#### Error Handling
`GlobalExceptionHandler` catches:
- `HotelNotFoundException` → 404
- `RoomNotAvailableException` → 409
- `InvalidBookingException` → 400
- `MethodArgumentNotValidException` → 400 (validation errors)

All errors return a consistent `ErrorResponse { message, timestamp }` JSON body.

---

## 4. Frontend Design

### 4.1 State Management

| State | Location | Persistence |
|---|---|---|
| Hotel list / search filters | `HotelListPage` local state + URL search params | URL |
| Hotel detail + rooms | `HotelDetailPage` local state | None (re-fetched) |
| Booking form data | `BookingFormPage` local state | None |
| Booking confirmation | React Router `location.state` | Tab session |
| **Compare hotel IDs** | `CompareContext` (React Context) | **localStorage** |

### 4.2 Routing

| Route | Component | Description |
|---|---|---|
| `/` | `HomePage` | Search form + featured hotels |
| `/hotels` | `HotelListPage` | Hotel grid with filters |
| `/hotels/:id` | `HotelDetailPage` | Hotel info + rooms |
| `/hotels/:id/book/:roomId` | `BookingFormPage` | Booking form |
| `/booking/confirm` | `BookingConfirmPage` | Booking confirmation |
| `/booking/manage` | `ManageBookingPage` | Lookup + cancel booking |
| `/compare` | `ComparePage` | **Side-by-side hotel comparison** |

### 4.3 Component Tree

```
App
├── CompareProvider (Context)
├── Toaster (react-hot-toast)
├── Navbar
│   └── Compare Hotels link (with count badge)
├── Routes
│   ├── HomePage
│   ├── HotelListPage
│   │   └── HotelCard × N         ← "+ Compare" button here
│   ├── HotelDetailPage
│   │   ├── RoomCard × N
│   │   └── "Add to Compare" button
│   ├── BookingFormPage
│   │   └── BookingSummary
│   ├── BookingConfirmPage
│   ├── ManageBookingPage
│   └── ComparePage               ← New comparison page
├── CompareFloatingBar             ← Sticky bottom bar when hotels selected
└── Footer
```

---

## 5. ⚖️ Hotel Comparison Feature Design

### 5.1 Overview

The Hotel Comparison feature is a **pure frontend enhancement** — no new backend endpoints or database tables were created. It reuses the existing `/api/hotels/{id}` and `/api/hotels/{id}/rooms` endpoints.

### 5.2 Architecture Decisions

| Decision | Rationale |
|---|---|
| Pure frontend state | No new DB tables or API endpoints needed; hotel + room data already available |
| React Context API | Lightweight global state; no need for Redux for a 3-item list |
| `localStorage` persistence | Selected hotels survive page refresh, improving UX |
| Max 3 hotels | Prevents UI clutter; same limit used by popular travel sites |

### 5.3 Data Flow

```
User clicks "+ Compare" on HotelCard
        │
        ▼
CompareContext.addToCompare(hotelId)
  ├── If already in list → remove (toggle)
  ├── If 3 hotels already → toast error "max 3"
  └── Else → add ID to compareIds[], save to localStorage
        │
        ▼
CompareFloatingBar shows "X hotels selected — Compare Now"
        │
User clicks "Compare Now"
        │
        ▼
Navigate to /compare
        │
        ▼
ComparePage.useEffect runs for each compareId:
  Promise.all([
    getHotelById(id),
    getRoomsForHotel(id, checkIn, checkOut)   ← parallel fetch
  ])
        │
        ▼
Render side-by-side columns (1–3 hotels)
  ├── Hotel image, name, city, star rating
  ├── Description
  ├── Amenities list
  └── Room cards
       ├── lowestPrice = min of all room prices across all hotels
       └── If room.availableRooms === 0 (when dates given) → "Not Available"
```

### 5.4 Lowest Price Logic

```javascript
// Flatten all room prices into one array
const allPrices = allHotelsRooms
  .flat()
  .map(r => r.pricePerNight)
  .filter(Boolean);

const lowestPrice = allPrices.length > 0 ? Math.min(...allPrices) : null;

// In each room card:
const isLowest = lowestPrice !== null && room.pricePerNight === lowestPrice;
// → renders green border + "🏆 Lowest Price" badge
```

### 5.5 Availability Display

| Condition | Display |
|---|---|
| No dates selected | Show all rooms with prices; no availability badge |
| Dates selected, rooms available | Show "✓ X rooms left" in green |
| Dates selected, `availableRooms === 0` | Show "✗ Not Available (Sold Out)" in red; Book button disabled |

### 5.6 Files Added / Modified

| File | Change |
|---|---|
| `src/context/CompareContext.jsx` | **New** — Global compare state, localStorage, max-3 limit, toast messages |
| `src/pages/ComparePage.jsx` | **New** — Side-by-side comparison layout with date picker |
| `src/components/common/CompareFloatingBar.jsx` | **New** — Sticky bar with hotel count + "Compare Now" CTA |
| `src/components/hotel/HotelCard.jsx` | **Modified** — Added "⚖️ Compare" image overlay + "+ Compare" bottom button |
| `src/pages/HotelDetailPage.jsx` | **Modified** — Added "Add to Compare" button in hotel header |
| `src/components/layout/Navbar.jsx` | **Modified** — Added "⚖️ Compare Hotels" nav link with count badge |
| `src/App.jsx` | **Modified** — Wrapped with `<CompareProvider>`, added `/compare` route, added `<CompareFloatingBar>` |

---

## 6. Testing Strategy

### Backend Tests (16 total)

| Test Class | Tests | Type |
|---|---|---|
| `BookingServiceTest` | 8 | Unit (Mockito) |
| `BookingControllerTest` | 8 | Integration (MockMvc + H2) |

**Unit tests cover:**
- Successful booking creation
- Overbooking prevention
- Invalid check-in date (past date)
- Check-out before check-in
- Cancellation of confirmed booking
- Cancellation of already-cancelled booking (error)
- Booking not found (error)

**Integration tests cover:**
- Full HTTP round-trip for booking creation
- Booking lookup by reference ID
- Cancellation via PATCH endpoint
- Concurrent booking (race condition / overbooking)
- 400 validation for missing fields

### Frontend
- Manual testing of all user flows (search → detail → book → confirm → manage)
- Manual testing of Hotel Comparison (add, remove, clear, max-3 limit, date filter)

---

## 7. Security & Validation

| Concern | Approach |
|---|---|
| Input validation | `@NotBlank`, `@Email`, `@Future`, `@Min` on DTOs via Spring Validation |
| SQL injection | Spring Data JPA / JPQL parameterized queries |
| Overbooking | Pessimistic DB lock on Room row during booking transaction |
| CORS | Whitelist `http://localhost:5173` only |
| No auth | Intentionally excluded (educational project scope) |

---

## 8. Extensibility

Future enhancements that could be added without breaking existing features:

- **User accounts / JWT auth** — Add a `USERS` table and Spring Security
- **Image upload** — Replace external image URLs with file upload to storage
- **Reviews & ratings** — Add a `REVIEWS` table linked to `BOOKINGS`
- **Email notifications** — Add Spring Mail for booking confirmation emails
- **Payment gateway** — Integrate Razorpay or Stripe before booking creation
- **Admin panel** — CRUD for hotels, rooms, and bookings with a separate React app

> ✅ **Hotel Comparison** was implemented as a surprise feature in v2.0 — see Section 5.
