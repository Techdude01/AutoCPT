from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS, cross_origin  # Import CORS
from flask_sock import Sock
import json
from dotenv import load_dotenv
import os
import cv2
from werkzeug.utils import secure_filename
from ultralytics import YOLO  # Import YOLO model
from datetime import datetime
from test_groq import get_cpt_codes

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS globally
sock = Sock(app)

# Image upload configuration
UPLOAD_FOLDER = 'static/uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Store transcription history
cpt_history = []
full_transcription = ""
transcription_start_time = None


# Function to check if the uploaded file is an allowed image type
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS
OUTPUTS_FOLDER = 'static/outputs'
app.config['OUTPUTS_FOLDER'] = OUTPUTS_FOLDER

# Ensure both upload and outputs folders exist
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
if not os.path.exists(OUTPUTS_FOLDER):
    os.makedirs(OUTPUTS_FOLDER)

# Run inference on the image
def testDetect(image_path):
    mName = "best.pt"  # Model name or path
    model = YOLO(mName)  # Load the YOLO model

    # Load the image to test
    img = cv2.imread(image_path)

    # Perform inference (object detection)
    results = model(img)

    # Draw bounding boxes and labels
    img_with_detections = results[0].plot()

    # Save the image with bounding boxes
    output_filename = os.path.basename(image_path)
    output_image_path = os.path.join(OUTPUTS_FOLDER, output_filename)
    cv2.imwrite(output_image_path, img_with_detections)

    # Return the URL path that the frontend should use
    return f"/static/outputs/{output_filename}"


# Index route to render the main page
@app.route('/')
def index():
    return render_template('index.html')


# Handle image upload and provide CORS headers
@app.route('/upload-image', methods=['POST'])
def upload_image():
    if request.method == 'POST':
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


# Serve uploaded images with CORS headers
@app.route('/static/uploads/<filename>')
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def uploaded_file(filename):
    response = send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    response.headers.add("Access-Control-Allow-Origin", "*")  # Add CORS header for image serving
    return response


# Serve processed images (bounding boxes) with CORS headers
@app.route('/static/outputs/<filename>')
@cross_origin(origin='localhost', headers=['Content-Type', 'Authorization'])
def output_file(filename):
    response = send_from_directory('static/outputs', filename)
    response.headers.add("Access-Control-Allow-Origin", "*")  # Add CORS header for processed images
    return response


# Function to generate CPT codes based on transcribed text
def generate_cpt_codes(transcribed_text):
    global full_transcription, transcription_start_time
    full_transcription += transcribed_text.lower()

    if transcription_start_time is None:
        transcription_start_time = datetime.now()

    if (datetime.now() - transcription_start_time).seconds > 5:
        detected_codes = get_cpt_codes(full_transcription)
        transcription_start_time = datetime.now()
        return detected_codes if detected_codes else {}

    return {}


# WebSocket route to receive transcriptions and return CPT codes
@sock.route('/ws')
def websocket_connection(ws):
    global cpt_history
    while True:
        data = ws.receive()
        if not data:
            continue
        try:
            received_json = json.loads(data)
            received_text = received_json.get("text", "").strip()

            if received_text:
                cpt_codes = generate_cpt_codes(received_text)

                # Add new CPT codes to history
                for key, value in cpt_codes.items():
                    if {key: value} not in cpt_history:
                        cpt_history.append({key: value})

                ws.send(json.dumps({"cpt_history": cpt_history}))

        except json.JSONDecodeError:
            ws.send(json.dumps({"error": "Invalid JSON received"}))


# Run the Flask application
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)  # Update port as needed