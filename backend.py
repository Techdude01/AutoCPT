from groq import Groq
import os
from dotenv import load_dotenv
import wave
import struct

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

# Convert audio to WAV file
wav_file_path = "temp_recording.wav"
with wave.open(wav_file_path, 'wb') as wav_file:
    wav_file.setnchannels(1)  # Mono
    wav_file.setsampwidth(2)  # 2 bytes per sample
    wav_file.setframerate(sample_rate)
    # Convert float32 array to int16 PCM
    wav_data = (recording * 32767).astype(np.int16)
    wav_file.writeframes(wav_data.tobytes())

# Open and send the WAV file
with open(wav_file_path, 'rb') as audio_file:
    response = groq.audio.transcriptions.create(
        model="whisper-large-v3-turbo",
        file=audio_file,
        response_format="text"
    )

# Clean up temporary file
os.remove(wav_file_path)

print(response.text)