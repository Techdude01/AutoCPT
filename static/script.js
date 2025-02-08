document.addEventListener("DOMContentLoaded", function () {
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const transcriptionElem = document.getElementById("transcription");
    const cptCodesElem = document.getElementById("cpt-codes");

    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    let socket = new WebSocket("ws://127.0.0.1:5001/ws");

    startBtn.addEventListener("click", () => {
        recognition.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    stopBtn.addEventListener("click", () => {
        recognition.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });

    recognition.onresult = (event) => {
        let interimTranscript = "";
        let finalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + " ";
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        transcriptionElem.innerText = finalTranscript + interimTranscript;

        if (interimTranscript.trim() || finalTranscript.trim()) {
            socket.send(JSON.stringify({ text: finalTranscript + interimTranscript }));
        }
    };

    // Receive full CPT history from the WebSocket server
    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        cptCodesElem.innerHTML = ""; // Clear list before updating

        if (data.cpt_history && data.cpt_history.length > 0) {
            data.cpt_history.forEach((entry) => {
                let [term, code] = Object.entries(entry)[0];
                let li = document.createElement("li");
                li.textContent = `${term}: CPT ${code}`;
                cptCodesElem.appendChild(li);
            });
        } else {
            cptCodesElem.innerHTML = "<li>No CPT codes detected yet.</li>";
        }
    };

    socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
    };
});
