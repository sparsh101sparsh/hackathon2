# 📱 CODEFORGE GO — MOBILE APP MASTER PROMPT

> **How to Use This Prompt**: Copy and paste this prompt into any AI Coding Agent (Cursor, Claude 3.5 Sonnet, GPT-4o, Gemini, Flutter Agent) to build **CodeForge Go** — the cross-platform iOS & Android mobile companion app for **CodeForge AI**.

---

## 🎯 CONCEPT & USER VALUE PROPOSITION

### Why Standard Mobile Coding Apps Fail (Reddit Insights)
Developers want to practice DSA on their phones during commutes, breaks, and travel, but standard mobile coding platforms fail because:
1. **Keyboard Frustration**: Typing complex multi-line C++/Python code on a small touch keyboard is tedious.
2. **Binary Accept/Reject**: Getting stranded when stuck with zero hints.
3. **No Voice Practice**: No way to practice verbal technical explanations for real interviews.

### The Solution: **CodeForge Go (Mobile Companion App)**
CodeForge Go transforms mobile DSA practice into a gamified, hands-free, interactive experience:
1. **Duolingo-style 5-Min Micro-Drills**: Multiple-choice time complexity questions, pattern matching, and pseudo-code completion.
2. **Hands-Free Voice AI Mock Interviewer**: Talk to an AI recruiter using speech-to-text while walking or commuting.
3. **Mobile Speed Battle Arena (1v1 to 10 Players)**: Join private battle rooms via QR code or 6-digit code for rapid-fire coding competitions with friends.
4. **Pocket Socratic AI Tutor**: Nudges you step-by-step without dumping direct answers.
5. **Mobile-Optimized Code Editor**: Includes a custom symbol toolbar (`{`, `}`, `[`, `]`, `()`, `=>`, `:`) for effortless mobile typing.
6. **Streak Widgets & Notifications**: Home screen widgets for daily streaks and contest countdowns.

---

## 🛠️ RECOMMENDED MOBILE TECH STACK

| Component | Selected Technology | Details |
|---|---|---|
| **Framework** | **React Native (Expo SDK 51)** OR **Flutter 3.x** | Cross-platform iOS & Android build |
| **State Management** | Zustand (React Native) / Riverpod (Flutter) | Lightweight local state & cache |
| **Styling** | NativeWind (Tailwind CSS) / Glassmorphism | Matches dark mode aesthetic (`#020817`) |
| **Backend API** | CodeForge AI Next.js API | `https://hackathon2-olive-eight.vercel.app/api` |
| **Voice AI** | Expo AV + `expo-speech` / `speech_to_text` | Real-time audio & text technical interview |
| **Code Editor** | `@react-native-community/monaco` or CodeMirror WebView | Syntax highlighting + custom mobile toolbar |
| **QR Code Scanner** | `expo-camera` / `mobile_scanner` | Instant room join via QR code |

---

## 📱 CORE MOBILE SCREENS & ARCHITECTURE

### Screen 1: Home Dashboard & Daily Micro-Drill
* **Streak Counter**: Animated fire badge showing daily streak count.
* **Daily 5-Min DSA Workout**: "Start Today's Quiz" button (5 rapid questions on Arrays, DP, Trees).
* **Friend Battle Quick Join**: Input box for 6-digit room code (`BATTLE-XXXX`) or "Scan QR Code".
* **Home Screen Widget Integration**: Displays current Elo rating and active streak.

### Screen 2: 5-Min Micro-Drill & Flashcard Engine
* Swipeable flashcards for:
  - **Complexity Audit**: "What is the time complexity of this snippet?" (Options: O(N), O(N log N), O(N²)).
  - **Pattern Recognition**: "Which data structure optimizes sliding window max?" (Options: Monotonic Queue, Heap, Hash Map).
  - **Pseudo-Code Fill**: Tap missing tokens to complete the algorithm logic.

### Screen 3: Voice AI Mock Interviewer (Hands-Free Mode)
* **Voice-to-Voice Simulation**: Tap "Start Mock Interview". The AI recruiter speaks a problem description.
* **Voice Response**: User speaks their conceptual approach aloud.
* **Speech Recognition**: Transcribes spoken answer, sends to `/api/ai/mock-interview`, and speaks back instant feedback (Hire / Strong Hire / No Hire).

