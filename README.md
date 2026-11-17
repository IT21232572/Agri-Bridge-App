# 🌱 Agri-Bridge: Agricultural Supply Chain & Logistics Platform

Agri-Bridge is a full-stack platform designed to bridge the gap between farmers, buyers, and logistics partners. It streamlines agricultural trade, ensures fair pricing, and coordinates transportation and real-time tracking of fresh produce across Sri Lanka.

---

## 🚚 Specialized Feature: User & Logistics Management

The **User & Logistics Management** module is a specialized function engineered to streamline user access control, facilitate secure account management, and coordinate the transportation, dispatching, driver assignment, and live tracking of agricultural goods.

---

### 🌟 Key Responsibilities & Capabilities

1. **User Account & Role-Based Access Control (RBAC)**
   - Facilitates secure account registration, authentication, and user profile management.
   - Manages granular user roles and permission levels:
     - 👑 **Admin**: Complete system visibility, dispatch control, user directory oversight, and audit logs.
     - 🛒 **Buyer**: Place purchase requests, accept deals, receive packages, and verify delivery via OTP.
     - 🌱 **Seller / Farmer**: Post produce supplies, accept buyer offers, create shipments, and monitor sales.
     - 🚛 **Driver / Logistics Partner**: View assigned deliveries, update transit milestones, and submit proof of delivery.
   - 🛡️ **Strict Admin Profile Protection**: Built-in security lock preventing the deletion, demotion, or suspension of Administrator accounts.

2. **Logistics & Order Dispatch Console**
   - Seamlessly converts placed orders and accepted deals into active shipments.
   - Captures agricultural transit specifications:
     - Produce category (Vegetables, Fruits, Grains, etc.)
     - Cargo weight and volume
     - Temperature control & handling (Perishable / Keep Cool, Heavy Load, Express Dry)
     - Priority levels (`Standard`, `Urgent`, `Express`)
     - Origin farmgate and destination depot addresses across 17 Sri Lankan agricultural districts.

3. **Intelligent Driver Tracking & Assignment Algorithm**
   - Implements a location-aware matching algorithm powered by the **Haversine Distance Formula**.
   - Calculates geographic proximity between available drivers and pickup farmgates.
   - Matches cargo requirements with driver vehicle types (Refrigerated Truck, Heavy Lorry, Light Truck, Three-Wheeler).
   - Incorporates driver reliability metrics (on-time delivery percentage and customer ratings out of 5.0).
   - Automatically assigns the optimal driver with composite score breakdown.

4. **Real-Time Package Tracking & Milestone Auditing**
   - Dynamic 4-stage visual progress stepper:
     $$\text{Pending Match} \longrightarrow \text{Dispatched} \longrightarrow \text{In-Transit} \longrightarrow \text{Delivered}$$
   - Corridors mapped through national agrarian highways (e.g., Dambulla ➔ Kurunegala ➔ Peliyagoda).
   - Detailed milestone history recording timestamp, checkpoint location, delay alerts, and updating entity.

5. **Proof of Delivery (PoD) Verification**
   - **6-Digit Handover OTP**: Cryptographically generated OTP code provided exclusively to the recipient; delivery cannot be closed until the driver inputs the matching code.
   - **Digital Sign-off / Signature**: Recipient name sign-off and cargo condition remarks.

6. **Operational Logistics Report Generator**
   - **Completed Deliveries Report**: Turnaround duration, delivery timestamps, driver IDs, and PoD audit logs.
   - **Delayed Shipments Report**: Real-time identification of overdue shipments with delay reasons and contingency notes.
   - **Driver Performance Metrics**: Deliveries assigned vs. completed, on-time delivery rate (%), and customer satisfaction ratings.
   - **Export Options**: 1-click **Export to CSV** and formatted **Print / PDF View**.

