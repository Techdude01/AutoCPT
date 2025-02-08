from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from flask_sock import Sock
import json
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)
sock = Sock(app)

cpt_history = []

full_transcription = ""

@app.route('/')
def index():
    return render_template('index.html')

def generate_cpt_codes(transcribed_text):
    global full_transcription
    full_transcription += transcribed_text.lower()
    cpt_dict = {
        "consultation": "99241",
        "physical examination": "99386",
        "surgery": "10140",
        "therapy": "97110",
        "injection": "96372"
    }

    detected_codes = {word: cpt_dict[word] for word in cpt_dict if word in transcribed_text.lower()}
    return detected_codes if detected_codes else {}

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
                
                for key, value in cpt_codes.items():
                    if {key: value} not in cpt_history:
                        cpt_history.append({key: value})
                
                ws.send(json.dumps({"cpt_history": cpt_history}))

        except json.JSONDecodeError:
            ws.send(json.dumps({"error": "Invalid JSON received"}))

if __name__ == '__main__':
    app.run(debug=True, port=os.getenv("PORT") if os.getenv("PORT") else 5001)
