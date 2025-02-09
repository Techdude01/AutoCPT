from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sock import Sock
import json
from dotenv import load_dotenv
import os
from test_groq import get_cpt_codes
from datetime import datetime
load_dotenv()

app = Flask(__name__)
CORS(app)
sock = Sock(app)

cpt_history = []




full_transcription = ""
transcription_start_time = None

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
    app.run(debug=True, port=os.getenv("PORT") if os.getenv("PORT") else 5001)
