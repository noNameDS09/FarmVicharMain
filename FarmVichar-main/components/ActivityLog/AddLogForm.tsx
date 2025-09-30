import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddLogFormProps {
  farmId: string | null;
  selectedDate: string;
  userId: string | null;
  onLogAdded: (newLog: any) => void;
  onCancel: () => void;
}

const AddLogForm: React.FC<AddLogFormProps> = ({
  farmId,
  selectedDate,
  onLogAdded,
  onCancel,
}) => {
  const [notes, setNotes] = useState('');
  const [logType, setLogType] = useState('General Observation');
  const [image, setImage] = useState<string | null>(null);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState('mr');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      await Audio.requestPermissionsAsync();
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    })();
  }, []);

  const handleAudioRecord = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setAudioUri(uri);
    } else {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(recording);
      } catch (err) {
        Alert.alert('Error', 'Failed to start recording.');
      }
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!farmId) {
      Alert.alert('Error', 'Farm ID is missing.');
      return;
    }

    setLoading(true);
    try {
      let newOptimisticLog;

      if (audioUri) {
        const formData = new FormData();
        const filename = audioUri.split('/').pop() || 'audio.m4a';
        const type = `audio/${filename.split('.').pop()}`;
        formData.append('audio_file', { uri: audioUri, name: filename, type } as any);
        formData.append('language_code', languageCode);

        const response = await fetch(
          `https://farmvichar-ml.onrender.com/logs/voice/${farmId}`,
          { method: 'POST', body: formData }
        );
        
        const responseData = await response.json();

        if (!response.ok && responseData.detail) {
            throw new Error(responseData.detail);
        }

        // ✅ Check for the successful case first
        if (responseData && responseData.structured_log) {
            const structuredLog = responseData.structured_log;
            newOptimisticLog = {
                id: `temp-${Date.now()}`,
                farmId,
                activityType: structuredLog.log_type,
                description: structuredLog.notes,
                timestamp: new Date(structuredLog.date).toISOString(),
            };
            Alert.alert('Success', 'Log submitted successfully!');
            onLogAdded(newOptimisticLog);
        
        // ✅ Check for the known "skipped" failure case
        } else if (responseData && responseData.status === 'skipped') {
            Alert.alert('Audio Failed', responseData.reason || "Please try recording again.");
        
        // ✅ Handle any other unexpected structure
        } else {
            throw new Error("Voice log response was not structured correctly.");
        }

      } else {
        if (!notes.trim()) {
            Alert.alert("Validation Error", "Notes are required for a text/image log.");
            setLoading(false);
            return;
        }
        const formData = new FormData();
        formData.append('notes', notes);
        formData.append('log_type', logType);
        formData.append('date', selectedDate);
        if (image) {
          const filename = image.split('/').pop() || 'photo.jpg';
          const type = `image/${filename.split('.').pop()}`;
          formData.append('image_file', { uri: image, name: filename, type } as any);
        }

        const response = await fetch(
          `https://farmvichar-ml.onrender.com/logs/${farmId}`,
          { method: 'POST', body: formData }
        );
        if (!response.ok) throw new Error('Failed to add log.');
        
        const responseData = await response.json();

        if (responseData) {
            newOptimisticLog = {
                id: responseData.id || `temp-${Date.now()}`,
                farmId,
                activityType: responseData.activityType || logType,
                description: responseData.description || notes,
                timestamp: new Date(selectedDate).toISOString(),
            };
            Alert.alert('Success', 'Log submitted successfully!');
            onLogAdded(newOptimisticLog);
        } else {
            throw new Error("Image log response was empty.");
        }
      }

    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const isMediaSelected = !!image || !!audioUri;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Add Log for {selectedDate}</Text>
          
          <Text style={styles.label}>Record Voice Note</Text>
          <TouchableOpacity 
            style={[
                styles.audioButton, 
                recording && styles.stopButton, 
                isMediaSelected && !recording && !audioUri && styles.buttonDisabled
            ]} 
            onPress={handleAudioRecord}
            disabled={isMediaSelected && !recording && !audioUri}
          >
            <Ionicons name={recording ? "stop-circle" : "mic"} size={20} color="white" />
            <Text style={styles.buttonTextSmall}>
                {recording ? 'Stop Recording' : (audioUri ? 'Audio Recorded ✓' : 'Record Audio')}
            </Text>
          </TouchableOpacity>
          {audioUri && (
             <TextInput
             style={styles.input}
             placeholder="Language Code (e.g., mr, en)"
             value={languageCode}
             onChangeText={setLanguageCode}
           />
          )}

          <View style={styles.divider}><Text style={styles.dividerText}>OR</Text></View>

          <Text style={styles.label}>Log Type *</Text>
          <TextInput
            style={[styles.input, isMediaSelected && !image && styles.buttonDisabled]}
            value={logType}
            onChangeText={setLogType}
            editable={!isMediaSelected || !!image}
          />
          <Text style={styles.label}>Notes *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput, isMediaSelected && !image && styles.buttonDisabled]}
            placeholder="Describe your observation..."
            value={notes}
            onChangeText={setNotes}
            multiline
            editable={!isMediaSelected || !!image}
          />
          <TouchableOpacity 
            style={[styles.imageButton, isMediaSelected && !image && styles.buttonDisabled]} 
            onPress={pickImage}
            disabled={isMediaSelected && !image}
          >
            <Text style={styles.imageButtonText}>{image ? 'Image Selected ✓' : 'Choose Image'}</Text>
          </TouchableOpacity>
          {image && (
            <Image source={{ uri: image }} style={styles.previewImage} />
          )}

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Log</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={onCancel}
            disabled={loading}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f9fafb' },
  container: { padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#111827',
  },
  label: { fontSize: 16, marginBottom: 5, color: '#374151', fontWeight: '500' },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 15,
  },
  multilineInput: { height: 100, textAlignVertical: 'top', paddingTop: 12 },
  button: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  audioButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  imageButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  imageButtonText: { color: '#fff', fontSize: 16 },
  buttonDisabled: { backgroundColor: '#A1A1AA', opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonTextSmall: { color: '#fff', fontSize: 16, marginLeft: 8 },
  cancelButton: { backgroundColor: '#6B7280' },
  previewImage: {
    width: '100%',
    height: 200,
    marginBottom: 15,
    borderRadius: 8,
  },
  divider: {
    marginVertical: 15,
    alignItems: 'center',
  },
  dividerText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
});

export default AddLogForm;