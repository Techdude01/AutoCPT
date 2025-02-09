document.addEventListener("DOMContentLoaded", function () {
    const startBtn = document.getElementById("start-btn");
    const stopBtn = document.getElementById("stop-btn");
    const transcriptionElem = document.getElementById("transcription");
    const cptCodesElem = document.getElementById("cpt-codes");

    const fileUpload = document.getElementById("file-upload");
    const uploadBtn = document.getElementById("upload-btn");
    const imagePreview = document.getElementById("uploaded-image");
    const uploadStatus = document.getElementById("upload-status"); // New element for feedback
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;

    let socket = new WebSocket("ws://127.0.0.1:5001/ws");

    // Start listening to speech
    startBtn.addEventListener("click", () => {
        recognition.start();
        startBtn.disabled = true;
        stopBtn.disabled = false;
    });

    // Stop listening to speech
    stopBtn.addEventListener("click", () => {
        recognition.stop();
        startBtn.disabled = false;
        stopBtn.disabled = true;
    });

    // Handle speech recognition result
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

    fileUpload.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        // Clear previous status and images
        uploadStatus.innerText = "";
        uploadStatus.style.color = "black";
        imagePreview.style.display = "none";
        document.getElementById("processed-image").style.display = "none";

        // Show loading state
        document.getElementById("loading-spinner").style.display = "block";

        // Create FormData and append file
        const formData = new FormData();
        formData.append("file", file);

        // Create a new AbortController instance for this specific upload
        const controller = new AbortController();
        const signal = controller.signal;

        // Set a timeout to abort the request after 10 seconds
        const timeout = setTimeout(() => {
            controller.abort();
            document.getElementById("loading-spinner").style.display = "none";
            uploadStatus.innerText = "❌ Request timed out!";
            uploadStatus.style.color = "red";
            console.error("Request timed out.");
        }, 10000);

        // Send file to server using fetch with timeout
        fetch("/upload-image", {
            method: "POST",
            body: formData,
            signal: signal
        })
        .then(response => response.json())
        .then(data => {
            clearTimeout(timeout);
            document.getElementById("loading-spinner").style.display = "none";

            // Show original image preview
            const previewUrl = URL.createObjectURL(file);
            imagePreview.src = previewUrl;
            imagePreview.style.display = "block";

            // Show processed image with bounding boxes
            const processedImage = document.getElementById("processed-image");
            // Ensure we're using the full URL from the server
            processedImage.src = data.imageUrl;
            processedImage.style.display = "block";

            uploadStatus.innerText = "✅ File uploaded and processed successfully!";
            uploadStatus.style.color = "green";

            // Add error handling for the processed image
            processedImage.onerror = function() {
                console.error("Failed to load processed image:", data.imageUrl);
                uploadStatus.innerText = "⚠️ File uploaded but failed to load processed image";
                uploadStatus.style.color = "orange";
            };
        })
        .catch(error => {
            clearTimeout(timeout);
            document.getElementById("loading-spinner").style.display = "none";

            if (error.name === 'AbortError') {
                uploadStatus.innerText = "❌ Request timed out!";
            } else {
                uploadStatus.innerText = `❌ Upload failed: ${error.message}`;
            }
            uploadStatus.style.color = "red";
            console.error("Upload error:", error);
            });
        }
    });

        // Add click handler for upload button
        uploadBtn.addEventListener("click", () => {
            fileUpload.click();
        });

    // Handle incoming WebSocket messages and update CPT codes
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

    // Handle WebSocket errors
    socket.onerror = (error) => {
        console.error("WebSocket Error:", error);
    };
});