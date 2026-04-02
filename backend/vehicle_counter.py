import cv2
import requests
from ultralytics import YOLO

# 1. Load the YOLOv5 Nano model which is highly optimized for CPUs (normal laptops).
# Note: 'yolov5nu.pt' tells the Ultralytics engine to use YOLOv5 architecture.
# It will automatically install the small weights file (approx 5MB) on first run.
model = YOLO('yolov5nu.pt')

# COCO dataset class IDs for vehicles:
# 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck
VEHICLE_CLASSES = [1, 2, 3, 5, 7]

# NEW - function to process uploaded video for the API
def analyze_video(video_path):
    url = "https://predict-69c6dd74a4c56a6c5558-dproatj77a-em.a.run.app/predict"
    api_key = "ul_80b420183342ee1ce7a3f6ad0f6a5f43e16f8f6e"
    args = {"conf": 0.25, "iou": 0.7, "imgsz": 640}


    try:
        # The remote API supports image and video files
        with open(video_path, "rb") as f:
            response = requests.post(
                url,
                headers={"Authorization": f"Bearer {api_key}"},
                data=args,
                files={"file": f},
            )
        
        response.raise_for_status()
        data = response.json()
        
        predictions = data.get("predictions", [])
        
        normal = 0
        emergency = 0
        counted_objects = set()
        
        for obj in predictions:
            # deduplicate overlapping boxes identical to frontend logic
            obj_id = f"{obj.get('x', '')}-{obj.get('y', '')}"
            
            if obj_id not in counted_objects:
                counted_objects.add(obj_id)
                cls_name = obj.get("class", "").lower()
                if cls_name == "ambulance" or cls_name == "fire_truck":
                    emergency += 1
                else:
                    normal += 1
            
        return {
            "vehicle_count": normal + emergency,
            "normal_count": normal,
            "emergency_count": emergency,
            "emergency": emergency > 0,
            "predictions": predictions
        }
    except Exception as e:
        print(f"Error calling remote API: {e}")
        # Fallback to defaults
        return {
            "vehicle_count": 0,
            "emergency": False
        }

if __name__ == "__main__":
    # 2. Open the video file
    video_path = 'traffic.mp4'  # Replace with the path to your video file
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        print(f"Error: Could not open video file {video_path}. Make sure it exists!")
        exit()

    print("Processing video... Press 'q' to quit.")

    while cap.isOpened():
        success, frame = cap.read()
        if not success:
            print("Video finished or frame could not be read.")
            break

        # OPTIMIZATION: Resize the frame to a smaller resolution (640x480).
        # This significantly reduces CPU load while maintaining detection accuracy.
        frame = cv2.resize(frame, (640, 480))

        # 3. Run Inference on the frame
        # We restrict processing to `classes=VEHICLE_CLASSES` and a confidence threshold of `0.4`
        results = model(frame, classes=VEHICLE_CLASSES, conf=0.4, verbose=False)

        # 4. Count vehicles
        # results[0].boxes contains all the detected bounding boxes
        boxes = results[0].boxes
        vehicle_count = len(boxes)

        # Print the count to the console
        print(f"Total vehicles in frame: {vehicle_count}")

        # 5. Display Bounding Boxes
        # results[0].plot() generates a new frame with the boxes and labels painted on
        annotated_frame = results[0].plot()

        # Draw the total count onto the top-left of the video frame
        cv2.putText(
            annotated_frame, 
            f'Vehicles: {vehicle_count}', 
            (20, 50), 
            cv2.FONT_HERSHEY_SIMPLEX, 
            1,       # font scale
            (0, 255, 0), # color (BGR) -> green
            2,       # thickness
            cv2.LINE_AA
        )

        # Show the video player window
        cv2.imshow("YOLOv5 Laptop-Optimized Vehicle Tracker", annotated_frame)

        # Exit mechanism (Wait for 1ms, if 'q' is pressed, break loop)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            print("User manually interrupted the video stream.")
            break

    # Clean up resources
    cap.release()
    cv2.destroyAllWindows()

