import Voice from '@react-native-voice/voice';
import { ElevenLabsClient } from 'elevenlabs';
// Changed import for expo-audio to default import
import Audio from 'expo-audio';
import { useEffect, useState } from 'react';
import { Button, Platform, StyleSheet, Text, View } from 'react-native';

// Initialize ElevenLabs client (replace with your actual API key)
const ELEVENLABS_API_KEY = 'YOUR_ELEVENLABS_API_KEY'; // Ensure placeholder
const client = new ElevenLabsClient({
  apiKey: ELEVENLABS_API_KEY,
});

export default function HomeScreen() {
  const [isRecording, setIsRecording] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  // Changed type to use Audio.Sound from default import
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    // Setup Voice event listeners
    Voice.onSpeechStart = () => setIsRecording(true);
    Voice.onSpeechEnd = () => setIsRecording(false);
    Voice.onSpeechError = (e) => console.error('onSpeechError: ', e);
    Voice.onSpeechResults = (e) => {
      if (e.value && e.value.length > 0) {
        setRecognizedText(e.value[0]);
        // Simple AI interaction placeholder
        handleSimpleAIInteraction(e.value[0]);
      }
    };

    // Request microphone permissions using Audio.requestPermissionsAsync
    (async () => {
      if (Platform.OS !== 'web') {
        const permissions = await Audio.requestPermissionsAsync();
        if (permissions.status !== 'granted') {
          alert('Sorry, we need microphone permissions to make this work!');
        }
      }
    })();

    return () => {
      // Cleanup Voice event listeners and sound object
      Voice.destroy().then(Voice.removeAllListeners);
      sound?.unloadAsync();
    };
  }, [sound]);

  const startRecording = async () => {
    setRecognizedText('');
    setAiResponse('');
    try {
      await Voice.start('en-US');
    } catch (e) {
      console.error('Failed to start recording', e);
    }
  };

  const stopRecording = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error('Failed to stop recording', e);
    }
  };

  const handleSimpleAIInteraction = async (text: string) => {
    // Placeholder: Echo the recognized text or provide a canned response
    const responseText = `You said: ${text}. This is a placeholder AI response.`;
    setAiResponse(responseText);
    await playTextToSpeech(responseText);
  };

  const playTextToSpeech = async (text: string) => {
    if (ELEVENLABS_API_KEY === 'YOUR_ELEVENLABS_API_KEY') {
      console.warn('ElevenLabs API key not set. Skipping TTS.');
      setAiResponse(aiResponse + ' (TTS Skipped: API Key Missing)');
      return;
    }
    try {
      const audioStream = await client.generate({
        voice: 'Rachel', // You can choose other voices
        text,
        model_id: 'eleven_multilingual_v2', // Or other models
      });

      // The stream is a ReadableStream. We need to collect it into a buffer.
      const chunks = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const data = new Uint8Array(
        chunks.reduce((acc, val) => acc.concat(Array.from(val)), []),
      );

      // Create a blob and then a URI
      const blob = new Blob([data], { type: 'audio/mpeg' });
      const uri = URL.createObjectURL(blob);

      if (sound) {
        await sound.unloadAsync();
      }

      // Corrected sound creation and playback using new Audio.Sound()
      const newSoundInstance = new Audio.Sound();
      await newSoundInstance.loadAsync({ uri });
      setSound(newSoundInstance);
      await newSoundInstance.playAsync();
    } catch (error) {
      console.error('Error playing TTS:', error);
      setAiResponse(aiResponse + ' (TTS Error)');
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text style={styles.titleContainer}>Talk with AI</Text>
      <Button
        title={isRecording ? 'Stop Talking' : 'Start Talking'}
        onPress={isRecording ? stopRecording : startRecording}
      />
      {recognizedText ? (
        <Text style={styles.textOutput}>You said: {recognizedText}</Text>
      ) : null}
      {aiResponse ? (
        <Text style={styles.textOutput}>AI says: {aiResponse}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    marginTop: 46,
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  textOutput: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
