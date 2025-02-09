import { useState, useEffect } from "react";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Mic, MicOff } from "lucide-react";
import { CPTCodeCard } from "./CPTCodeCard";
//import { CollapsibleSidebar } from "./CollapsibleSidebar";
import { useToast } from "../hooks/use-toast";
import { CustomerSelect } from "./CustomerSelect"

export function CPTRecorder() {
  const [cptCodes, setCPTCodes] = useState<string[]>([])
  const { isListening, transcript, error, startListening, stopListening, cptHistory } = useSpeechRecognition()
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [uploadStatusColor, setUploadStatusColor] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Local customer list
  const customerOptions = [
    { first_name: "John", last_name: "Doe" },
    { first_name: "Jane", last_name: "Smith" },
    { first_name: "Alice", last_name: "Brown" },
    { first_name: "Bob", last_name: "Johnson" }
  ]

  // Add handler for patient selection
  const handlePatientSelect = (patient: { first_name: string; last_name: string }) => {
    fetch('http://127.0.0.1:5001/select_patient', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        first_name: patient.first_name,
        last_name: patient.last_name
      })
    })
    .catch(error => {
      console.error('Error selecting patient:', error)
      toast({
        title: "Error",
        description: "Failed to select patient. Please try again.",
        variant: "destructive"
      })
    })
  };

  useEffect(() => {
    if (cptHistory) {
      const codes: string[] = []
      for (const key of Object.keys(cptHistory)) {
        // @ts-ignore
        codes.push(`${key} - ${cptHistory[key]}`)
      }
      setCPTCodes(codes)
    }
  }, [cptHistory])

  const filteredCodes = cptCodes.filter((code) => code.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "CPT Code Copied",
      description: `${code} has been copied to your clipboard.`,
    })
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      // Preview the selected image immediately
      const previewUrl = URL.createObjectURL(event.target.files[0]);
      setImagePreviewUrl(previewUrl);
    } else {
      setFile(null);
      setImagePreviewUrl(null); // Clear preview if no file selected
    }
  };
  const handleUpload = async () => {
    if (!file) {
      setUploadStatus("⚠️ Please select an image first.");
      setUploadStatusColor("orange");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadStatus("Uploading...");
    setUploadStatusColor("gray");
    setIsLoading(true);
    setImageUrl(null);

    try {
      const response = await fetch("http://localhost:5000/upload-image", {
        method: "POST",
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
        credentials: 'same-origin'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (data.imageUrl) {
        // Show preview of original image
        if (file) {
          const previewUrl = URL.createObjectURL(file);
          setImagePreviewUrl(previewUrl);
        }

        // Show processed image with full URL
        setImageUrl(`http://localhost:5000${data.imageUrl}`);
        setUploadStatus("✅ Image processed successfully!");
        setUploadStatusColor("green");
      } else {
        setUploadStatus("⚠️ Image upload failed: No URL returned");
        setUploadStatusColor("orange");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadStatus(`❌ Upload failed: ${error.message}`);
      setUploadStatusColor("red");
    } finally {
      setIsLoading(false);
    }
  };

  // Add error handling for processed image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onerror = () => {
        console.error("Failed to load processed image:", imageUrl);
        setUploadStatus("⚠️ File uploaded but failed to load processed image");
        setUploadStatusColor("orange");
      };
      img.src = imageUrl;
    }
  }, [imageUrl]);

  return (
    <div className="relative min-h-screen w-screen bg-gradient-to-br from-indigo-800 via-slate-900 to-black overflow-hidden">
      {/* Optional subtle patterned background */}
      <div className="absolute inset-0 bg-[url('/assets/background-pattern.svg')] opacity-10"></div>

      <div className="relative container mx-auto p-6">
        {/* Header */}
        <header className="mb-12 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-white">CPT Code Recorder</h1>
          <nav className="pr-8">
            <ul className="flex space-x-6 text-white text-lg">
              <li>
                <a href="#home" className="hover:text-indigo-400">
                  Home
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-indigo-400">
                  About
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-indigo-400">
                  Contact
                </a>
              </li>
            </ul>
          </nav>
        </header>

        {/* Enhanced Custom Customer Dropdown */}
        <section className="relative z-[100] bg-slate-800/50 backdrop-blur-xl p-6 mb-8 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl">
          <label htmlFor="customer-select" className="text-xl font-semibold text-white block mb-2">
            Choose a Patient
          </label>
          <CustomerSelect customers={customerOptions} onSelect={handlePatientSelect} />
        </section>

        {/* Main content */}
        <main className="flex flex-col lg:flex-row gap-12">
          {/* Left Panel: Recording Controls and Codes List */}
          <div className="flex-1 space-y-8">
            {/* Recording Section - Updated z-index */}
            <section className="relative z-[90] flex flex-col items-center justify-center bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl">
              <div className="relative">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 shadow-2xl flex items-center justify-center hover:scale-105 transform transition-transform duration-300"
                >
                  {isListening ? (
                    <MicOff size={64}/>
                  ) : (
                    <Mic size={64}/>
                  )}
                </Button>
                {isListening && (
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-ping"></span>
                )}
              </div>
              <h2 className="text-2xl text-white mt-4">
                {isListening ? "Recording in progress..." : "Tap the mic to record"}
              </h2>
              {error && <p className="text-rose-400 mt-2">{error}</p>}
            </section>

            {/* Extracted CPT Codes - Updated z-index */}
            <section className="relative z-[90] bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl">
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search CPT codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 text-white placeholder:text-slate-400 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300"
                />
              </div>
              {filteredCodes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredCodes.map((code, index) => (
                    <CPTCodeCard key={index} code={code} onCopy={handleCopy} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 py-8">
                  {cptCodes.length > 0
                    ? "No matching CPT codes found."
                    : "No CPT codes extracted yet. Start recording to extract codes."}
                </p>
              )}
            </section>
          </div>
          <Card>
          <CardHeader>
            <CardTitle>Upload Image for Detection</CardTitle>
          </CardHeader>
          <CardContent>
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            <Button onClick={handleUpload} className="mt-2">Upload</Button>

            {isLoading && <div id="loading-spinner">Loading...</div>}  {/* Show loading spinner */}

            {uploadStatus && (
              <p style={{ color: uploadStatusColor }} className="mt-2">
                {uploadStatus}
              </p>
            )}

            {/* Image Preview before processing */}
            {imagePreviewUrl && (
              <img
                src={imagePreviewUrl}
                alt="Image Preview"
                className="mt-4 rounded-lg shadow"
                style={{ display: imagePreviewUrl ? "block" : "none" }}
              />
            )}

            {/* Processed image after successful upload */}
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Processed Image"
                id="processed-image"
                className="mt-4 rounded-lg shadow"
                style={{ display: imageUrl ? "block" : "none" }}
              />
            )}
          </CardContent>
        </Card>

          {/* Right Panel: Transcript Sidebar - Updated z-index */}
          <aside className="relative z-[90] w-full lg:w-1/3 bg-slate-800/50 backdrop-blur-xl p-6 rounded-3xl shadow-xl transition-all duration-300 hover:shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-4">Transcript</h3>
            <div className="overflow-y-auto h-96 p-4 bg-slate-900/40 rounded-lg border border-slate-700">
              {transcript ? (
                <p className="text-slate-300 whitespace-pre-wrap">{transcript}</p>
              ) : (
                <p className="text-center text-slate-400">
                  Transcript will appear here...
                </p>
              )}
            </div>
          </aside>
        </main>
      </div>
    </div>
  )
}

