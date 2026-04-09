# ✈️ TravelDesk Pro: Executive Travel Logistics

**TravelDesk Pro** is a high-performance, enterprise-grade travel management platform architected for precision, speed, and visual excellence. Following a radical **Apple-inspired "Pro" redesign**, the platform offers a strictly monochrome, hardware-accelerated user experience designed for the modern executive nomad.

---

## 🎨 Design Philosophy: Executive Minimalism
TravelDesk Pro abandons traditional UI clutter in favor of a "Physical Digital" aesthetic.
- **Atmospheric Abyss**: Pure black backgrounds (`#000000`) paired with a functional, animated **noise texture layer** for high-end cinematic depth.
- **Precision Typography**: Minimalist type system using **SF Pro / Inter** with metallic silver headlines and tight letter spacing.
- **Hardware Interaction**: Perspective-based **3D Tilt Architecture** on core modules and an **Ambient Cursor Glow** for immersive navigation.
- **Physical Glass**: Refined glassmorphism (`backdrop-blur-2xl`) with internal micro-glows to simulate high-end physical materials.

---

## 🚀 Pro Module Architecture

### 1. GDS-Integrated Flight Engine
- **Precision Discovery**: Sub-second flight search with Amadeus-style intelligence.
- **Hardware Seat Mapping**: 3D-perspective airplane grids with real-time occupancy synchronization via **Socket.io**.
- **Monochrome Fare Intelligence**: Price trend visualization using white-opacity levels for a cleaner, "Apple Pro" take on data.

### 2. Luxury Inventory Console
- **Premium Stays**: High-resolution hotel discovery with instant room status updates.
- **Monochrome Grid**: A structured, distraction-free gallery of premium properties and amenities.

### 3. Identity & Security
- **Pro Authenticator**: 3D-tilt enabled secure login panel with floating "Aurora" backgrounds.
- **Enterprise Encryption**: JWT (Secure httpOnly) authentication with multi-level role protection.

### 4. WebSocket Activity Console
- **Operational Log**: Real-time operational updates, PNR generation, and status tracking.
- **Fluid Layouts**: Staggered content reveals and layout transitions powered by **Framer Motion**.

---

## 🛠️ Technical Specification

### **Enterprise Core**
- **Frontend**: React 19, Vite 8, Tailwind CSS v4.0.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Intelligence**: Integrated flight logic and fare volatility algorithms.
- **Real-time**: High-availability Socket.io connectivity.

### **Pro Visuals Engine**
- **Animation**: Framer Motion (Spring-based smooth dynamics).
- **Icons**: Lucide React (Monochrome variants).
- **State**: Redux Toolkit (Unified slice architecture).

---

## 📦 System Deployment

### 1. Environment Ready
Create a `.env` file in the `/server` directory:
```env
PORT=5002
MONGO_URI=mongodb://localhost:27017/traveldesk
JWT_ACCESS_SECRET=your_pro_access_key
CLIENT_URL=http://localhost:5173
```

### 2. Installation & Launch
Execute in parallel using two terminal sessions:

**Session A: Precision Backend**
```bash
cd server
npm install
npm run seed  # Initialize Pro inventory
npm run dev
```

**Session B: Pro Interface**
```bash
cd client
npm install
npm run dev
```

---

## 📜 Documentation & Reliability
Access the full OpenAPI specification and technical endpoints via the integrated Swagger console:
- **API Reference**: `http://localhost:5002/api/docs`

---
**Architected by Antigravity**
Precision. Minimalism. Performance.
