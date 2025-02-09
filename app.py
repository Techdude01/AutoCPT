from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sock import Sock
import json
from dotenv import load_dotenv
import os
from test_groq import get_cpt_codes, gen_bill, get_patient_id, get_account_id, get_moneyz
from datetime import datetime
load_dotenv()

app = Flask(__name__)
CORS(app)
sock = Sock(app)

cpt_history = {}

selected_patient_id = None
selected_account_id = None
full_transcription = ""
transcription_start_time = None

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/select_patient', methods=['POST'])
def select_patient():
    global selected_patient_id, selected_account_id
    data = request.json
    print(data)
    selected_patient_id = get_patient_id(data["first_name"], data["last_name"])
    selected_account_id = get_account_id(selected_patient_id)
    if selected_patient_id:
        return jsonify({"message": "Patient selected", "patient_id": selected_patient_id, "account_id": selected_account_id}), 200
    else:
        return jsonify({"message": "Patient not found"}), 404
    
@app.route('/stop_rec', methods=['POST'])
def stop_rec():
    global selected_patient_id, selected_account_id, full_transcription, transcription_start_time, cpt_history
    cpt_cost = get_moneyz(cpt_history, full_transcription)
    gen_bill(selected_account_id, cpt_cost)
    
    selected_patient_id = None
    selected_account_id = None
    full_transcription = ""
    transcription_start_time = None
    cpt_history = {}
    return jsonify({"message": "Recording stopped"}), 200

def generate_cpt_codes(transcribed_text):
    global transcription_start_time, cpt_codes
    if transcription_start_time is None:
        transcription_start_time = datetime.now()
    print("Generating CPT codes")
    detected_codes = get_cpt_codes(transcribed_text.lower())
    transcription_start_time = datetime.now()
    if detected_codes:
        detected_codes = {f"CPT {k}": v for k, v in detected_codes.items() if k not in cpt_history}
        return detected_codes
    return {}

@sock.route('/ws')
def websocket_connection(ws):
    global cpt_history, transcription_start_time, full_transcription
    while True:
        data = ws.receive()
        print(data)
        if not data:
            continue

        try:
            received_json = json.loads(data)

            received_text = received_json.get("text", "").strip()
            

            if received_text:
                cpt_codes = generate_cpt_codes(received_text)
                if cpt_codes:
                    cpt_history.update(cpt_codes)
                ws.send(json.dumps({"cpt_history": cpt_history}))

        except json.JSONDecodeError:
            ws.send(json.dumps({"error": "Invalid JSON received"}))

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT") if os.getenv("PORT") else 5001)
