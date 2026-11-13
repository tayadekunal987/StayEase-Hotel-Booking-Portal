# 🏨 StayEase — Hotel Booking Portal

A full-stack hotel booking web application built with **React 18 + Vite** (frontend), **Spring Boot 3.3.5** (backend), and **MySQL 8** (database).

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 Hotel Search | Filter hotels by city, check-in and check-out dates |
| 🏨 Hotel Browsing | View hotel photos, star ratings, amenities, and room options |
| 🛏️ Room Selection | See real-time room availability and prices per night |
| 📅 Booking | Book a room for selected dates with guest details |
| ✅ Booking Confirmation | Instant booking confirmation with a unique reference ID |
| 🗂️ Manage Bookings | Look up a booking by reference ID and cancel if needed |
| ⚖️ **Hotel Comparison** | Select up to 3 hotels and compare them side by side |

---

## 🗂️ Project Structure

```
StayEase/
├── backend/                          # Spring Boot backend
│   ├── src/main/java/com/stayease/
│   │   ├── config/
│   │   │   ├── CorsConfig.java       # CORS configuration for frontend
│   │   │   └── DataInitializer.java  # Seeds 5 hotels on first startup
│   │   ├── controller/
│   │   │   ├── HotelController.java  # GET /api/hotels, /api/hotels/{id}, /api/hotels/{id}/rooms
│   │   │   └── BookingController.java# POST /api/bookings, GET /api/bookings/{ref}, PATCH cancel
│   │   ├── dto/
│   │   │   ├── BookingRequest.java
│   │   │   ├── BookingResponse.java
│   │   │   ├── CancelBookingRequest.java
│   │   │   ├── HotelResponse.java
│   │   │   └── RoomResponse.java
│   │   ├── entity/
│   │   │   ├── Booking.java
│   │   │   ├── BookingStatus.java
│   │   │   ├── Hotel.java
│   │   │   ├── HotelAmenity.java
│   │   │   └── Room.java
│   │   ├── exception/
│   │   │   ├── ErrorResponse.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   ├── HotelNotFoundException.java
│   │   │   ├── InvalidBookingException.java
│   │   │   └── RoomNotAvailableException.java
│   │   ├── repository/
│   │   │   ├── BookingRepository.java
│   │   │   ├── HotelRepository.java
│   │   │   └── RoomRepository.java
│   │   └── service/
│   │       ├── BookingService.java   # Pessimistic locking, overbooking prevention
│   │       └── HotelService.java
│   └── src/test/java/com/stayease/  # 16 unit + integration tests
│
└── frontend/                         # React + Vite frontend
    └── src/
        ├── api/
        │   ├── axiosInstance.js      # Axios base config
        │   ├── hotelApi.js           # Hotel API calls
        │   └── bookingApi.js         # Booking API calls
        ├── components/
        │   ├── booking/
        │   │   └── BookingSummary.jsx
        │   ├── common/
        │   │   ├── CompareFloatingBar.jsx  # ⚖️ Floating compare bar (bottom of screen)
        │   │   ├── ErrorMessage.jsx
        │   │   └── LoadingSpinner.jsx
        │   ├── hotel/
        │   │   ├── HotelCard.jsx     # Shows "+ Compare" and "⚖️ Compare" buttons
        │   │   └── RoomCard.jsx
        │   └── layout/
        │       ├── Footer.jsx
        │       └── Navbar.jsx        # Includes "Compare Hotels" link with count badge
        ├── context/
        │   └── CompareContext.jsx    # ⚖️ Global compare state (localStorage + max-3 limit)
        ├── pages/
        │   ├── BookingConfirmPage.jsx
        │   ├── BookingFormPage.jsx
        │   ├── ComparePage.jsx       # ⚖️ Side-by-side hotel comparison page
        │   ├── HomePage.jsx
        │   ├── HotelDetailPage.jsx
        │   ├── HotelListPage.jsx
        │   └── ManageBookingPage.jsx
        └── App.jsx                   # Router + CompareProvider wrapper
```

---

## ⚖️ Hotel Comparison Feature

The **Hotel Comparison** feature lets users pick up to **3 hotels** and compare them side by side — helping them make a smarter booking decision.

### How to Use

