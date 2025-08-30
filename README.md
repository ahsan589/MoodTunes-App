# 🎶 MoodTunes – Emotion-Based Music Recommendation System

MoodTunes is a cross-platform app that uses **AI-powered emotion detection** to recommend songs matching your current mood.  
It combines **computer vision (OpenCV)**, **FastAPI backend**, and **React Native (Expo)** for a modern, interactive experience.  
Music recommendations are powered by the **Deezer API** (free & no login required).

---

## ✨ Features
- 📷 **Emotion Detection** – Capture live images using the phone’s camera.
- 🎭 **AI Mood Analysis** – Detects emotions like Happy, Sad, Angry, Neutral, etc.
- 🎶 **Music Recommendations** – Fetches real songs from the Deezer API based on detected emotion.
- 📱 **Cross-Platform App** – Built with React Native (Expo) for Android, iOS, and Web.
- ⚡ **Fast Backend** – Python FastAPI + OpenCV for image analysis.
- ✋ **Manual Mood Selection** – Choose mood manually if camera fails.
---

## 🛠️ Tech Stack
### Frontend
- React Native (Expo)
- Expo Router
- Expo Camera & Image Manipulator

### Backend
- Python (FastAPI)
- OpenCV (cv2) for emotion detection
- Deezer API for real music recommendations

---

## 🚀 Getting Started

### 1️⃣ Backend Setup (FastAPI)
```bash
# Clone the repo
git clone https://github.com/yourusername/moodtunes.git
cd moodtunes/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn main:app --reload
