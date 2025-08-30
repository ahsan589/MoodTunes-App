import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Loading from '../components/Loading';
import { getManualRecommendations } from '../utils/api';

export default function ManualSelectScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const emotions = [
    { id: 'happy', name: 'Happy', icon: 'happy', color: '#FFD700' },
    { id: 'sad', name: 'Sad', icon: 'sad', color: '#3498db' },
    { id: 'calm', name: 'Calm', icon: 'leaf', color: '#2ecc71' },
    { id: 'energetic', name: 'Energetic', icon: 'flash', color: '#e74c3c' },
    { id: 'neutral', name: 'Neutral', icon: 'musical-notes', color: '#9b59b6' },
  ];

  const handleEmotionSelect = async (emotion) => {
    setIsLoading(true);
    try {
      const result = await getManualRecommendations(emotion);
      
      // Navigate to results with data
      router.push({
        pathname: '/results',
        params: result,
      });
    } catch (error) {
      console.error('Error getting recommendations:', error);
      Alert.alert('Error', 'Could not get recommendations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How are you feeling today?</Text>
      <Text style={styles.subtitle}>Select your current mood to get personalized music recommendations</Text>
      
      <ScrollView contentContainerStyle={styles.emotionsContainer}>
        {emotions.map((emotion) => (
          <TouchableOpacity
            key={emotion.id}
            style={[styles.emotionButton, { backgroundColor: emotion.color }]}
            onPress={() => handleEmotionSelect(emotion.id)}
            disabled={isLoading}
          >
            <Ionicons name={emotion.icon} size={32} color="white" />
            <Text style={styles.emotionText}>{emotion.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {isLoading && <Loading message="Getting recommendations..." />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  emotionsContainer: {
    alignItems: 'center',
  },
  emotionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emotionText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
  },
});