7. **Unified Search Engine (Search Bar)**
   - Global search bar (shortcut `Ctrl + K`) allowing instant query resolution across:
     - 👥 **Users** (by name, email, phone, city, district)
     - 🚛 **Drivers** (by vehicle type, license plate, availability, rating)
     - 📦 **Agricultural Orders & Requests** (by commodity, category, location)
     - 🚚 **Deliveries & Shipments** (by tracking number, sender, recipient, status)

---

## 🛠️ Technical Stack

- **Frontend**: React.js, React Router v7, React-Bootstrap, Bootstrap 5.3, Axios
- **Backend**: Node.js, Express.js
- **Database**: MongoDB / MongoDB Atlas (Mongoose ODM)
- **Security & Auth**: JSON Web Tokens (JWT), bcryptjs password hashing
- **Testing & API Verification**: Postman, Jest, Supertest

---

## 📂 Project Structure

```text
Agri-Bridge-App/
├── backend/
│   ├── middleware/
│   │   └── auth.js                    # JWT authentication & role-based guards
│   ├── models/
│   │   ├── User.js                    # User & Driver schema with role validation
│   │   ├── Shipment.js                # Shipment, Tracking Timeline & PoD schema
│   │   ├── LogisticsAudit.js          # Security audit logs
│   │   ├── Request.js                 # Agricultural produce requests
│   │   └── Deal.js                    # Accepted offers & deals
│   ├── routes/
│   │   ├── userRoutes.js              # Auth, profile, user directory & driver fleet
│   │   ├── shipmentRoutes.js          # Dispatch, auto-assign, tracking, PoD & reports
│   │   ├── searchRoutes.js            # Unified cross-entity search engine
│   │   ├── requestRoutes.js           # Marketplace request routes
│   │   └── dealRoutes.js              # Deal routes
│   ├── services/
│   │   └── logisticsService.js        # Haversine distance & driver scoring algorithm
│   ├── tests/
│   │   ├── logistics.test.js          # User & logistics API test suite (10 tests)
│   │   └── requests.test.js           # Security and request unit tests
│   ├── seed.js                        # Demo data initialization script
│   └── server.js                      # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout/
│   │   │   │   └── MainLayout.js      # Sidebar, top navigation, search trigger
│   │   │   ├── LogisticsManagement/
│   │   │   │   ├── LogisticsDashboard.js  # Dispatch console & shipment management
│   │   │   │   ├── ShipmentTracking.js    # Real-time tracking stepper & PoD
│   │   │   │   ├── LogisticsReports.js    # Report generator & CSV exporter
│   │   │   │   └── GlobalSearchModal.js   # Unified search popup (Ctrl+K)
│   │   │   ├── UserManagement/
│   │   │   │   ├── UserDirectory.js       # User directory & driver fleet manager
│   │   │   │   └── ProfilePage.js         # Account profile & demo role switcher
│   │   │   └── RequestManagement/         # Supply & Request Hub components
│   │   ├── context/
│   │   │   ├── AuthContext.js         # Authentication state & role switcher
│   │   │   └── RequestContext.js      # Marketplace requests state
│   │   ├── services/
│   │   │   ├── authService.js         # User API client
│   │   │   └── shipmentService.js     # Logistics & search API client
│   │   └── App.js                     # Root routes configuration
│   └── package.json
│
├── AgriBridge_User_Logistics_Management.postman_collection.json # Complete Postman test collection
└── README.md                          # Project documentation
```

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- Node.js (v18.x or newer)
- npm (v9.x or newer)
- MongoDB (Local instance or MongoDB Atlas)

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure the `.env` file in `backend/`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret_key
   ```
4. Seed demo users and shipments:
   ```bash
   node seed.js
   ```
5. Start the backend server:
   ```bash
   npm start
   ```
   *The API will run at `http://localhost:5000`.*

### 3. Frontend Setup
1. In a new terminal, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   *The application will launch at `http://localhost:3000`.*

---

## 🔑 Demo Test Accounts

