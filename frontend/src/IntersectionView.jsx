import React from 'react';
import { Cpu, AlertTriangle, Car, Clock, Navigation, Zap } from 'lucide-react';

const LANE_DIRECTIONS = {
  Lane_1: { name: "South-West", code: "SW", cls: "sw" },
  Lane_2: { name: "North-West", code: "NW", cls: "nw" },
  Lane_3: { name: "North-East", code: "NE", cls: "ne" },
  Lane_4: { name: "South-East", code: "SE", cls: "se" },
};

// Calculate SVG stroke offset for countdown ring (radius 22, circumference ~138)
const CIRCUMFERENCE = 138;

export default function IntersectionView({ lanes, onTriggerEmergency }) {
  const getProgressOffset = (timer, maxTimer = 30) => {
    if (!timer || timer <= 0) return CIRCUMFERENCE;
    const pct = Math.min(timer / maxTimer, 1);
    return CIRCUMFERENCE * (1 - pct);
  };

  const getLightColor = (light) => {
    if (light === 'Green') return '#10b981';
    if (light === 'Yellow') return '#f59e0b';
    return '#f43f5e';
  };

  const getDensityColor = (count) => {
    if (count > 15) return '#f43f5e'; // Heavy
    if (count > 8) return '#f59e0b';  // Medium
    return '#10b981';                 // Low
  };

  return (
    <div className="intersection-container">
      <div className="intersection-canvas-card">
        {/* Crossroad Layout Visualizer */}
        <div className="road-cross">
          <div className="road-v"></div>
          <div className="road-h"></div>
          
          {/* AI Intersection Core Center */}
          <div className="intersection-center-box">
            <div className="ai-core-chip" title="AI Flow Engine Active">
              <Zap size={20} />
            </div>
          </div>

          {/* Render 4 Quadrant Lane Nodes */}
          {Object.entries(lanes).map(([key, data]) => {
            const laneInfo = LANE_DIRECTIONS[key] || { name: key, code: key, cls: "nw" };
            const isActive = data.light === 'Green';
            const isEmergency = data.is_emergency;

            return (
              <div 
                key={key} 
                className={`lane-node-card ${laneInfo.cls} ${isActive ? 'active-green' : ''} ${isEmergency ? 'emergency-override' : ''}`}
              >
                <div className="lane-header-row">
                  <div className="lane-title">
                    <Navigation size={12} style={{ transform: 'rotate(45deg)', color: 'var(--cyan-accent)' }} />
                    {laneInfo.name} ({laneInfo.code})
                  </div>
                  {isEmergency && <span className="override-tag">EMERGENCY</span>}
                </div>

                {/* Traffic Light Housing */}
                <div className="traffic-light-unit">
                  <div className={`bulb-led red ${data.light === 'Red' ? 'on' : ''}`}></div>
                  <div className={`bulb-led yellow ${data.light === 'Yellow' ? 'on' : ''}`}></div>
                  <div className={`bulb-led green ${data.light === 'Green' ? 'on' : ''}`}></div>
                </div>

                {/* Circular SVG Timer Ring */}
                <div className="timer-ring-wrapper">
                  <svg className="timer-ring-svg" viewBox="0 0 50 50">
                    <circle className="timer-ring-bg" cx="25" cy="25" r="22" />
                    <circle 
                      className="timer-ring-progress" 
                      cx="25" 
                      cy="25" 
                      r="22"
                      stroke={getLightColor(data.light)}
                      strokeDasharray={CIRCUMFERENCE}
                      strokeDashoffset={getProgressOffset(data.timer, 30)}
                      fill="transparent"
                    />
                  </svg>
                  <span className="timer-ring-text">
                    {data.timer > 0 ? `${data.timer}s` : '--'}
                  </span>
                </div>

                {/* Queue Stats Pill */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Car size={12}/> Vehicles:
                  </span>
                  <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>
                    {data.count}
                  </strong>
                </div>

                {/* Queue Density Fill Bar */}
                <div className="queue-density-bar" title={`Queue Count: ${data.count}`}>
                  <div 
                    className="queue-density-fill" 
                    style={{ 
                      width: `${Math.min((data.count / 20) * 100, 100)}%`,
                      background: getDensityColor(data.count)
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
