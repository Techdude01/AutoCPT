# HackNYU2025
# AutoCPT

Doctors spend 16 hours a week on burdensome paperwork – time that could be better spent at the patient’s side delivering quality care. Additionally, almost $88 billion are spent on incorrect insurance billing every year. AutoCPT was born out of the need to streamline medical coding and reduce these costly inefficiencies.

AutoCPT is an intelligent assistant that leverages live speech recognition and AI to identify CPT (Current Procedural Terminology) codes directly from spoken language. In busy medical settings where documentation is time-consuming and prone to errors, AutoCPT provides an accessible, efficient, and accurate way to generate CPT codes in real-time.

---

## Features

- **Live Speech Recognition:** Capture spoken words using the browser’s or mobile device’s built-in speech recognition capabilities.
- **Real-Time CPT Code Extraction:** Process the transcribed text with AI to extract and display relevant CPT codes quickly.
- **Patient Selection & Billing:** Select a patient directly from the front-end interface to associate the generated CPT codes with their account. Once recording stops, a bill is generated automatically.
- **Cross-Platform Support:** Includes a web interface (built with React and Flask) and a mobile version (built with Expo and React Native) for seamless integration in different clinical settings.
- **AI-Powered Accuracy:** Integrates with external AI services to provide accurate code extraction and cost estimation based on Medicare fee schedules.

---

## Architecture

- **Backend:** A Flask server that handles HTTP routes and WebSocket connections. It processes incoming transcripts, utilizes AI (via third-party services) to extract CPT codes, and manages patient selection and billing.
- **Frontend (Web):** A React-based single-page application that supports voice recording, displays real-time transcripts, and shows extracted CPT codes using interactive UI components.
- **Mobile App:** An Expo/React Native version designed for on-the-go usage, providing similar functionalities as the web interface.
- **Integration with External APIs:** Uses environment-configured API keys (e.g., `GROQ_API_KEY`) to interact with AI services for chat completions and cost estimations.

---

## Prerequisites

- **Backend:**
  
- **Python 3.8+**
- **API Keys:**  
  AutoCPT requires API keys for integration with external AI services. These keys should be placed in a `.env` file in the root directory. For example, set the `GROQ_API_KEY`:
  ```env
  GROQ_API_KEY=your_api_key_here
  ```
- **Packages:**  
  All required Python packages are listed in the `requirements.txt` file.

---

## Installation

### Backend

1. Clone the repository and navigate to the project directory.
2. Create a virtual environment and activate it:

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows use: venv\Scripts\activate
   ```

3. Install the required packages:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the root directory and add your API keys:

   ```env
   GROQ_API_KEY=your_api_key_here
   ```

5. Start the Flask server:

   ```bash
   python app.py
   ```

### Frontend (Web)

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm start
   ```

### Mobile App

1. Navigate to the mobile project directory (e.g., `my-cpt` or `auto-cpt`):

   ```bash
   cd my-cpt
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

3. Start the Expo development server:

   ```bash
   npx expo start
   ```

---

## Usage

1. **Select a Patient:**  
   Use the intuitive dropdown to select a patient by their first and last name. This will set the context for the subsequent documentation and billing operations.

2. **Start Recording:**  
   Tap the microphone button to start live speech recognition. The interface will display the real-time transcript.

3. **Extract CPT Codes:**  
   As you speak, the application automatically sends the transcript to the AI-powered backend, which identifies and extracts relevant CPT codes.

4. **Stop Recording & Generate Bill:**  
   When you are finished, tap the “Stop” button. This finalizes the transcription, creates an invoice based on the extracted CPT codes, and resets the session.

5. **Review & Copy Codes:**  
   The extracted CPT codes are displayed on both the web and mobile interfaces. Easily copy any code for documentation or billing purposes with a single tap.

---

## Technologies

- **Backend:** Python, Flask, Flask-CORS, Flask-Sock, Requests
- **Frontend:** React, TypeScript, Tailwind CSS
- **Mobile:** Expo, React Native, React Navigation
- **Speech Recognition:** Web Speech API (for browsers) and react-native-voice (for mobile)
- **AI Integration:** External AI services for chat completions and cost estimation
