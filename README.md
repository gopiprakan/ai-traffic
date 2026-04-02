# Dynamic AI Traffic Flow Optimizer & Emergency Grid 🚦

A production-style intelligent traffic light control system that leverages Computer Vision (OpenCV + YOLOv8) to track live traffic. It adjusts green light dynamics strictly adhering to active queue densities to eliminate generic cycle inefficiencies, fortified with an Emergency Grid.

## 🛠️ Stack & Architecture
- **AI Core:** Ultralytics YOLOv8 (Vehicle classification & count)
- **Backend Engine:** Python, Flask server, OpenCV (CBR/Frame ingestion)
- **Transport Layer:** Flask-SocketIO (Real-time duplex syncing)
- **Web App Dashboard:** React.js (Vite), Axios, Lucide Icons
- **Styling:** Premium Glassmorphic Vanilla CSS (No generic component libraries)

## 🌟 Key Features
1. **AI Vehicle Detection:** Actively tracks cars, trucks, motorcycles and buses on live cameras.
2. **Adaptive Queues:** Standard cycle durations are scrapped. Green timers adjust proportionally to lane load (e.g., 20 waiting constraints get drastically longer lights than 3).
3. **Emergency Prime Override:** One-click simulation UI simulating Siren/GPS detection forcing the intersection grid protocol to immediately prioritize an ambulance lane.
4. **Sub-second Sockets:** Instant UI rendering of light bulbs and analytics over WebSocket telemetry.

---

## 💻 Setup Instructions

### 1. Launch the Backend AI Engine
*Pre-requisite: Python 3.8+ installed.*

1. Open a terminal and navigate:
   ```bash
   cd backend
   ```
2. **(Highly Recommended)** Create and activate a Virtual Environment:
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   ```
3. Install ML dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Boot the Neural Engine & API:
   ```bash
   python app.py
   ```
> **Tip:** If you do not have a dedicated GPU, it safely runs on CPU. YOLOv8 Nano (`yolov8n.pt`) auto-downloads on initial run (~6MB). The backend ships with an autonomous real-world noise simulation out of the box if no `traffic.mp4` is found—guaranteeing 100% immediate plug-and-play capability! 

### 2. Launch the React Dashboard
*Pre-requisite: Node.js V18+ installed.*

1. Open a **second separate terminal window**.
2. Navigate to the UI folder:
   ```bash
   cd frontend
   ```
3. Install frontend dependency tree:
   ```bash
   npm install
   ```
4. Start the frontend host:
   ```bash
   npm run dev
   ```
5. 🌐 Follow the local link (usually `http://localhost:5173`) in your preferred browser and witness the system.

*(If you wish to test true vision, drop any street camera recording snippet naming it `traffic.mp4` into the backend directory. The app seamlessly picks it up and replaces numbers by raw object inferences).*