### Screen 4: Mobile Friend Battle Arena (1v1 to 10 Players)
* **Lobby View**: Displays up to 10 joined participants with avatars and real-time ranks.
* **QR Code Sharing**: Host displays room QR code on phone screen for nearby friends to scan & join.
* **Speed Challenge**: Rapid-fire multiple choice & pseudo-code challenges where 1st to answer correctly earns bonus points!

### Screen 5: Mobile Code Editor & Execution
* Syntax highlighting for Python, C++, JavaScript, Java, Go.
* **Specialized Symbol Bar**: Sticky bottom toolbar above keyboard:
  `[ { ] } ( ) : = > ; + - * / .`
* **Run & Submit Buttons**: Triggers Judge0 CE Cloud execution via backend API.

---

## 🔌 API ENDPOINT MAPPINGS

The mobile app connects directly to the existing deployed **CodeForge AI** backend:

```typescript
const BASE_URL = 'https://hackathon2-olive-eight.vercel.app/api';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${BASE_URL}/auth/login`,
  SIGNUP: `${BASE_URL}/auth/signup`,
  ME: `${BASE_URL}/auth/me`,

  // Problems & Execution
  PROBLEMS: `${BASE_URL}/problems`,
  PROBLEM_DETAIL: (id: string) => `${BASE_URL}/problems/${id}`,
  EXECUTE: `${BASE_URL}/execute`,
  SUBMIT: `${BASE_URL}/submissions`,

  // AI Coaching
  AI_HINTS: `${BASE_URL}/ai/hints`,
  AI_REVIEW: `${BASE_URL}/ai/review`,
  AI_TUTOR: `${BASE_URL}/ai/tutor`,
  AI_MOCK_INTERVIEW: `${BASE_URL}/ai/mock-interview`,

  // Friend Battle Rooms
  CREATE_ROOM: `${BASE_URL}/rooms/create`,
  JOIN_ROOM: `${BASE_URL}/rooms/join`,
  ROOM_DETAIL: (code: string) => `${BASE_URL}/rooms/${code}`,

  // Leaderboard & Stats
  DASHBOARD_STATS: `${BASE_URL}/dashboard/stats`,
  LEADERBOARD: `${BASE_URL}/leaderboard`,
};
```

---

## 💻 SAMPLE REACT NATIVE / EXPO IMPLEMENTATION

### `App.tsx` (Root Setup with Navigation & Auth)
```tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Zap, Swords, Bot, User } from 'lucide-react-native';

import HomeScreen from './screens/HomeScreen';
import MicroDrillScreen from './screens/MicroDrillScreen';
import BattleRoomScreen from './screens/BattleRoomScreen';
import VoiceInterviewScreen from './screens/VoiceInterviewScreen';
import ProfileScreen from './screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#020817' },
          headerTintColor: '#fff',
          tabBarStyle: { backgroundColor: '#020817', borderTopColor: '#1e293b' },
          tabBarActiveTintColor: '#06b6d4',
          tabBarInactiveTintColor: '#64748b',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color }) => <Home color={color} size={20} /> }} />
        <Tab.Screen name="Drills" component={MicroDrillScreen} options={{ tabBarIcon: ({ color }) => <Zap color={color} size={20} /> }} />
        <Tab.Screen name="Battles" component={BattleRoomScreen} options={{ tabBarIcon: ({ color }) => <Swords color={color} size={20} /> }} />
        <Tab.Screen name="Voice AI" component={VoiceInterviewScreen} options={{ tabBarIcon: ({ color }) => <Bot color={color} size={20} /> }} />
        <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: ({ color }) => <User color={color} size={20} /> }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

---

## 🚀 ROADMAP TO BUILD & LAUNCH THE MOBILE APP

1. **Setup Repo**: Initialize Expo app with `npx create-expo-app CodeForgeGo --template blank-typescript`.
2. **Install Icons & UI**: `npm i lucide-react-native nativewind react-native-reanimated`.
3. **Connect API**: Configure Axios/Fetch client pointed to `https://hackathon2-olive-eight.vercel.app/api`.
4. **Build Screens**: Implement Home, 5-Min Micro-Drill, Friend Battle QR Scanner, and Voice AI Interviewer.
5. **Build & Publish**: Use EAS Build (`npx eas build --platform all`) to output iOS `.ipa` and Android `.apk` / `.aab` bundles for App Store and Google Play!

---
*CodeForge Go — Mastering DSA & AI Interview Prep Anytime, Anywhere.*
