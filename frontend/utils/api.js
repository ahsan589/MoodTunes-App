// utils/api.js
const API_BASE_URL = 'http://192.168.43.28:8000'; // Change to your backend IP

export const analyzeEmotion = async (imageData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze-emotion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_data: imageData }),
    });
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return {
      emotion: data.emotion,
      source: data.source,
      recommendations: JSON.stringify(data.recommendations || []),
    };
  } catch (error) {
    console.error('Error analyzing emotion:', error);
    throw error;
  }
};

export const getManualRecommendations = async (emotion) => {
  try {
    const response = await fetch(`${API_BASE_URL}/manual-recommendations/${emotion}`);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return {
      emotion: data.emotion,
      source: data.source,
      recommendations: JSON.stringify(data.recommendations || []),
    };
  } catch (error) {
    console.error('Error getting recommendations:', error);
    throw error;
  }
};

export const getTrackInfo = async (trackId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/play-track/${trackId}`);
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error getting track info:', error);
    throw error;
  }
};