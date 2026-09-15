import React from 'react';
import { Text } from 'react-native';
import { Button, Note, Panel, styles } from '../components/ui/Controls';
import type { GameController } from '../hooks/useGameController';

export function PauseScreen({ controller: c }: { controller: GameController }) {
  return (
    <Panel label="NO SEU TEMPO" title="Descida pausada.">
      <Text style={styles.body}>Volte à posição de calibragem antes de continuar.</Text>
      <Note>{c.message}</Note>
      <Button label="CONTINUAR" onPress={c.resume} />
      <Button secondary label="RECALIBRAR" onPress={c.recalibrate} />
      <Button secondary label="REINICIAR" onPress={c.start} />
      <Button secondary label="SAIR PARA O MENU" onPress={c.menu} />
    </Panel>
  );
}
