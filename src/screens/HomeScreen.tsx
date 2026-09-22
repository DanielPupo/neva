import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameController } from '../hooks/useGameController';
import { Button, Note, styles as ui } from '../components/ui/Controls';
import { colors } from '../config/theme';

export function HomeScreen({ controller: c }: { controller: GameController }) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.035,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [pulse]);

  return (
    <View style={styles.home}>
      <View style={styles.hero}>
        <View style={styles.heroCard}>
          <View style={styles.kickerRow}>
            <View style={styles.liveDot} />
            <Text style={ui.eyebrow}>DESCIDA LIVRE / 01</Text>
          </View>
          <Text style={styles.logo}>
            NEVA<Text style={{ color: colors.accent }}>.</Text>
          </Text>
          <Text style={styles.subtitle}>{'Sinta a montanha.\nFaça a sua linha.'}</Text>
          <View style={styles.swoosh} />
          <Text style={styles.challenge}>Você consegue chegar mais longe?</Text>
        </View>
      </View>
      <View style={styles.bottom}>
        <View style={styles.tagRow}>
          <Text style={styles.tag}>SNOWBOARD / ALPINE RUN</Text>
          <Text style={styles.mode}>MODO SOLO</Text>
        </View>
        <View style={styles.moves}>
          <MoveHint symbol="↔" title="INCLINE" detail="mude de faixa" />
          <MoveHint symbol="↑" title="ELEVE" detail="salte troncos" />
          <MoveHint symbol="◇" title="DESVIE" detail="encontre espaço" />
        </View>
        <Animated.View style={{ transform: [{ scale: pulse }] }}>
          <Button disabled={!c.recordStore.loaded} label="INICIAR DESCIDA  ↗" onPress={c.start} />
        </Animated.View>
        <View style={styles.records}>
          <View>
            <Text style={ui.small}>MELHOR DESCIDA</Text>
            <Text style={styles.record}>{c.recordStore.records.distance} m</Text>
          </View>
          <View style={styles.recordDivider} />
          <View>
            <Text style={ui.small}>EXPEDIÇÕES</Text>
            <Text style={styles.record}>{c.recordStore.records.games}</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" onPress={c.toggleDebug}>
          <Text style={ui.small}>Diagnóstico do sensor: {c.debug ? 'ligado' : 'desligado'}</Text>
        </Pressable>
        <Note>{c.recordStore.error}</Note>
      </View>
    </View>
  );
}

function MoveHint({ symbol, title, detail }: { symbol: string; title: string; detail: string }) {
  return (
    <View style={styles.moveHint}>
      <Text style={styles.moveSymbol}>{symbol}</Text>
      <Text style={styles.moveTitle}>{title}</Text>
      <Text style={styles.moveDetail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  home: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 58,
    paddingBottom: 32,
  },
  hero: { paddingTop: 4 },
  heroCard: {
    alignSelf: 'flex-start',
    maxWidth: 310,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderRadius: 22,
    backgroundColor: '#f5fafbf0',
    borderWidth: 1,
    borderColor: '#ffffffcc',
    shadowColor: '#1b3648',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  kickerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef8a4c' },
  logo: { fontSize: 72, fontWeight: '900', letterSpacing: -4, color: colors.ink, marginTop: 8 },
  subtitle: { fontSize: 18, lineHeight: 25, color: '#173448', fontWeight: '700' },
  swoosh: { width: 72, height: 5, borderRadius: 5, backgroundColor: colors.accent, marginTop: 18 },
  challenge: { fontSize: 12, color: '#34576b', marginTop: 12, fontWeight: '800' },
  bottom: {
    backgroundColor: '#f8fbfdf2',
    borderRadius: 24,
    padding: 18,
    shadowColor: '#16354b',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  tagRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: {
    fontSize: 9,
    color: '#34576b',
    textAlign: 'center',
    letterSpacing: 1.7,
    fontWeight: '700',
  },
  mode: {
    fontSize: 9,
    color: colors.accent,
    letterSpacing: 1.2,
    fontWeight: '800',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  moves: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, marginBottom: 2 },
  moveHint: { flex: 1, alignItems: 'center' },
  moveSymbol: { color: colors.accent, fontSize: 22, fontWeight: '700', lineHeight: 25 },
  moveTitle: { color: colors.ink, fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  moveDetail: { color: '#456578', fontSize: 9, marginTop: 2 },
  records: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 22,
    marginVertical: 14,
  },
  record: { fontSize: 22, fontWeight: '700', color: colors.ink },
  recordDivider: { width: 1, height: 30, backgroundColor: colors.line },
});
