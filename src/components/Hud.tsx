import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameController } from '../hooks/useGameController';
import { colors } from '../config/theme';

export function Hud({ controller: c }: { controller: GameController }) {
  return (
    <View style={styles.hud}>
      <View style={styles.badge}>
        <Text style={styles.label}>DISTÂNCIA</Text>
        <Text style={styles.number}>
          {c.hud.distance}
          <Text style={styles.unit}> m</Text>
        </Text>
      </View>
      <View style={styles.speed}>
        <Text style={styles.label}>VELOCIDADE</Text>
        <Text style={styles.velocity}>
          {c.hud.speed} <Text style={styles.unit}>km/h</Text>
        </Text>
      </View>
      <View style={styles.scoreBox}>
        <Text style={styles.label}>PONTOS</Text>
        <Text style={styles.score}>{c.hud.score}</Text>
      </View>
      {c.screen === 'playing' && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Pausar partida"
          onPress={c.pause}
          style={styles.pause}
        >
          <Text style={{ color: colors.ink, fontSize: 22, fontWeight: '700' }}>Ⅱ</Text>
        </Pressable>
      )}
    </View>
  );
}
export function SensorDebug({ controller: c }: { controller: GameController }) {
  const [text, setText] = useState('');
  useEffect(() => {
    const timer = setInterval(() => {
      const { x, y, z } = c.sensor.raw.current;
      setText(
        `X ${x.toFixed(2)}  Y ${y.toFixed(2)}  Z ${z.toFixed(2)}\nInclinação ${((c.sensor.detector.current.tilt * 180) / Math.PI).toFixed(0)}° • Faixa ${c.game.current.lane}\nAltura ${c.game.current.height.toFixed(2)} m • Vy ${c.game.current.verticalVelocity.toFixed(2)} m/s`,
      );
    }, 250);
    return () => clearInterval(timer);
  }, [c.sensor.raw, c.sensor.detector, c.game]);
  return (
    <View pointerEvents="none" style={styles.debug}>
      <Text style={{ fontSize: 10, color: '#fff' }}>{text}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  hud: {
    position: 'absolute',
    top: 48,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    backgroundColor: colors.glass,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    minWidth: 108,
    shadowColor: '#234563',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  label: { fontSize: 8, fontWeight: '800', letterSpacing: 1.4, color: colors.muted },
  number: { fontSize: 29, fontWeight: '800', color: colors.ink },
  velocity: { fontSize: 19, fontWeight: '700', color: colors.ink, marginTop: 4 },
  unit: { fontSize: 11, fontWeight: '500' },
  speed: {
    flex: 1,
    backgroundColor: colors.glass,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 18,
    shadowColor: '#234563',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  scoreBox: {
    backgroundColor: colors.accentSoft,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 18,
    minWidth: 72,
    alignItems: 'center',
  },
  score: { fontSize: 22, fontWeight: '800', color: colors.ink },
  pause: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: colors.glass,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#234563',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  debug: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#16354bea',
  },
});
