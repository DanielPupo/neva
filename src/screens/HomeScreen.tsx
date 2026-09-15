import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { GameController } from '../hooks/useGameController';
import { Button, Note, styles as ui } from '../components/ui/Controls';
import { colors } from '../config/theme';

export function HomeScreen({ controller: c }: { controller: GameController }) {
  return (
    <View style={styles.home}>
      <View>
        <Text style={ui.eyebrow}>ENCONTRE SUA LINHA</Text>
        <Text style={styles.logo}>
          NEVA<Text style={{ color: colors.accent }}>.</Text>
        </Text>
        <Text style={styles.subtitle}>{'Sinta a montanha.\nSiga seu movimento.'}</Text>
      </View>
      <View style={styles.bottom}>
        <Text style={styles.tag}>SNOWBOARD / ALPINE RUN</Text>
        <Button disabled={!c.recordStore.loaded} label="INICIAR DESCIDA  ↗" onPress={c.start} />
        <View style={styles.records}>
          <Text style={ui.small}>MELHOR DESCIDA</Text>
          <Text style={styles.record}>{c.recordStore.records.distance} m</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={c.toggleDebug}>
          <Text style={ui.small}>Diagnóstico do sensor: {c.debug ? 'ligado' : 'desligado'}</Text>
        </Pressable>
        <Note>{c.recordStore.error}</Note>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  home: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingTop: 64,
    paddingBottom: 32,
  },
  logo: { fontSize: 84, fontWeight: '900', letterSpacing: -5, color: colors.ink },
  subtitle: { fontSize: 16, lineHeight: 24, color: colors.ink },
  bottom: { backgroundColor: '#f8fbfdde', borderRadius: 24, padding: 19 },
  tag: {
    fontSize: 9,
    color: colors.muted,
    textAlign: 'center',
    letterSpacing: 1.7,
    fontWeight: '700',
  },
  records: { alignItems: 'center', marginVertical: 14 },
  record: { fontSize: 22, fontWeight: '700', color: colors.ink },
});