The platform comes pre-configured with demo accounts for each role (default password: `password123`):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@agribridge.lk` | `password123` | Full administrative privileges (Protected profile) |
| **Driver** | `sunil.driver@agribridge.lk` | `password123` | Express Driver (Refrigerated Truck, Dambulla Hub) |
| **Driver** | `kamal.driver@agribridge.lk` | `password123` | Heavy Cargo Driver (Heavy Lorry, Badulla Depot) |
| **Seller** | `nimal.seller@agribridge.lk` | `password123` | Organic Produce Farmer (Dambulla) |
| **Buyer** | `ruwan.buyer@agribridge.lk` | `password123` | Wholesale Merchant (Manning Market, Peliyagoda) |

> 💡 **Quick Role Switcher**: You can also use the 1-click **Quick Role Demo Switcher** in the **Profile** page (`/profile`) to toggle seamlessly between roles without re-logging in.

---

## 📬 API Endpoints Summary

### User & Access Control (`/api/users`)
- `POST /api/users/register` - Register a new account (Admin, Buyer, Seller, Driver)
- `POST /api/users/login` - Authenticate and retrieve JWT
- `GET /api/users/me` - Get logged-in user profile
- `PUT /api/users/profile` - Update profile, contact & vehicle specifications
- `GET /api/users` - List all registered users (filter by role/status)
- `PUT /api/users/:id/role` - Update user role & status (Admin protected)
- `DELETE /api/users/:id` - Delete user account (Admin deletion strictly blocked with HTTP 403)
- `GET /api/users/drivers/list` - List driver fleet with availability filter
- `PUT /api/users/drivers/:id/availability` - Toggle driver availability

### Logistics & Shipments (`/api/shipments`)
- `GET /api/shipments` - List all shipments with status, priority, and delayed filters
- `GET /api/shipments/track/:trackingNumber` - Public & authenticated live package tracking
- `GET /api/shipments/:id` - Get comprehensive shipment details
- `POST /api/shipments` - Create a new agricultural shipment
- `POST /api/shipments/:id/auto-assign` - **Smart Auto-Assignment Algorithm**
- `POST /api/shipments/:id/assign-driver` - Manual driver assignment
- `PUT /api/shipments/:id/status` - Progress transit status & record milestone checkpoints
- `POST /api/shipments/:id/verify-delivery` - Verify proof of delivery via recipient OTP
- `GET /api/shipments/reports/analytics` - **Report Generator** metrics

### Unified Search Engine (`/api/search`)
- `GET /api/search?q=:query` - Search across Users, Drivers, Orders, and Deliveries

---

## 📮 Postman Collection

Import the included file:
**`AgriBridge_User_Logistics_Management.postman_collection.json`**
into Postman to immediately execute and verify all 16 endpoints.

---

## 🧪 Automated Test Suite

Run the test suite from the `backend/` directory:
```bash
npm test
```
**Test Results (11/11 passing):**
```text
PASS tests/logistics.test.js
  User & Logistics Management API Tests
    √ POST /api/users/seed-demo-users should initialize demo accounts
    √ GET /api/users should return all users
    √ GET /api/users/drivers/list should return registered drivers
    √ POST /api/shipments should create a new shipment with tracking number and OTP
    √ GET /api/shipments/track/:trackingNumber should return shipment details
    √ POST /api/shipments/:id/auto-assign should match and assign the most suitable driver
    √ GET /api/search?q=Colombo should return categorized search results
    √ GET /api/shipments/reports/analytics should return completed, delayed, and driver performance stats
    √ DELETE /api/users/:id should reject deletion of an Admin profile with 403 Forbidden
    √ PUT /api/users/:id/role should reject demoting or suspending an Admin with 403 Forbidden
PASS tests/requests.test.js
  Agri-Bridge Request API Unit & Security Tests
    √ GET /api/requests should return a 200 status and an array of requests
    √ GET /api/requests/:id should handle non-existent IDs gracefully
    √ POST /api/requests should reject requests missing required fields
```

---

## 📄 License
This project is licensed under the ISC License.