1. **Add hotels to compare** — On any hotel card, click the **"⚖️ Compare"** button (top-left of image) or the **"+ Compare"** button (bottom-right of card). The button turns blue when added.
2. **Floating bar** — After selecting at least one hotel, a floating bar appears at the bottom of the screen showing how many hotels are selected. Click **"Compare Now"** to go to the comparison page.
3. **Compare Hotels link** — The navbar shows a **"⚖️ Compare Hotels"** link with a live count badge (e.g. ⓵).
4. **Comparison page** — Hotels are displayed side by side. Each column shows:
   - Hotel image, name, city, and star rating
   - Description
   - Full amenities list
   - All room categories with price per night
   - Real-time availability (enter dates using the date picker)
5. **Lowest price badge** — The cheapest room across all compared hotels is highlighted with a **🏆 Lowest Price** badge and a green border.
6. **Not Available** — If a room has no available units for selected dates, it shows a red "✗ Not Available (Sold Out)" badge and disables the Book button.
7. **Remove a hotel** — Click the **✕** button on any hotel column header to remove it.
8. **Clear All** — Click **"🗑️ Clear All"** at the top to start fresh.

### Key Details
- Maximum **3 hotels** can be compared at once. Trying to add a 4th shows a toast notification.
- Selected hotels are **persisted in localStorage** — they survive page refresh.
- No new backend endpoints or database tables were added for this feature; it reuses the existing hotel and room APIs.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, Tailwind CSS 3, React Router 6, Axios, react-hot-toast |
| Backend | Spring Boot 3.3.5, Spring Data JPA, Spring Validation, Hibernate |
| Database | MySQL 8 (production), H2 (tests) |
| Build | Maven 3.9.9 (bundled via `mvnw.cmd`), Node.js 18+, pnpm |

---

## 🚀 Running the Application

### Prerequisites
- Java 21+ (JDK 25 is fine)
- Node.js 18+ and pnpm
- MySQL 8 running on port 3306

### 1. Configure MySQL

Create a database named `stayease`:

```sql
CREATE DATABASE stayease;
```

The backend uses `root`/`root` by default. Edit `backend/src/main/resources/application.properties` to change:

```properties
spring.datasource.username=root
spring.datasource.password=root
```

### 2. Start the Backend

```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"   # adjust to your JDK path
.\mvnw.cmd spring-boot:run
```

The backend starts at **http://localhost:8080**.  
On first run, `DataInitializer` automatically seeds **5 hotels** with rooms and amenities.

### 3. Start the Frontend

```powershell
cd frontend
pnpm install
pnpm dev
```

The frontend starts at **http://localhost:5173**.

---

## 🧪 Running Tests

```powershell
cd backend
$env:JAVA_HOME = "C:\Program Files\Java\jdk-25"
.\mvnw.cmd test
```

Expected: **Tests run: 16, Failures: 0, Errors: 0, Skipped: 0**

Tests cover:
- Booking creation (happy path)
- Overbooking prevention (pessimistic locking)
- Invalid date validation
- Booking cancellation
- Booking lookup by reference
- Room availability queries
- API integration tests via `MockMvc`

---

## 🌐 API Endpoints

### Hotels

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/hotels` | List all hotels (optional `?city=Mumbai`) |
| GET | `/api/hotels/{id}` | Get hotel details with amenities |
| GET | `/api/hotels/{id}/rooms` | Get rooms (optional `?checkIn=&checkOut=`) |
| GET | `/api/hotels/{id}/rooms/{roomId}` | Get a single room with availability |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a new booking |
| GET | `/api/bookings/{referenceId}` | Get booking by reference ID |
| PATCH | `/api/bookings/{referenceId}/cancel` | Cancel a booking |

---

## 🏨 Seeded Hotels (Sample Data)

| Hotel | City | Stars | Lowest Price |
|---|---|---|---|
| Grand Palace | Mumbai | ⭐⭐⭐⭐⭐ | ₹8,000/night |
| Ocean Breeze | Goa | ⭐⭐⭐⭐ | ₹5,500/night |
| Heritage Haveli | Jaipur | ⭐⭐⭐⭐ | ₹4,200/night |
| Mountain Serenity | Shimla | ⭐⭐⭐ | ₹3,000/night |
| Royal Orchid Suites | Bengaluru | ⭐⭐⭐⭐⭐ | ₹7,500/night |

---

## 📄 License

MIT — free for personal and educational use.
