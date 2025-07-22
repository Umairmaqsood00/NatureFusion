import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
  Modal,
  Button,
  TextInput,
  FlatList,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";
import { Audio } from "expo-av";
import { useState, useRef, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import Slider from "@react-native-community/slider";
import AnimatedParticles from "./components/AnimatedParticles.js";
import SoundControl from "./components/SoundControl.js";
import BackgroundGradient from "./components/BackgroundGradient.js";

const SOUNDS = [
  {
    key: "wind",
    label: "Wind",
    icon: "💨",
    file: require("./assets/mp3/wind.mp3"),
  },
  {
    key: "crickets",
    label: "Crickets",
    icon: "🦗",
    file: require("./assets/mp3/crickets.mp3"),
  },
  {
    key: "birds",
    label: "Birds",
    icon: "🕊️",
    file: require("./assets/mp3/birds.mp3"),
  },
  {
    key: "waves",
    label: "Waves",
    icon: "🌊",
    file: require("./assets/mp3/waves.mp3"),
  },
  {
    key: "rain2",
    label: "Rain",
    icon: "☔",
    file: require("./assets/mp3/rain2.mp3"),
  },
  {
    key: "rainwiththunder",
    label: "Rain with Thunder",
    icon: "🌧️⚡",
    file: require("./assets/mp3/rainwiththunder.mp3"),
  },
  {
    key: "stormrainthunder",
    label: "Storm Rain Thunder",
    icon: "🌩️",
    file: require("./assets/mp3/stormrainthunder.mp3"),
  },
  {
    key: "coffeeshop",
    label: "Coffee\nshop",
    icon: "☕",
    file: require("./assets/mp3/coffeeshop.mp3"),
  },
];

const { width, height } = Dimensions.get("window");

export default function App() {
  const [soundStates, setSoundStates] = useState(
    SOUNDS.reduce((acc, s) => {
      acc[s.key] = { isPlaying: false, volume: 0.7 };
      return acc;
    }, {})
  );
  const soundRefs = useRef(
    SOUNDS.reduce((acc, s) => {
      acc[s.key] = null;
      return acc;
    }, {})
  );
  const [timerModalVisible, setTimerModalVisible] = useState(false);
  const [timerMinutes, setTimerMinutes] = useState("");
  const timerRef = useRef(null);
  const [mixesModalVisible, setMixesModalVisible] = useState(false);
  const [mixes, setMixes] = useState([]);
  const [newMixName, setNewMixName] = useState("");
  const [timerRemaining, setTimerRemaining] = useState(null);
  const timerIntervalRef = useRef(null);

  const handlePlayPause = async (key) => {
    try {
      const state = soundStates[key];
      if (!state.isPlaying) {
        if (!soundRefs.current[key]) {
          const { sound } = await Audio.Sound.createAsync(
            SOUNDS.find((s) => s.key === key)?.file,
            { shouldPlay: true, volume: state.volume }
          );
          soundRefs.current[key] = sound;
        } else {
          await soundRefs.current[key].playAsync();
        }
        setSoundStates((prev) => ({
          ...prev,
          [key]: { ...prev[key], isPlaying: true },
        }));
      } else {
        if (soundRefs.current[key]) {
          await soundRefs.current[key].pauseAsync();
        }
        setSoundStates((prev) => ({
          ...prev,
          [key]: { ...prev[key], isPlaying: false },
        }));
      }
    } catch (e) {
      Alert.alert("Sound Error", "Sound file missing or failed to load.");
    }
  };

  const handleVolumeChange = (key, value) => {
    setSoundStates((prev) => ({
      ...prev,
      [key]: { ...prev[key], volume: value },
    }));
  };

  const handleVolumeSet = async (key, value) => {
    if (soundRefs.current[key]) {
      await soundRefs.current[key].setVolumeAsync(value);
    }
  };

  const stopAllSounds = async () => {
    for (const key of Object.keys(soundStates)) {
      if (soundRefs.current[key] && soundStates[key].isPlaying) {
        await soundRefs.current[key].pauseAsync();
      }
    }
    setSoundStates((prev) => {
      const newState = { ...prev };
      for (const key of Object.keys(newState)) {
        newState[key].isPlaying = false;
      }
      return newState;
    });
  };

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    const ms = parseInt(timerMinutes) * 60 * 1000;
    if (!isNaN(ms) && ms > 0) {
      setTimerRemaining(Math.floor(ms / 1000));
      timerIntervalRef.current = setInterval(() => {
        setTimerRemaining(prev => {
          if (prev && prev > 1) return prev - 1;
          clearInterval(timerIntervalRef.current);
          return null;
        });
      }, 1000);
      timerRef.current = setTimeout(() => {
        stopAllSounds();
        setTimerModalVisible(false);
        setTimerMinutes("");
        setTimerRemaining(null);
        clearInterval(timerIntervalRef.current);
        Alert.alert("Timer ended", "All sounds stopped.");
      }, ms);
      setTimerModalVisible(false);
      setTimerMinutes("");
    }
  };

  const saveCurrentMix = () => {
    const name = newMixName.trim();
    if (!name) return;
    if (mixes.some((mix) => mix.name === name)) {
      Alert.alert("Mix name already exists!");
      return;
    }
    setMixes((prev) => [...prev, { name, state: { ...soundStates } }]);
    setNewMixName("");
    Keyboard.dismiss();
  };

  const loadMix = (mix) => {
    setSoundStates({ ...mix.state });
    setMixesModalVisible(false);
  };

  const deleteMix = (name) => {
    setMixes((prev) => prev.filter((m) => m.name !== name));
  };

  const stopTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    setTimerRemaining(null);
  };

  useEffect(() => {
    SOUNDS.forEach(async (s) => {
      if (!soundRefs.current[s.key]) {
        const { sound } = await Audio.Sound.createAsync(s.file, {
          isLooping: true,
          volume: 0.7,
        });
        soundRefs.current[s.key] = sound;
      }
    });
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      SOUNDS.forEach(async (s) => {
        if (soundRefs.current[s.key] !== null) {
          await soundRefs.current[s.key]?.unloadAsync();
        }
      });
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <BackgroundGradient />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-start" }}
      >
        <AnimatedParticles />
        <StatusBar style="light" />
        <Text style={styles.title}>NatureFusion</Text>
        <Text style={styles.tagline}>
          Find your calm with nature-inspired soundscapes
        </Text>
        <View style={styles.soundsRow}>
          {SOUNDS.map((sound) => (
            <SoundControl
              key={sound.key}
              sound={sound}
              state={soundStates[sound.key]}
              onPlayPause={() => handlePlayPause(sound.key)}
              onVolumeChange={(value) => handleVolumeChange(sound.key, value)}
              onVolumeSet={(value) => handleVolumeSet(sound.key, value)}
            />
          ))}
        </View>
        {timerRemaining !== null && timerRemaining > 0 && (
          <View style={styles.timerCountdownCentered}>
            <Text style={styles.timerCountdownText}>
              ⏰ {`${String(Math.floor(timerRemaining / 60)).padStart(2, '0')}:${String(timerRemaining % 60).padStart(2, '0')}`}
            </Text>
            <TouchableOpacity onPress={stopTimer} style={{ marginLeft: 6 }}>
              <Text style={styles.stopTimerText}>✖</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setTimerModalVisible(true)}
          >
            <Text style={styles.controlButtonText}>Timers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setMixesModalVisible(true)}
          >
            <Text style={styles.controlButtonText}>Mixes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
        <Modal visible={timerModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Set Timer (minutes)</Text>
              <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                value={timerMinutes}
                onChangeText={setTimerMinutes}
                placeholder="Enter minutes"
              />
              <Button title="Start Timer" onPress={startTimer} />
              <Button
                title="Cancel"
                onPress={() => setTimerModalVisible(false)}
                color="#888"
              />
            </View>
          </View>
        </Modal>
        <Modal visible={mixesModalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Your Mixes</Text>
                <FlatList
                  data={mixes}
                  keyExtractor={(item) => item.name}
                  renderItem={({ item }) => (
                    <View style={styles.mixRow}>
                      <TouchableOpacity onPress={() => loadMix(item)}>
                        <Text style={styles.mixName}>{item.name}</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => deleteMix(item.name)}>
                        <Text style={styles.deleteMix}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={{ color: "#888", marginBottom: 10 }}>
                      No mixes saved yet.
                    </Text>
                  }
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Mix name"
                  value={newMixName}
                  onChangeText={setNewMixName}
                />
                <Button title="Save Current Mix" onPress={saveCurrentMix} />
                <Button
                  title="Close"
                  onPress={() => setMixesModalVisible(false)}
                  color="#888"
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: "#fff",
    fontSize: 38,
    fontWeight: "bold",
    letterSpacing: 2,
    marginBottom: 6,
    marginTop: 70,
    alignSelf: "center",
  },
  tagline: {
    color: "#c9bdbdff",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  soundsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-end",
    marginBottom: 40,
    maxWidth: 700,
    alignSelf: "center",
  },
  soundControl: {
    alignItems: "center",
    marginHorizontal: 8,
    marginBottom: 10,
    width: 80,
  },
  soundButton: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 40,
    padding: 12,
    marginHorizontal: 8,
    alignItems: "center",
    width: 70,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  soundButtonActive: {
    backgroundColor: "#a8edea",
    borderWidth: 2,
    borderColor: "#222",
  },
  soundIcon: {
    fontSize: 32,
    marginBottom: 2,
  },
  soundLabel: {
    color: "#222",
    fontSize: 13,
    fontWeight: "bold",
  },
  playButton: {
    backgroundColor: "#fff",
    borderRadius: 50,
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    alignSelf: "center",
    marginBottom: 30,
  },
  playIcon: {
    fontSize: 48,
    color: "#222",
    fontWeight: "bold",
  },
  controlRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  controlButton: {
    backgroundColor: "rgba(255,255,255,0.3)",
    borderColor: "#a8edea",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
  controlButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 1,
  },
  slider: {
    width: 70,
    height: 30,
    marginTop: 2,
  },
  playIconSmall: {
    fontSize: 18,
    color: "#222",
    fontWeight: "bold",
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: 280,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#fff",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#a8edea",
    borderRadius: 6,
    padding: 8,
    width: "100%",
    marginBottom: 16,
    fontSize: 16,
    textAlign: "center",
  },
  mixRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 8,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mixName: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  deleteMix: {
    fontSize: 18,
    color: "#e55",
    marginLeft: 12,
  },
  timerCountdown: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(30,30,30,0.85)',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    zIndex: 100,
  },
  timerCountdownText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  stopTimerText: {
    color: '#ff6666',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  timerCountdownCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(30,30,30,0.85)',
    borderRadius: 16,
    marginBottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
}); 