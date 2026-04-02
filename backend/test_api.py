import requests
import numpy as np
import cv2

# Create a dummy image
dummy = np.zeros((640, 640, 3), dtype=np.uint8)
_, img_encoded = cv2.imencode('.jpg', dummy)
file_bytes = img_encoded.tobytes()

url = "https://predict-69c6dd74a4c56a6c5558-dproatj77a-em.a.run.app/predict"
api_key = "ul_80b420183342ee1ce7a3f6ad0f6a5f43e16f8f6e"
args = {"conf": 0.25, "iou": 0.7, "imgsz": 640}

response = requests.post(
    url,
    headers={"Authorization": f"Bearer {api_key}"},
    data=args,
    files={"file": ("frame.jpg", file_bytes, "image/jpeg")},
)

print(response.status_code)
print(response.text)
