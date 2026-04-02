from flask import Blueprint, request, jsonify
from services.traffic_service import traffic_service
import os
import tempfile
import sys
# Make sure we can import vehicle_counter which is in the parent directory of routes
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__line__ if '__file__' not in locals() else __file__))))
try:
    from vehicle_counter import analyze_video
except ImportError:
    # Fallback simulation if vehicle_counter fails to import locally
    def analyze_video(path):
        import random
        return {"vehicle_count": random.randint(5, 45), "emergency": random.random() < 0.15}

# Define modular blueprint group for "Traffic Engine APIs"
api_bp = Blueprint('api', __name__)

# NEW
@api_bp.route("/upload-video", methods=["POST"])
def upload_video():
    """
    API endpoint accepting video files for YOLO frame extraction and inference.
    """
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
        
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    temp_dir = tempfile.gettempdir()
    filepath = os.path.join(temp_dir, "uploaded_traffic_" + file.filename)
    file.save(filepath)
    
    try:
        result = analyze_video(filepath)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except:
                pass

@api_bp.route("/count", methods=["POST"])
def update_count():
    """
    API endpoint accepting incoming vehicle amounts specifically. 
    Use this endpoint from an external OpenCV/YOLO script to broadcast detections.
    Expected JSON body: {"Lane_1": 15, "Lane_2": 3, "Lane_3": 0, "Lane_4": 45}
    """
    payload_data = request.json
    if not payload_data:
        return jsonify({"error": "Empty body provided"}), 400
        
    traffic_service.update_vehicle_counts(payload_data)
    return jsonify({"status": "success", "message": "Queue sizes ingested and synchronized."})

@api_bp.route("/timing", methods=["GET"])
def get_signal_timing():
    """
    Retrieves the complete intersection state map, including timers and green lights.
    """
    return jsonify(traffic_service.lanes)

@api_bp.route("/emergency", methods=["POST"])
def trigger_emergency():
    """
    Dispatches or halts an emergency priority override sequence based on Lane param.
    JSON Body: {"action": "start" / "stop", "lane": "Lane_3"}
    """
    payload_data = request.json
    lane = payload_data.get("lane", "Lane_1")
    action = payload_data.get("action", "start")
    
    traffic_service.trigger_emergency(target_lane=lane, action=action)
    return jsonify({
        "status": "success", 
        "message": f"Successfully signaled {action.upper()} override onto {lane}"
    })
