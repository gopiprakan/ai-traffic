def calculate_signal_timings(lanes: dict) -> dict:
    """
    Calculates the green signal duration based on the number of vehicles queued in each lane.

    Logic rules:
    - Base time allocation per queue is 15 seconds.
    - Each vehicle adds an additional 2 seconds.
    - The final time is capped strictly between 15 seconds and 60 seconds.

    Args:
        lanes (dict): Dictionary mapping lane ID to current vehicle count.
                      Example: {"lane1": 5, "lane2": 50, "lane3": 0, "lane4": 12}
    
    Returns:
        dict: Dictionary mapping lane ID to computed green signal duration in seconds.
    """
    MIN_TIME = 15
    MAX_TIME = 60
    TIME_PER_VEHICLE = 2  # 2 seconds extra per vehicle is standard for most intersections
    
    timings = {}
    
    for lane, vehicle_count in lanes.items():
        # Formula: Minimum time + proportional time scaling
        calculated_time = MIN_TIME + (vehicle_count * TIME_PER_VEHICLE)
        
        # Clamp between the configured MIN_TIME and MAX_TIME limits
        # max() prevents it dropping below 15, min() caps it from blowing past 60.
        final_time = max(MIN_TIME, min(MAX_TIME, calculated_time))
        
        timings[lane] = final_time
        
    return timings

# --------------------------
# Quick Test / Example Usage:
# --------------------------
if __name__ == "__main__":
    # Simulate a typical traffic intersection
    live_traffic_counts = {
        "lane1": 5,   # Moderate traffic (Expected: 15 + 10 = 25s)
        "lane2": 0,   # Empty lane (Expected: 15s - enforced by MIN_TIME)
        "lane3": 50,  # Huge traffic jam (Expected: 115s -> cap clamps to 60s)
        "lane4": 15   # Busy lane (Expected: 15 + 30 = 45s)
    }
    
    computed_timings = calculate_signal_timings(live_traffic_counts)
    
    print("🚦 Calculated Green Signal Timers:")
    for l, t in computed_timings.items():
        print(f" - {l.capitalize()}: {t} seconds")
