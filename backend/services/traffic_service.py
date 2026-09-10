import time
import threading
from extensions import socketio

class TrafficService:
    def __init__(self):
        # Default intersection dictionary
        self.lanes = {
            "Lane_1": {"count": 0, "light": "Red", "timer": 0, "is_emergency": False},
            "Lane_2": {"count": 0, "light": "Green", "timer": 15, "is_emergency": False},
            "Lane_3": {"count": 0, "light": "Red", "timer": 0, "is_emergency": False},
            "Lane_4": {"count": 0, "light": "Red", "timer": 0, "is_emergency": False},
        }
        self.current_green_lane = "Lane_2"
        self.emergency_mode = False
        
        # Start the background control loop asynchronously
        self.worker_thread = threading.Thread(target=self._controller_loop, daemon=True)
        self.worker_thread.start()

    def update_vehicle_counts(self, counts_dict):
        """Update vehicle estimates dynamically from an eternal Vision Model Source."""
        for lane, count in counts_dict.items():
            if lane in self.lanes:
                self.lanes[lane]["count"] = max(0, count)
        self._push_update()

    def trigger_emergency(self, target_lane, action):
        """Simulate an emergency override action."""
        if action == "start":
            self.emergency_mode = True
            
            # Immediately halt all normal flow
            for lane in self.lanes:
                self.lanes[lane]["light"] = "Red"
                self.lanes[lane]["is_emergency"] = False
                
            # Direct the path towards target lane
            if target_lane in self.lanes:
                self.lanes[target_lane]["light"] = "Green"
                self.lanes[target_lane]["is_emergency"] = True
                self.current_green_lane = target_lane
            
            # 1st Socket Event specifically for Emergency Systems
            try:
                if socketio.server is not None:
                    socketio.emit("emergency_alert", {"lane": target_lane, "status": "active", "message": f"Priority vehicle detected in {target_lane}."})
            except Exception:
                pass
        else:
            # End emergency mode
            self.emergency_mode = False
            for lane in self.lanes:
                self.lanes[lane]["is_emergency"] = False
            
            # Allocate a 5s grace period before the AI resumes normal logic
            self.lanes[self.current_green_lane]["timer"] = 5
            
            # Clear emergency event
            try:
                if socketio.server is not None:
                    socketio.emit("emergency_alert", {"lane": "none", "status": "resolved", "message": "Grid restored to AI Optimization Flow."})
            except Exception:
                pass
            
        # 2nd routine Socket Event updating the entire state tree
        self._push_update()

    def _calculate_dynamic_time(self, vehicle_count):
        """Intelligently calculate green light timer based on local volume."""
        MIN_TIME = 15
        MAX_TIME = 60
        calc = MIN_TIME + (vehicle_count * 2)
        return max(MIN_TIME, min(calc, MAX_TIME))

    def _push_update(self):
        """Emit state to all connected frontends."""
        try:
            if socketio.server is not None:
                socketio.emit("traffic_update", self.lanes)
        except Exception:
            pass

    def _controller_loop(self):
        """The AI State Engine - Constantly loops and shifts lights in the background."""
        while True:
            time.sleep(1) # Engine ticks once per second
            
            if self.emergency_mode:
                self._push_update()
                continue
                
            current_lane_state = self.lanes[self.current_green_lane]
            
            if current_lane_state["timer"] > 0:
                current_lane_state["timer"] -= 1
            else:
                # Timer exhausted - transition to next Lane
                current_lane_state["light"] = "Yellow"
                self._push_update()
                time.sleep(3) # Wait 3s on yellow
                
                current_lane_state["light"] = "Red"
                
                # Retrieve the next sequential lane
                lane_keys = list(self.lanes.keys())
                current_index = lane_keys.index(self.current_green_lane)
                next_index = (current_index + 1) % len(lane_keys)
                
                self.current_green_lane = lane_keys[next_index]
                next_lane_state = self.lanes[self.current_green_lane]
                
                # Calculate dynamic queue time for this new green light
                next_lane_state["light"] = "Green"
                next_lane_state["timer"] = self._calculate_dynamic_time(next_lane_state["count"])

            self._push_update()

# Global Singleton Service
traffic_service = TrafficService()
