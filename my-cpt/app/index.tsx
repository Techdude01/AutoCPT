import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, TextInput, ScrollView, TouchableOpacity } from "react-native";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { Ionicons } from "@expo/vector-icons";
import Clipboard from "@react-native-clipboard/clipboard";
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
  const { 
    isListening, 
    transcript, 
    error, 
    cptCodes, 
    loading,
    startListening, 
    stopListening 
  } = useSpeechRecognition();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const formattedCodes = Object.entries(cptCodes).map(
    ([code, description]) => `${code} - ${description}`
  );

  const filteredCodes = formattedCodes.filter((code) => 
    code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = async (code: string) => {
    try {
      await Clipboard.setString(code);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  return (
    <LinearGradient 
      colors={['#0f172a', '#1e293b']}
      style={styles.container}
    >
      <ScrollView style={styles.mainContent}>
        <Text style={[styles.title, styles.gradientText]}>CPT Code Recorder</Text>

        {/* Recording Controls */}
        <View style={[styles.card, styles.cardHover]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Recording Controls</Text>
            {isListening && (
              <Text style={styles.recordingIndicator}>Recording...</Text>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              isListening ? styles.buttonDestructive : styles.buttonGradient,
            ]}
            onPress={isListening ? stopListening : startListening}
            disabled={loading}
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
        <View style={[styles.card, styles.cardHover]}>
          <Text style={styles.cardTitle}>Extracted CPT Codes</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search CPT codes..."
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          
          {loading && (
            <Text style={styles.loadingText}>Processing transcript...</Text>
          )}
          
          {!loading && filteredCodes.length > 0 ? (
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
              {formattedCodes.length > 0
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
    </LinearGradient>
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
    color: "#e2e8f0", // ✅ Lightened for dark backgrounds
  },
  gradientText: {
    color: "#e2e8f0", // ✅ Consistent with title
  },
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.7)", // ✅ Increased opacity for better contrast
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#475569", // ✅ Soft gray-blue border
    shadowColor: "#e2e8f0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardHover: {
    shadowColor: "#e2e8f0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
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
    color: "#e2e8f0", // ✅ Matches title for consistency
  },
  recordingIndicator: {
    color: "#e2e8f0",
    fontSize: 14,
    opacity: 0.9,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  buttonGradient: {
    backgroundColor: "#06b6d4",
  },
  buttonDestructive: {
    backgroundColor: "#f43f5e",
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: '#ff7f7f', // ✅ Softer red for readability
    marginTop: 8,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#475569',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    color: "#e2e8f0", // ✅ White text input
  },
  codesGrid: {
    gap: 12,
  },
  codeCard: {
    backgroundColor: 'rgba(51, 65, 85, 0.8)', // ✅ Slightly transparent for smooth UI
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
    color: "#e2e8f0", // ✅ Lighter text for codes
  },
  codeDescription: {
    fontSize: 14,
    color: "#cbd5e1", // ✅ Softer gray-blue text for readability
  },
  emptyText: {
    textAlign: 'center',
    color: "#cbd5e1", // ✅ Lightened text
  },
  sidebar: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)', // ✅ Darker sidebar for contrast
    borderLeftWidth: 1,
    borderLeftColor: '#475569',
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
    borderBottomColor: '#475569',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: "#e2e8f0",
  },
  transcriptContainer: {
    flex: 1,
    padding: 16,
  },
  transcriptText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#e2e8f0", // ✅ Lightened transcript text
  },
  loadingText: {
    textAlign: 'center',
    color: "#cbd5e1", // ✅ Soft gray loading text
    marginTop: 8,
  },
});
