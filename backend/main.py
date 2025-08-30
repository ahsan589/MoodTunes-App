# main.py (Enhanced with Deezer API and audio playback)
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import cv2
import numpy as np
from typing import Dict, List, Optional
import requests
from pydantic import BaseModel
import base64
import io
from PIL import Image
import random
import os
import json

app = FastAPI(title="Emotion Music Recommender")

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load OpenCV Haar Cascade for face detection
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Emotion to music genre mapping for Deezer
EMOTION_GENRES = {
    "happy": ["pop", "dance", "disco", "reggaeton", "happy"],
    "sad": ["acoustic", "blues", "piano", "melancholic", "sad"],
    "calm": ["ambient", "chill", "classical", "jazz", "meditation"],
    "energetic": ["rock", "electronic", "hip-hop", "metal", "workout"],
    "neutral": ["indie", "alternative", "lounge", "folk", "latin"]
}

# Deezer API base URL
DEEZER_API_BASE = "https://api.deezer.com"

class ImageData(BaseModel):
    image_data: str  # base64 encoded image

def detect_emotion(image_array: np.ndarray) -> str:
    """
    Simple emotion detection using OpenCV only
    This is a basic implementation that uses face detection and simple rules
    """
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(image_array, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    
    if len(faces) == 0:
        return "neutral"
    
    # Simple heuristic based on image brightness and contrast
    brightness = np.mean(gray)
    contrast = np.std(gray)
    
    if brightness > 150 and contrast > 50:
        return "happy"
    elif brightness < 100 and contrast < 30:
        return "sad"
    elif contrast < 25:
        return "calm"
    elif contrast > 60:
        return "energetic"
    else:
        return "neutral"

def search_deezer_tracks(query: str, genre: str, limit: int = 10) -> List[Dict]:
    """Search for tracks on Deezer based on query and genre"""
    try:
        # First, try to search with both query and genre
        search_url = f"{DEEZER_API_BASE}/search"
        params = {
            "q": f"{query} {genre}",
            "limit": limit
        }
        
        response = requests.get(search_url, params=params, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        tracks = []
        for track in data.get("data", [])[:limit]:
            tracks.append({
                "id": track.get("id"),
                "name": track.get("title"),
                "artist": track.get("artist", {}).get("name"),
                "album": track.get("album", {}).get("title"),
                "preview_url": track.get("preview"),
                "external_url": track.get("link"),
                "image_url": track.get("album", {}).get("cover_medium"),
                "duration": track.get("duration"),
                "source": "Deezer"
            })
        
        return tracks
    
    except Exception as e:
        print(f"Error searching Deezer: {e}")
        return []

def get_chart_tracks(genre: str, limit: int = 10) -> List[Dict]:
    """Get chart tracks for a specific genre from Deezer"""
    try:
        # Get genre ID first
        genre_search_url = f"{DEEZER_API_BASE}/genre"
        response = requests.get(genre_search_url, timeout=10)
        response.raise_for_status()
        genres_data = response.json()
        
        genre_id = None
        for g in genres_data.get("data", []):
            if genre.lower() in g.get("name", "").lower():
                genre_id = g.get("id")
                break
        
        if genre_id:
            # Get charts for this genre
            charts_url = f"{DEEZER_API_BASE}/chart/{genre_id}/tracks"
            response = requests.get(charts_url, timeout=10)
            response.raise_for_status()
            charts_data = response.json()
            
            tracks = []
            for track in charts_data.get("data", [])[:limit]:
                tracks.append({
                    "id": track.get("id"),
                    "name": track.get("title"),
                    "artist": track.get("artist", {}).get("name"),
                    "album": track.get("album", {}).get("title"),
                    "preview_url": track.get("preview"),
                    "external_url": track.get("link"),
                    "image_url": track.get("album", {}).get("cover_medium"),
                    "duration": track.get("duration"),
                    "source": "Deezer Charts"
                })
            
            return tracks
        return []
    
    except Exception as e:
        print(f"Error getting charts: {e}")
        return []

def get_music_recommendations(emotion: str, limit: int = 8) -> Dict:
    """Get music recommendations from Deezer based on emotion"""
    if emotion not in EMOTION_GENRES:
        emotion = "neutral"
    
    genres = EMOTION_GENRES[emotion]
    genre = random.choice(genres)
    
    # Try different strategies to get music
    tracks = []
    
    # Strategy 1: Search for emotion + genre
    emotion_queries = {
        "happy": ["happy", "joy", "upbeat", "positive"],
        "sad": ["melancholic", "emotional", "heartfelt", "sad"],
        "calm": ["relaxing", "peaceful", "calm", "soothing"],
        "energetic": ["energetic", "powerful", "intense", "pumping"],
        "neutral": ["chill", "easy", "mellow", "smooth"]
    }
    
    query = random.choice(emotion_queries.get(emotion, ["popular"]))
    tracks = search_deezer_tracks(query, genre, limit)
    
    # Strategy 2: If no results, try charts
    if not tracks:
        tracks = get_chart_tracks(genre, limit)
    
    # Strategy 3: Fallback to popular tracks
    if not tracks:
        tracks = search_deezer_tracks("popular", "", limit)
    
    return {
        'emotion': emotion,
        'recommendations': tracks,
        'source': 'Deezer API'
    }

@app.post("/analyze-emotion")
async def analyze_emotion(image_data: ImageData):
    """Analyze emotion from image and return music recommendations"""
    try:
        # Decode base64 image
        image_bytes = base64.b64decode(image_data.image_data.split(",")[1])
        image = Image.open(io.BytesIO(image_bytes))
        image_array = np.array(image)
        
        # Convert RGB to BGR for OpenCV
        image_array = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        
        # Detect emotion
        emotion = detect_emotion(image_array)
        
        # Get music recommendations
        recommendations = get_music_recommendations(emotion)
        
        return recommendations
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")

@app.get("/manual-recommendations/{emotion}")
async def get_manual_recommendations(emotion: str):
    """Get recommendations for a specific emotion without image analysis"""
    if emotion not in EMOTION_GENRES:
        raise HTTPException(status_code=400, detail="Invalid emotion")
    
    recommendations = get_music_recommendations(emotion)
    return recommendations

@app.get("/play-track/{track_id}")
async def play_track(track_id: int):
    """Redirect to Deezer track page or get preview URL"""
    try:
        # Get track info from Deezer
        track_url = f"{DEEZER_API_BASE}/track/{track_id}"
        response = requests.get(track_url, timeout=10)
        response.raise_for_status()
        track_data = response.json()
        
        return {
            "preview_url": track_data.get("preview"),
            "external_url": track_data.get("link"),
            "track_info": {
                "name": track_data.get("title"),
                "artist": track_data.get("artist", {}).get("name"),
                "album": track_data.get("album", {}).get("title"),
                "duration": track_data.get("duration")
            }
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching track: {str(e)}")

@app.get("/redirect-to-deezer/{track_id}")
async def redirect_to_deezer(track_id: int):
    """Redirect to Deezer track page"""
    track_url = f"https://www.deezer.com/track/{track_id}"
    return RedirectResponse(url=track_url)

@app.get("/search-music")
async def search_music(query: str, emotion: Optional[str] = None, limit: int = 10):
    """Search for music with optional emotion filter"""
    try:
        if emotion and emotion in EMOTION_GENRES:
            genre = random.choice(EMOTION_GENRES[emotion])
            tracks = search_deezer_tracks(query, genre, limit)
        else:
            tracks = search_deezer_tracks(query, "", limit)
        
        return {
            "query": query,
            "emotion": emotion,
            "results": tracks
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching music: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    # Test Deezer connection
    try:
        response = requests.get(f"{DEEZER_API_BASE}/genre/0", timeout=5)
        deezer_status = "connected" if response.status_code == 200 else "disconnected"
    except:
        deezer_status = "disconnected"
    
    return {
        "status": "healthy", 
        "service": "Emotion Music Recommender",
        "deezer_api": deezer_status
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)