import React, { useRef, useEffect } from 'react';
import { Animated, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AnimatedParticles() {
  // Simple animated particles (bubbles)
  const particles = Array.from({ length: 12 }, (_, i) => i);
  return (
    <>
      {particles.map(i => {
        const left = Math.random() * width * 0.9;
        const size = 18 + Math.random() * 22;
        const anim = useRef(new Animated.Value(height + Math.random() * 100)).current;
        useEffect(() => {
          Animated.loop(
            Animated.sequence([
              Animated.timing(anim, {
                toValue: -40,
                duration: 9000 + Math.random() * 4000,
                useNativeDriver: true,
              }),
              Animated.timing(anim, {
                toValue: height + Math.random() * 100,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ).start();
        }, []);
        return (
          <Animated.View
            key={i}
            style={{
              position: 'absolute',
              left,
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: 'rgba(255,255,255,0.18)',
              transform: [{ translateY: anim }],
              opacity: 0.7,
            }}
          />
        );
      })}
    </>
  );
} 