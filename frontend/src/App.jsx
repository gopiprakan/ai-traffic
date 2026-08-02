import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { 
  Activity, 
  Car, 
  Clock, 
  ShieldAlert, 
  Cpu, 
  Radio, 
  Layers, 
  Camera, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import TrafficPanel from './TrafficPanel';
import IntersectionView from './IntersectionView';

const SOCKET_SERVER_URL = "http://localhost:5000";

const DIRECTION_MAP = {
  Lane_1: "South-West",
  Lane_2: "North-West",
  Lane_3: "North-East",
  Lane_4: "South-East"
};

function App() {
  const [lanes, setLanes] = useState({
    Lane_1: { count: 0, light: "Red", timer: 0, is_emergency: false, emergency_count: 0 },
    Lane_2: { count: 0, light: "Red", timer: 0, is_emergency: false, emergency_count: 0 },
    Lane_3: { count: 0, light: "Red", timer: 0, is_emergency: false, emergency_count: 0 },
    Lane_4: { count: 0, light: "Red", timer: 0, is_emergency: false, emergency_count: 0 },
  });

  const [totalVehicles, setTotalVehicles] = useState(0);
  const [connected, setConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'intersection', 'cameras', 'analytics'
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [eventLogs, setEventLogs] = useState([
    { time: new Date().toLocaleTimeString(), msg: "AI Traffic Optimizer Engine Initialized", type: "system" }
  ]);

  // Live Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Socket Connection Handling
  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5
    });

    socket.on('connect', () => {
      setConnected(true);
      addLog("Connected to Backend Socket Server on port 5000", "success");
    });

    socket.on('disconnect', () => {
      setConnected(false);
      addLog("Backend server disconnected", "error");
    });

    socket.on('traffic_update', (data) => {
      setLanes(data);
      let total = 0;
      Object.values(data).forEach(lane => total += lane.count);
      setTotalVehicles(total);
    });

    socket.on('emergency_alert', (payload) => {
      if (payload.status === 'active') {
        document.title = "🚨 EMERGENCY OVERRIDE ACTIVE";
        addLog(`Emergency Override Activated on ${payload.lane || 'Grid'}!`, "emergency");
      } else {
        document.title = "AI Traffic Nexus | Intelligent Flow Optimizer";
        addLog("Emergency Override Cleared. Resuming AI Flow Logic.", "info");
      }
    });

    return () => {
      socket.off('traffic_update');
      socket.off('emergency_alert');
      socket.disconnect();
    };
  }, []);

  const addLog = (msg, type = "info") => {
    setEventLogs(prev => [
      { time: new Date().toLocaleTimeString(), msg, type },
      ...prev.slice(0, 25)
    ]);
  };

  const triggerEmergency = async (laneKey) => {
    try {
      const isCurrentlyEmergency = lanes[laneKey]?.is_emergency;
      const action = isCurrentlyEmergency ? "stop" : "start";
      
      addLog(`Sending ${action.toUpperCase()} emergency signal for ${laneKey.replace('_', ' ')}...`, "info");
      
      await axios.post(`${SOCKET_SERVER_URL}/api/emergency`, {
        lane: laneKey,
        action: action
      });
    } catch (error) {
      console.error("Error triggering emergency mode:", error);
      // Fallback state update for demonstration UI if backend server is not running
      setLanes(prev => ({
        ...prev,
        [laneKey]: {
          ...prev[laneKey],
          is_emergency: !prev[laneKey].is_emergency
        }
      }));
      addLog(`Triggered manual UI state override for ${laneKey.replace('_', ' ')} (Backend Offline)`, "warning");
    }
  };

  const isEmergencyActive = Object.values(lanes).some(lane => lane.is_emergency);

  return (
    <div className="app-wrapper">
      {/* Top Glass Navigation Header */}
      <header className="navbar-header">
        <div className="brand-container">
          <div className="brand-icon-wrapper">
            <Radio size={22} />
          </div>
          <div>
            <div className="brand-title">
              AI TRAFFIC NEXUS
            </div>
            <div className="brand-tagline">
              Adaptive Neural Flow & Emergency Grid Optimizer
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <nav className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <Layers size={16} /> Overview Grid
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'intersection' ? 'active' : ''}`}
            onClick={() => setActiveTab('intersection')}
          >
            <Cpu size={16} /> Intersection Map
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'cameras' ? 'active' : ''}`}
            onClick={() => setActiveTab('cameras')}
          >
            <Camera size={16} /> HUD Feeds
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <BarChart3 size={16} /> Telemetry Logs
          </button>
        </nav>

        {/* Telemetry Status Pills */}
        <div className="header-telemetry">
          <div className="status-pill">
            <span className={`pulse-dot ${connected ? 'online' : 'offline'}`}></span>
            {connected ? 'SOCKET CONNECTED' : 'OFFLINE MODE'}
          </div>

          <div className="clock-pill">
            <Clock size={14} />
            {currentTime}
          </div>
        </div>
      </header>

      {/* Main Dashboard Content Area */}
      <main className="dashboard-content">
        
        {/* Emergency Priority Alert Banner (Displays when Override is Active) */}
        {isEmergencyActive && (
          <div className="emergency-banner">
            <div className="emergency-banner-content">
              <div className="emergency-icon-box">
                <ShieldAlert size={26} />
              </div>
              <div className="emergency-banner-text">
                <h3>EMERGENCY PRIORITY OVERRIDE ACTIVE</h3>
                <p>Normal traffic light algorithms halted. Right-of-way granted to emergency response corridor.</p>
              </div>
            </div>

            <div className="audio-spectrum-bar" title="Siren Spectrum Detected">
              <div className="spectrum-col"></div>
              <div className="spectrum-col" style={{ animationDelay: '0.2s' }}></div>
              <div className="spectrum-col" style={{ animationDelay: '0.4s' }}></div>
              <div className="spectrum-col" style={{ animationDelay: '0.1s' }}></div>
              <div className="spectrum-col" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        )}

        {/* Key Performance Indicators & Telemetry Stats */}
        <div className="telemetry-grid">
          <div className="stat-card">
            <div className="stat-header">
              <span>Total Active Vehicles</span>
              <div className="stat-icon blue"><Car size={18} /></div>
            </div>
            <div className="stat-value">{totalVehicles}</div>
            <div className="stat-badge positive">
              <TrendingUp size={12} /> Live Sensor Feed
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>AI Optimization Efficiency</span>
              <div className="stat-icon green"><Zap size={18} /></div>
            </div>
            <div className="stat-value">+38.4%</div>
            <div className="stat-badge positive">
              <CheckCircle2 size={12} /> Adaptive YOLOv8
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Idle Queue Time Reduced</span>
              <div className="stat-icon amber"><Clock size={18} /></div>
            </div>
            <div className="stat-value">-4.2m</div>
            <div className="stat-badge neutral">
              <span>Dynamic Green Cycles</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <span>Emergency Overrides</span>
              <div className="stat-icon rose"><ShieldAlert size={18} /></div>
            </div>
            <div className="stat-value" style={{ color: isEmergencyActive ? 'var(--rose-accent)' : 'var(--text-primary)' }}>
              {Object.values(lanes).filter(l => l.is_emergency).length}
            </div>
            <div className={`stat-badge ${isEmergencyActive ? 'alert' : 'positive'}`}>
              {isEmergencyActive ? 'Grid Halted' : 'Normal Operations'}
            </div>
          </div>
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD GRID */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid-layout">
            
            {/* Left Main Panel: Interactive 4-Way Intersection Map */}
            <div className="glass-panel">
              <div className="panel-header">
                <div>
                  <div className="panel-title">
                    <Cpu size={20} style={{ color: 'var(--cyan-accent)' }} /> 
                    Live 4-Way Intersection Telemetry
                  </div>
                  <div className="panel-subtitle">Real-time signals, SVG timers & queue density visualization</div>
                </div>
              </div>

              <IntersectionView lanes={lanes} onTriggerEmergency={triggerEmergency} />
            </div>

            {/* Right Side Panels: Emergency Controls & Event Log Stream */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Emergency Override Console */}
              <div className="glass-panel">
                <div className="panel-header">
                  <div className="panel-title">
                    <ShieldAlert size={20} style={{ color: 'var(--rose-accent)' }} /> 
                    Emergency Grid Override Console
                  </div>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  Select a lane to manually trigger or clear priority right-of-way override.
                </p>

                <div className="emergency-grid">
                  {Object.keys(lanes).map((key) => {
                    const isActive = lanes[key].is_emergency;
                    return (
                      <button 
                        key={`btn-${key}`} 
                        className={`emergency-btn ${isActive ? 'active' : ''}`}
                        onClick={() => triggerEmergency(key)}
                      >
                        <ShieldAlert size={18} />
                        <span>{isActive ? `Clear ${key.split('_')[1]}` : `Override ${key.split('_')[1]}`}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Real-time System Log Feed */}
              <div className="glass-panel" style={{ flex: 1 }}>
                <div className="panel-header">
                  <div className="panel-title">
                    <Activity size={18} style={{ color: 'var(--emerald-accent)' }} />
                    Live Neural Telemetry Stream
                  </div>
                </div>

                <div className="log-stream-container">
                  {eventLogs.map((log, index) => (
                    <div key={index} className="log-item">
                      <div className="log-msg">
                        {log.type === 'emergency' && <ShieldAlert size={14} style={{ color: 'var(--rose-accent)' }} />}
                        {log.type === 'success' && <CheckCircle2 size={14} style={{ color: 'var(--emerald-accent)' }} />}
                        {log.type === 'warning' && <AlertTriangle size={14} style={{ color: 'var(--amber-accent)' }} />}
                        {log.type === 'info' && <Radio size={14} style={{ color: 'var(--cyan-accent)' }} />}
                        <span>{log.msg}</span>
                      </div>
                      <div className="log-time">{log.time}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: INTERSECTION VIEW MAP */}
        {activeTab === 'intersection' && (
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Cpu size={22} style={{ color: 'var(--cyan-accent)' }} /> 
                Expanded Intersection Map Visualizer
              </div>
            </div>
            <IntersectionView lanes={lanes} onTriggerEmergency={triggerEmergency} />
          </div>
        )}

        {/* TAB 3: HUD CAMERA FEEDS GRID */}
        {activeTab === 'cameras' && (
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title">
                <Camera size={22} style={{ color: 'var(--cyan-accent)' }} />
                4-Lane AI HUD Video Stream Feeds
              </div>
              <div className="panel-subtitle">YOLOv8 Real-Time Vehicle Detection Feeds</div>
            </div>

            <div className="camera-feeds-grid">
              {Object.entries(lanes).map(([key, data]) => (
                <TrafficPanel 
                  key={key} 
                  direction={DIRECTION_MAP[key]} 
                  api="ul_80b420183342ee1ce7a3f6ad0f6a5f43e16f8f6e" 
                />
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DEEP ANALYTICS & LOGS */}
        {activeTab === 'analytics' && (
          <div className="dashboard-grid-layout">
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <BarChart3 size={20} style={{ color: 'var(--cyan-accent)' }} />
                  Traffic Density & Throughput Metrics
                </div>
              </div>
              <div style={{ padding: '1rem 0', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {Object.entries(lanes).map(([key, data]) => (
                  <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: 600 }}>
                      <span>{key.replace('_', ' ')} ({DIRECTION_MAP[key]})</span>
                      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--cyan-accent)' }}>
                        {data.count} Vehicles detected (Signal: {data.light})
                      </span>
                    </div>
                    <div className="queue-density-bar" style={{ height: '10px' }}>
                      <div 
                        className="queue-density-fill" 
                        style={{ 
                          width: `${Math.min((data.count / 25) * 100, 100)}%`,
                          background: data.light === 'Green' ? 'var(--emerald-accent)' : 'var(--cyan-accent)'
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title">
                  <Activity size={20} style={{ color: 'var(--emerald-accent)' }} />
                  System Activity Log
                </div>
              </div>
              <div className="log-stream-container" style={{ maxHeight: '420px' }}>
                {eventLogs.map((log, index) => (
                  <div key={index} className="log-item">
                    <div className="log-msg">
                      <span>{log.msg}</span>
                    </div>
                    <div className="log-time">{log.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
