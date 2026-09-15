import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import { GameView } from './src/components/GameView';
import { Hud, SensorDebug } from './src/components/Hud';
import { useGameController } from './src/hooks/useGameController';
import { HomeScreen } from './src/screens/HomeScreen';
import { CalibrationScreen } from './src/screens/CalibrationScreen';
import { PauseScreen } from './src/screens/PauseScreen';
import { ResultScreen } from './src/screens/ResultScreen';

export default function App() {
  const controller = useGameController();
  const { screen } = controller;
  return (
    <View style={styles.root}>
      <StatusBar hidden />
      <GameView ref={controller.scene} />
      {['playing', 'paused', 'falling', 'over'].includes(screen) && <Hud controller={controller} />}
      {screen === 'home' && <HomeScreen controller={controller} />}
      {screen === 'calibration' && <CalibrationScreen controller={controller} />}
      {screen === 'paused' && <PauseScreen controller={controller} />}
      {screen === 'over' && <ResultScreen controller={controller} />}
      {screen === 'playing' && !controller.sensor.ready && (
        <View style={styles.notice}>
          <Text>Aguardando leituras do sensor…</Text>
        </View>
      )}
      {controller.debug && <SensorDebug controller={controller} />}
    </View>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#cadce4' },
  notice: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#f4f7f8',
  },
});
