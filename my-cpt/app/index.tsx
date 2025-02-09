import { useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { extractCPTCodes } from "../hooks/extractCPTCodes";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";

export default function Index() {
  const { isListening, transcript, error, startListening, stopListening } = useSpeechRecognition();
  const [cptCodes, setCPTCodes] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!isListening && transcript) {
      const codes = extractCPTCodes(transcript);
      setCPTCodes(codes);
    }
  }, [isListening, transcript]);

  const filteredCodes = cptCodes.filter((code) => 
    code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = async (code: string) => {
    try {
      await Clipboard.setString(code);
      // You might want to add a toast notification here using react-native-toast-message
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.mainContent}>
        <Text style={styles.title}>CPT Code Recorder</Text>

        {/* Recording Controls */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recording Controls</Text>
            {isListening && (
              <Text style={styles.recordingIndicator}>Recording...</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              isListening ? styles.buttonDestructive : styles.buttonPrimary,
            ]}
            onPress={isListening ? stopListening : startListening}
          >
            <Ionicons
              name={isListening ? "mic-off" : "mic"}
              size={24}
              color="white"
            />
            <Text style={styles.buttonText}>
              {isListening ? "Stop Recording" : "Start Recording"}
            </Text>
          </TouchableOpacity>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>

        {/* CPT Codes Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Extracted CPT Codes</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search CPT codes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          
          {filteredCodes.length > 0 ? (
            <View style={styles.codesGrid}>
              {filteredCodes.map((code, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.codeCard}
                  onPress={() => handleCopy(code)}
                >
                  <View style={styles.codeCardHeader}>
                    <Text style={styles.codeNumber}>
                      {code.split(" - ")[0]}
                    </Text>
                    <Ionicons name="copy-outline" size={20} color="#666" />
                  </View>
                  <Text style={styles.codeDescription}>
                    {code.split(" - ")[1]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>
              {cptCodes.length > 0
                ? "No matching CPT codes found."
                : "No CPT codes extracted yet. Start recording to extract codes."}
            </Text>
          )}
        </View>
      </ScrollView>

      {/* Collapsible Sidebar */}
      <View style={[
        styles.sidebar,
        isSidebarCollapsed ? styles.sidebarCollapsed : styles.sidebarExpanded
      ]}>
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        >
          <Ionicons
            name={isSidebarCollapsed ? "chevron-forward" : "chevron-back"}
            size={24}
            color="#666"
          />
        </TouchableOpacity>
        {!isSidebarCollapsed && (
          <>
            <View style={styles.sidebarHeader}>
              <Text style={styles.sidebarTitle}>Full Transcription</Text>
              <TouchableOpacity onPress={() => handleCopy(transcript)}>
                <Ionicons name="copy-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.transcriptContainer}>
              <Text style={styles.transcriptText}>{transcript}</Text>
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  recordingIndicator: {
    color: 'red',
    fontSize: 14,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonDestructive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF3B30',
    marginTop: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  codesGrid: {
    gap: 12,
  },
  codeCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 12,
  },
  codeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  codeNumber: {
    fontSize: 16,
    fontWeight: '600',
  },
  codeDescription: {
    fontSize: 14,
    color: '#666',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
  sidebar: {
    backgroundColor: 'white',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E5EA',
  },
  sidebarCollapsed: {
    width: 48,
  },
  sidebarExpanded: {
    width: 300,
  },
  collapseButton: {
    padding: 12,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptContainer: {
    flex: 1,
    padding: 16,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
