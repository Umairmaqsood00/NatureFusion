import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';

export default function SoundControl({ sound, state, onPlayPause, onVolumeChange, onVolumeSet }) {
  return (
    <View style={styles.soundControl}>
      <TouchableOpacity
        style={[styles.soundButton, state.isPlaying && styles.soundButtonActive]}
        onPress={onPlayPause}
        accessibilityLabel={`Play or pause ${sound.label} sound`}
        accessibilityRole="button"
        activeOpacity={0.85}
      >
        <View style={styles.iconWrapper}>
          {sound.key === 'rainwiththunder' ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={styles.soundIcon}>🌧️</Text>
              <Text style={styles.soundIcon}>⚡</Text>
            </View>
          ) : (
            <Text style={styles.soundIcon}>{sound.icon}</Text>
          )}
        </View>
        <View style={styles.labelWrapper}>
          <Text
            style={styles.soundLabel}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {sound.label}
          </Text>
        </View>
        <Text style={styles.playIconSmall}>{state.isPlaying ? '⏸' : '▶'}</Text>
      </TouchableOpacity>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={1}
        value={state.volume}
        onValueChange={onVolumeChange}
        onSlidingComplete={onVolumeSet}
        minimumTrackTintColor="#1a2980"
        maximumTrackTintColor="#fff"
        thumbTintColor="#a8edea"
        accessibilityLabel={`Volume for ${sound.label}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  soundControl: {
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 18,
    width: 100,
  },
  soundButton: {
    backgroundColor: 'rgba(30,30,30,0.85)',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 100,
    height: 120,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  soundButtonActive: {
    backgroundColor: '#1a2980',
    borderWidth: 2,
    borderColor: '#fff',
  },
  soundIcon: {
    fontSize: 36,
    marginBottom: 4,
  },
  soundLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 80,
  },
  slider: {
    width: 90,
    height: 30,
    marginTop: 6,
  },
  playIconSmall: {
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 2,
  },
  iconWrapper: {
    height: 38, // or whatever fits your icon
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  labelWrapper: {
    height: 36, // enough for 2 lines of text
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
}); 