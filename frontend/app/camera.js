import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Loading from '../components/Loading';
import { analyzeEmotion } from '../utils/api';

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isLoading, setIsLoading] = useState(false);
  const cameraRef = useRef(null);
  const router = useRouter();

  // 📷 Capture photo and analyze
  const captureAndAnalyze = async () => {
    if (cameraRef.current) {
      setIsLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          base64: true,
          quality: 0.7,
        });

        // Resize image for faster processing
        const manipulatedImage = await ImageManipulator.manipulateAsync(
          photo.uri,
          [{ resize: { width: 300, height: 300 } }],
          { base64: true, format: 'jpeg' }
        );

        // Send to backend for emotion analysis
        const result = await analyzeEmotion(
          `data:image/jpeg;base64,${manipulatedImage.base64}`
        );

        // Navigate to results
        router.push({
          pathname: '/results',
          params: result,
        });
      } catch (error) {
        console.error('Error analyzing emotion:', error);
        Alert.alert(
          'Error',
          'Could not analyze emotion. Please try again or select mood manually.',
          [{ text: 'OK', onPress: () => router.push('/manual-select') }]
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  // 📌 Permission handling
  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          No access to camera. Please grant permission.
        </Text>
        <TouchableOpacity
          style={styles.manualButton}
          onPress={requestPermission}
        >
          <Text style={styles.manualButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ✅ Permission granted
  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="front"
        ref={cameraRef}
      >
        <View style={styles.overlay}>
          <View style={styles.guideFrame} />
          <Text style={styles.overlayText}>Position your face in the frame</Text>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.captureButton}
          onPress={captureAndAnalyze}
          disabled={isLoading}
        >
          <Ionicons name="camera" size={32} color="white" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualButton}
          onPress={() => router.push('/manual-select')}
          disabled={isLoading}
        >
          <Text style={styles.manualButtonText}>Select Manually</Text>
        </TouchableOpacity>
      </View>

      {isLoading && <Loading message="Analyzing your mood..." />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    alignSelf: 'stretch',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideFrame: {
    width: 200,
    height: 200,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 100,
    backgroundColor: 'transparent',
  },
  overlayText: {
    color: 'white',
    fontSize: 16,
    marginTop: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  controls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  manualButton: {
    padding: 10,
  },
  manualButtonText: {
    color: 'white',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});
