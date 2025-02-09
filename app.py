from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sock import Sock
import json
from dotenv import load_dotenv
import os
from test_groq import get_cpt_codes
from datetime import datetime
import cv2
from werkzeug.utils import secure_filename
from ultralytics import YOLO  # Add this import
app = Flask(__name__)

load_dotenv()

CORS(app, resources={
    r"/upload-image": {
        "origins": ["http://localhost:5175"],  # Update to match your frontend port
        "methods": ["POST"],
        "allow_headers": ["Content-Type", "Accept"],
        "expose_headers": ["Content-Type"]
    }
})
# CORS(app)

sock = Sock(app)

cpt_history = []

# Image upload configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

OUTPUTS_FOLDER = 'static/outputs'
app.config['OUTPUTS_FOLDER'] = OUTPUTS_FOLDER
# Ensure both upload and outputs folders exist
if not os.path.exists(OUTPUTS_FOLDER):
    os.makedirs(OUTPUTS_FOLDER)

full_transcription = ""
transcription_start_time = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Run inference on the image
def testDetect(image_path):
    mName = "best.pt"  # Model name or path
    model = YOLO(mName)  # Load the YOLO model

    # Load the image to test
    img = cv2.imread(image_path)

    # Perform inference (object detection)
    results = model(img)

    # Create a copy of the original image for drawing
    img_with_detections = img.copy()

    # Get the bounding boxes from results
    boxes = results[0].boxes.xyxy.cpu().numpy()  # Get boxes in xyxy format

    # Draw only the bounding boxes without labels
    for box in boxes:
        x1, y1, x2, y2 = map(int, box[:4])  # Convert coordinates to integers
        # Draw rectangle with specified color and thickness
        cv2.rectangle(img_with_detections, (x1, y1), (x2, y2), (0, 255, 0), 2)  # Green color, thickness=2

    # Save the image with bounding boxes
    output_filename = os.path.basename(image_path)
    output_image_path = os.path.join(OUTPUTS_FOLDER, output_filename)
    cv2.imwrite(output_image_path, img_with_detections)

    # Return the URL path that the frontend should use
    return f"/static/outputs/{output_filename}"

@app.route('/upload-image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        upload_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(upload_path)

        # Run inference on the uploaded image
        result_image_url = testDetect(upload_path)

        return jsonify({'imageUrl': result_image_url}), 200

    return jsonify({'error': 'File type not allowed'}), 400

@app.route('/')
def index():
    return render_template('index.html')

def generate_cpt_codes(transcribed_text):
    global full_transcription, transcription_start_time
    full_transcription = transcribed_text.lower()
    if transcription_start_time is None:
        transcription_start_time = datetime.now()
    if (datetime.now() - transcription_start_time).seconds > 5:
        detected_codes = get_cpt_codes(full_transcription)
        transcription_start_time = datetime.now()
        return detected_codes if detected_codes else {}
    return {}

@sock.route('/ws')
def websocket_connection(ws):
    global cpt_history, transcription_start_time, full_transcription
    while True:
        data = ws.receive()
        if not data:
            continue

        try:
            received_json = json.loads(data)
            if "stop" in received_json:
                print("Stopping transcription")
                transcription_start_time = None
                full_transcription = ""
                continue
            received_text = received_json.get("text", "").strip()
            

            if received_text:
                cpt_codes = generate_cpt_codes(received_text)
                
                for key, value in cpt_codes.items():
                    if {key: value} not in cpt_history:
                        cpt_history.append({key: value})
                
                ws.send(json.dumps({"cpt_history": cpt_history}))

        except json.JSONDecodeError:
            ws.send(json.dumps({"error": "Invalid JSON received"}))


if __name__ == '__main__':
    # Change port to match frontend expectations
    app.run(debug=True, host="0.0.0.0")