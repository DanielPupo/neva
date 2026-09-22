import React from 'react';
import { Text } from 'react-native';
import { Button, Note, Panel, Stat } from '../components/ui/Controls';
import { colors } from '../config/theme';
import type { GameController } from '../hooks/useGameController';

export function ResultScreen({ controller: c }: { controller: GameController }) {
  return (
    <Panel label="FIM DA DESCIDA" title={'Uma nova linha\nespera por você.'}>
      <Text style={{ fontSize: 54, fontWeight: '800', color: colors.accent }}>
        {c.hud.score}
        <Text style={{ fontSize: 17, color: colors.muted }}> pts</Text>
      </Text>
      <Stat label="Distância" value={`${c.hud.distance} m`} />
      <Stat label="Obstáculos superados" value={c.hud.dodged} />
      <Stat label="Recorde" value={`${c.recordStore.records.score} pts`} />
      <Note>{c.recordStore.error}</Note>
      <Button label="DESCER NOVAMENTE  ↗" onPress={c.start} />
      <Button secondary label="MENU" onPress={c.menu} />
    </Panel>
  );
}
