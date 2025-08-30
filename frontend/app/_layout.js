import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: "#1DB954",
          },
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "MoodTunes",
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: "Capture Your Mood",
          }}
        />
        <Stack.Screen
          name="results"
          options={{
            title: "Your Recommendations",
          }}
        />
        <Stack.Screen
          name="manual-select"
          options={{
            title: "Select Your Mood",
          }}
        />
      </Stack>
    </>
  );
}