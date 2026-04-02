import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { AlertCircle, Activity, Car, Clock, ShieldAlert, Cpu } from 'lucide-react';
import TrafficPanel from './TrafficPanel';

const SOCKET_SERVER_URL = "http://localhost:5000";

const DIRECTION_MAP = {
  Lane_1: "South-West",
  Lane_2: "North-West",
  Lane_3: "North-East",
  Lane_4: "South-East"
};

function App() {
  const [lanes, setLanes] = useState({
    Lane_1: { count: 0, light: "Red", timer: 0, is_emergency: false },
    Lane_2: { count: 0, light: "Red", timer: 0, is_emergency: false },
    Lane_3: { count: 0, light: "Red", timer: 0, is_emergency: false },
    Lane_4: { count: 0, light: "Red", timer: 0, is_emergency: false },
  });
  
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to backend websocket
    const socket = io(SOCKET_SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to backend');
      setConnected(true);
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('traffic_update', (data) => {
      setLanes(data);
      // Calculate total vehicles across all 4 lanes
      let total = 0;
      Object.values(data).forEach(lane => total += lane.count);
      setTotalVehicles(total);
    });

    // Handle distinct emergency alert events explicitly
    socket.on('emergency_alert', (payload) => {
      console.log("[EMERGENCY EVENT]:", payload.message);
      if (payload.status === 'active') {
        // You could theoretically trigger a siren alarm sound here
        document.title = "🚨 EMERGENCY OVERRIDE 🚨";
      } else {
        document.title = "AI Traffic Optimizer";
      }
    });

    return () => {
      socket.off('traffic_update');
      socket.off('emergency_alert');
      socket.disconnect();
    };
  }, []);

  const triggerEmergency = async (laneKey) => {
    try {
      const isCurrentlyEmergency = lanes[laneKey].is_emergency;
      await axios.post(`${SOCKET_SERVER_URL}/api/emergency`, {
        lane: laneKey,
        action: isCurrentlyEmergency ? "stop" : "start"
      });
    } catch (error) {
      console.error("Error triggering emergency mode:", error);
      alert("Could not reach backend API. Is it running on port 5000?");
    }
  };

  const getSystemStatus = () => {
    if (!connected) return "Connecting to Backend Server...";
    const isEmergency = Object.values(lanes).some(lane => lane.is_emergency);
    return isEmergency ? "EMERGENCY OVERRIDE ACTIVE" : "AI Optimizer Running - Optimal Flow";
  };

  return (
    <div className="dashboard-container">
      <div className="header" style={{ gridColumn: '1 / -1' }}>
        <h1>Dynamic AI Traffic Flow</h1>
        <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: connected ? 'inherit' : 'var(--red-light)' }}>
          <Activity color={connected ? "#22c55e" : "#ef4444"} /> 
          {getSystemStatus()}
        </p>
      </div>

      {/* Left Panel - Intersection Layout */}
      <div className="glass-panel">
        <h2 className="panel-title"><Cpu color="var(--accent-blue)" /> Intersection View</h2>
        <div className="intersection">
          {Object.entries(lanes).map(([key, data]) => (
            <div key={key} className={`lane-card ${data.light === 'Green' ? 'active' : ''} ${data.is_emergency ? 'emergency' : ''}`}>
              <div className="lane-name">
                {key.replace('_', ' ')}
                {data.is_emergency && <span className="badge"><AlertCircle size={12}/> Override</span>}
              </div>
              
              <div className="traffic-light-housing">
                <div className={`bulb red ${data.light === 'Red' ? 'on' : ''}`}></div>
                <div className={`bulb yellow ${data.light === 'Yellow' ? 'on' : ''}`}></div>
                <div className={`bulb green ${data.light === 'Green' ? 'on' : ''}`}></div>
              </div>

              <div className="timer-large">
                {data.timer > 0 ? `${data.timer}s` : '--'}
              </div>

              <div className="lane-stats" style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div className="stat-pill" style={{ flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Car size={16}/> Vehicles</span>
                    <strong>{data.count}</strong>
                  </div>
                  <div className="stat-pill" style={{ flex: 1 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={16}/> Wait</span>
                    <strong>{data.light === 'Green' ? 'Clear' : 'Queueing'}</strong>
                  </div>
                </div>
                
                {/* Emergency Counter Defaulting to 0 */}
                <div className="stat-pill" style={{ justifyContent: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>🚑 Emergencies</span>
                  <strong style={{ color: '#ef4444' }}>{data.emergency_count || 0}</strong>
                </div>
              </div>

              {/* Embedded Video Feed per Signal */}
              <div style={{ marginTop: '1.5rem', width: '100%' }}>
                <TrafficPanel direction={DIRECTION_MAP[key]} api="ul_80b420183342ee1ce7a3f6ad0f6a5f43e16f8f6e" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel - Stats and Emergency System */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="glass-panel">
          <h2 className="panel-title"><Activity className="icon-pulse" /> Live Analytics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <span style={{ color: 'var(--text-muted)' }}>Total Vehicles (Local)</span>
              <div className="stat-value">{totalVehicles}</div>
            </div>
            <div className="stat-card">
              <span style={{ color: 'var(--text-muted)' }}>Avg AI Efficiency</span>
              <div className="stat-value" style={{ color: 'var(--green-light)' }}>+34%</div>
            </div>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.6' }}>
            The AI engine runs YOLOv8 object detection on camera feeds to monitor lane density. 
            Signals dynamically extend green times proportional to the number of queued vehicles to prevent bottleneck formation and reduce overall idle time.
          </p>
        </div>

        <div className="glass-panel">
          <h2 className="panel-title"><ShieldAlert style={{ color: 'var(--red-light)' }}/> Emergency Grid Override</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
            Trigger an override manually. In production, this integrates via GPS or siren audio-recognition. The system halts normal logic and gives right-of-way.
          </p>
          <div className="emergency-section">
            {Object.keys(lanes).map((key) => {
              const isActive = lanes[key].is_emergency;
               return (
                <button 
                  key={`btn-${key}`} 
                  className={`emergency-btn ${!isActive && Object.values(lanes).some(l => l.is_emergency) ? 'active' : ''}`}
                  onClick={() => triggerEmergency(key)}
                  style={{ opacity: !isActive && Object.values(lanes).some(l => l.is_emergency) ? 0.5 : 1 }}
                >
                  <ShieldAlert size={20} />
                  {isActive ? `Cancel Override ${key.split('_')[1]}` : `Override ${key.replace('_', ' ')}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
