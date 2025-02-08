from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
import sounddevice as sd
import numpy as np
import io
import base64

# Record audio for 1 minute
sample_rate = 44100
duration = 10  # seconds
recording = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1)
sd.wait()  # Wait until recording is finished

# Convert audio to base64 string
audio_bytes = io.BytesIO()
np.save(audio_bytes, recording)
audio_base64 = base64.b64encode(audio_bytes.getvalue()).decode('utf-8')
response = groq.audio.transcriptions.create(
    model="whisper-large-v3-turbo",
    file=audio_base64,
    response_format="text"
)

print(response.text)