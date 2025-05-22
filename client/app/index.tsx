import {
  AudioModule,
  RecordingPresets,
  useAudioPlayer,
  useAudioRecorder,
} from 'expo-audio';
import { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, View } from 'react-native';

export default function App() {
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const player = useAudioPlayer(recordedUri); // Initialize player with null or a URI
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);

  const record = async () => {
    setRecordedUri(null); // Clear previous recording URI
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };

  const stopRecording = async () => {
    await audioRecorder.stop();
    // The recording URI is available on audioRecorder.uri after stopping
    if (audioRecorder.uri) {
      setRecordedUri(audioRecorder.uri);
    }
    setIsRecording(false);
  };

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission to access microphone was denied');
      }
    })();
  }, []);

  const playRecordedAudio = async () => {
    if (player && recordedUri) {
      try {
        await player.play();
      } catch (error) {
        console.error('Failed to play audio:', error);
        Alert.alert('Error', 'Could not play the recording.');
      }
    }
  };

  return (
    <View style={styles.container}>
      <Button
        title={isRecording ? 'Stop Recording' : 'Start Recording'}
        onPress={isRecording ? stopRecording : record}
      />

      <Button
        title="Play Recording"
        onPress={playRecordedAudio}
        disabled={!recordedUri || isRecording} // Simplified disabled condition
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 10,
  },
});
