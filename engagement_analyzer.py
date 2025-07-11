# dont change
import cv2
import numpy as np
import json
import sys
import base64
import mediapipe as mp
import time

# Initialize MediaPipe
mp_face_detection = mp.solutions.face_detection
mp_face_mesh = mp.solutions.face_mesh
face_detection = mp_face_detection.FaceDetection(model_selection=1, min_detection_confidence=0.3)
face_mesh = mp_face_mesh.FaceMesh(max_num_faces=1, min_detection_confidence=0.5, min_tracking_confidence=0.5)

def calculate_engagement(face_landmarks):
    # Eye landmarks for EAR
    left_eye_indices = [33, 160, 158, 133, 153, 144]
    right_eye_indices = [362, 385, 387, 263, 373, 380]

    def eye_aspect_ratio(landmarks, indices):
        points = np.array([(landmarks.landmark[i].x, landmarks.landmark[i].y) for i in indices])
        vertical1 = np.linalg.norm(points[1] - points[5])
        vertical2 = np.linalg.norm(points[2] - points[4])
        horizontal = np.linalg.norm(points[0] - points[3])
        return (vertical1 + vertical2) / (2.0 * horizontal + 1e-6)

    # Mouth landmarks for MAR
    left = face_landmarks.landmark[61]
    right = face_landmarks.landmark[291]
    top = face_landmarks.landmark[13]
    bottom = face_landmarks.landmark[14]

    mouth_horizontal = np.linalg.norm(np.array([left.x, left.y]) - np.array([right.x, right.y]))
    mouth_vertical = np.linalg.norm(np.array([top.x, top.y]) - np.array([bottom.x, bottom.y]))
    mar = mouth_vertical / (mouth_horizontal + 1e-6)

    # EAR calculation
    left_ear = eye_aspect_ratio(face_landmarks, left_eye_indices)
    right_ear = eye_aspect_ratio(face_landmarks, right_eye_indices)
    ear = (left_ear + right_ear) / 2.0

    # Normalize EAR: 0.15 (closed) to 0.3 (fully open)
    norm_ear = min(1.0, max(0.0, (ear - 0.15) / 0.15))

    # Normalize MAR: 0.2 (closed) to 0.6 (wide open)
    norm_mar = min(1.0, max(0.0, (mar - 0.2) / 0.4))

    # Engagement score: more eye open = higher engagement, more mouth open = less engagement
    engagement = (norm_ear * 0.6) + ((1.0 - norm_mar) * 0.4)
    engagement = max(0.0, min(1.0, engagement))

    # Debug print
    # print(f"EAR: {ear:.3f}, MAR: {mar:.3f}, Engagement: {engagement:.3f}")

    return round(engagement, 3), round(ear, 3), round(mar, 3)

def process_frame(image_base64):
    try:
        # Decode base64 image
        image_data = base64.b64decode(image_base64)
        nparr = np.frombuffer(image_data, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None or frame.size == 0:
            return {"engagement": None, "face_image": None, "debug_image": None}

        # Convert to RGB
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # Face detection
        results = face_detection.process(rgb_frame)
        if not results.detections:
            return {"engagement": None, "face_image": None, "debug_image": None}

        # Get bounding box
        bbox = results.detections[0].location_data.relative_bounding_box
        ih, iw, _ = frame.shape
        x = max(0, int(bbox.xmin * iw))
        y = max(0, int(bbox.ymin * ih))
        w = min(iw - x, int(bbox.width * iw))
        h = min(ih - y, int(bbox.height * ih))

        if w <= 0 or h <= 0:
            return {"engagement": None, "face_image": None, "debug_image": None}

        # Crop and resize face ROI
        face_roi = frame[y:y+h, x:x+w]
        if face_roi.size == 0:
            return {"engagement": None, "face_image": None, "debug_image": None}
        face_roi = cv2.resize(face_roi, (320, 320))

        # Face mesh
        face_roi_rgb = cv2.cvtColor(face_roi, cv2.COLOR_BGR2RGB)
        mesh_results = face_mesh.process(face_roi_rgb)
        if not mesh_results.multi_face_landmarks:
            return {"engagement": None, "face_image": None, "debug_image": None}

        # Calculate engagement
        engagement, ear, mar = calculate_engagement(mesh_results.multi_face_landmarks[0])

        # Draw landmarks
        debug_face = face_roi.copy()
        for landmark in mesh_results.multi_face_landmarks[0].landmark:
            x_debug = int(landmark.x * debug_face.shape[1])
            y_debug = int(landmark.y * debug_face.shape[0])
            cv2.circle(debug_face, (x_debug, y_debug), 1, (0, 255, 0), -1)

        # Encode output images
        _, face_buffer = cv2.imencode('.jpg', face_roi, [int(cv2.IMWRITE_JPEG_QUALITY), 70])
        _, debug_buffer = cv2.imencode('.jpg', debug_face, [int(cv2.IMWRITE_JPEG_QUALITY), 70])

        return {
            "engagement": engagement,
            "ear": ear,
            "mar": mar,
            "face_image": base64.b64encode(face_buffer).decode('utf-8'),
            "debug_image": base64.b64encode(debug_buffer).decode('utf-8')
        }

    except Exception as e:
        return {"error": f"Process error: {str(e)}"}

# Main loop
if __name__ == "__main__":
    while True:
        try:
            line = sys.stdin.readline().strip()
            if not line:
                time.sleep(0.01)
                continue

            data = json.loads(line)
            request_id = data["requestId"]
            image_base64 = data["image"]

            start_time = time.time()
            result = process_frame(image_base64)
            processing_time = time.time() - start_time

            result["requestId"] = request_id
            result["processing_time"] = round(processing_time, 4)

            json_str = json.dumps(result)
            sys.stdout.write(json_str + '\n')
            sys.stdout.flush()

        except json.JSONDecodeError:
            sys.stdout.write(json.dumps({"error": "Invalid JSON input"}) + '\n')
            sys.stdout.flush()
        except KeyError:
            sys.stdout.write(json.dumps({"error": "Missing required fields"}) + '\n')
            sys.stdout.flush()
        except Exception as e:
            sys.stdout.write(json.dumps({"error": f"Unexpected error: {str(e)}"}) + '\n')
            sys.stdout.flush()
