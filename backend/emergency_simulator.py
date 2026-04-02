import sys
import time
try:
    import requests
except ImportError:
    print("Error: The 'requests' module is missing. Install it using 'pip install requests'")
    sys.exit(1)

# API Endpoint of our existing Flask server
TRAFFIC_GRID_URL = "http://localhost:5000/api/emergency"

def trigger_emergency_signal(lane_id: str):
    """
    Simulates a hardware button trigger or GPS detection system.
    Sends a high-priority packet to the traffic grid to force a Green light.
    """
    try:
        payload = {"lane": lane_id, "action": "start"}
        response = requests.post(TRAFFIC_GRID_URL, json=payload)
        
        if response.status_code == 200:
            print(f"\n[SUCCESS] 🚨 SYSTEM OVERRIDE ACTIVE: All lanes RED except {lane_id} (GREEN)")
        else:
            print(f"\n[ERROR] Grid rejected overriding: HTTP {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("\n[CRITICAL] Server Offline! Ensure the Python backend (app.py) is running on port 5000.")

def reset_emergency_system():
    """
    Disengages the emergency override protocol and hands control
    back to the AI Optimization engine.
    """
    try:
        # Lane ID isn't critical for resetting, the whole system clears
        payload = {"lane": "Lane_1", "action": "stop"}
        response = requests.post(TRAFFIC_GRID_URL, json=payload)
        
        if response.status_code == 200:
            print("\n[SUCCESS] 🟢 EMERGENCY CLEARED: Control returned to AI Flow Tracker.")
        else:
            print(f"\n[ERROR] Grid rejected reset: HTTP {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("\n[CRITICAL] Server Offline! Cannot reach traffic grid API.")

def interactive_terminal():
    print("==============================================")
    print("🚑 EMERGENCY VEHICLE DETECTION SIMULATOR 🚒   ")
    print("==============================================")
    print("Simulate an incoming priority vehicle forcing immediate right-of-way.")
    print("Options:")
    print("  [1] Detect Ambulance in Lane 1")
    print("  [2] Detect Firetruck in Lane 2")
    print("  [3] Detect Police Chase in Lane 3")
    print("  [4] Detect Emergency in Lane 4")
    print("  [R] Reset System (Emergency Passed)")
    print("  [Q] Quit Simulator")
    
    while True:
        try:
            choice = input("\n[Detector Node] Enter command (1-4 / R / Q): ").strip().upper()
            
            if choice in ['1', '2', '3', '4']:
                target_lane = f"Lane_{choice}"
                print(f"\n>>> Detecting Siren... Transmitting Override Request to Grid for: {target_lane}")
                trigger_emergency_signal(target_lane)
                
            elif choice == 'R':
                print("\n>>> System Reset Button Pressed... Transmitting clear signal!")
                reset_emergency_system()
                
            elif choice == 'Q':
                print("Disconnecting Simulator Node. Goodbye!")
                break
                
            else:
                print("Invalid input. Please select 1-4, R, or Q.")
                
        except KeyboardInterrupt:
            print("\nAborted.")
            break

if __name__ == "__main__":
    interactive_terminal()
