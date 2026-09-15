import React from 'react';
import { Text, View } from 'react-native';
import { Button, Note, Panel, styles } from '../components/ui/Controls';
import type { GameController } from '../hooks/useGameController';

export function CalibrationScreen({ controller: c }: { controller: GameController }) {
  return (
    <Panel label="PREPARE SUA DESCIDA" title={'Seu celular.\nSeu equilíbrio.'}>
      <Text style={styles.body}>
        Segure o celular em pé, na posição confortável, e mantenha-o parado por 1 segundo.
      </Text>
      <View style={{ gap: 13, marginVertical: 22 }}>
        <Text style={styles.body}>01 Incline à direita → vá à direita.</Text>
        <Text style={styles.body}>02 Incline à esquerda → vá à esquerda.</Text>
        <Text style={styles.body}>03 Volte ao neutro antes de virar de novo.</Text>
        <Text style={styles.body}>04 Eleve brevemente o celular para saltar.</Text>
      </View>
      <Text style={styles.body}>Salte os troncos. Contorne árvores e pedras.</Text>
      <Note>{c.sensor.error || c.message}</Note>
      <Button
        label={c.sensor.ready ? 'CALIBRAR E DESCER' : 'AGUARDANDO SENSOR…'}
        disabled={!c.sensor.ready}
        onPress={c.calibrate}
      />
      <Button secondary label="VOLTAR" onPress={c.backFromCalibration} />
    </Panel>
  );
}
