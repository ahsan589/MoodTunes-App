import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrackList from '../components/TrackList';

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Parse the data from params
  const emotion = params.emotion || 'neutral';
  const source = params.source || 'Mock Data';
  const recommendations = params.recommendations 
    ? JSON.parse(params.recommendations) 
    : [];

  const getEmotionIcon = (emotion) => {
    switch (emotion) {
      case 'happy': return 'happy';
      case 'sad': return 'sad';
      case 'calm': return 'leaf';
      case 'energetic': return 'flash';
      default: return 'musical-notes';
    }
  };

  const getEmotionColor = (emotion) => {
    switch (emotion) {
      case 'happy': return '#FFD700';
      case 'sad': return '#3498db';
      case 'calm': return '#2ecc71';
      case 'energetic': return '#e74c3c';
      default: return '#1DB954';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.emotionIcon, { backgroundColor: getEmotionColor(emotion) }]}>
          <Ionicons name={getEmotionIcon(emotion)} size={40} color="white" />
        </View>
        <Text style={styles.emotionText}>Detected Mood: {emotion}</Text>
        <Text style={styles.sourceText}>Source: {source}</Text>
      </View>

      <View style={styles.recommendations}>
        <Text style={styles.sectionTitle}>Recommended Tracks</Text>
        <TrackList tracks={recommendations} />
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/camera')}
        >
          <Ionicons name="camera" size={20} color="white" />
          <Text style={styles.actionButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/manual-select')}
        >
          <Ionicons name="happy" size={20} color="white" />
          <Text style={styles.actionButtonText}>Select Mood</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  emotionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  emotionText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  sourceText: {
    color: '#666',
    fontStyle: 'italic',
  },
  recommendations: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: '#1DB954',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
});