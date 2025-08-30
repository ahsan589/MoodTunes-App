// components/TrackList.js
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TrackList({ tracks }) {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [loadingId, setLoadingId] = useState(null);

  useEffect(() => {
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const playSound = async (track) => {
    try {
      // Stop current playback if any
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      setLoadingId(track.id);
      
      if (track.preview_url) {
        // Play preview audio
        const { sound: newSound } = await Audio.Sound.createAsync(
          { uri: track.preview_url },
          { shouldPlay: true }
        );
        
        setSound(newSound);
        setCurrentTrack(track.id);
        setIsPlaying(true);
        
        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
            setCurrentTrack(null);
          }
        });
      } else {
        // Open in Deezer app or browser if no preview available
        Linking.openURL(track.external_url);
      }
    } catch (error) {
      console.error('Error playing sound:', error);
      // Fallback to opening Deezer
      Linking.openURL(track.external_url);
    } finally {
      setLoadingId(null);
    }
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
      setCurrentTrack(null);
    }
  };

  const renderItem = ({ item, index }) => (
    <View style={styles.trackItem}>
      <View style={styles.trackNumber}>
        <Text style={styles.numberText}>{index + 1}</Text>
      </View>
      
      <View style={styles.trackInfo}>
        <Text style={styles.trackName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.trackArtist}>{item.artist}</Text>
        <Text style={styles.trackGenre}>{item.genre || 'Various'}</Text>
      </View>
      
      <TouchableOpacity
        style={styles.playButton}
        onPress={() => {
          if (currentTrack === item.id && isPlaying) {
            stopSound();
          } else {
            playSound(item);
          }
        }}
        disabled={loadingId === item.id}
      >
        {loadingId === item.id ? (
          <ActivityIndicator size="small" color="#1DB954" />
        ) : currentTrack === item.id && isPlaying ? (
          <Ionicons name="pause-circle" size={32} color="#1DB954" />
        ) : (
          <Ionicons name="play-circle" size={32} color="#1DB954" />
        )}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.deezerButton}
        onPress={() => Linking.openURL(item.external_url)}
      >
        <Ionicons name="open-outline" size={24} color="#1DB954" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {tracks.map((item, index) => (
        <View key={item.id || index}>
          {renderItem({ item, index })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  trackNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1DB954',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  numberText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  trackInfo: {
    flex: 1,
    marginRight: 10,
  },
  trackName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  trackGenre: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  playButton: {
    padding: 5,
    marginRight: 10,
  },
  deezerButton: {
    padding: 5,
  },
});