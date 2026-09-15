import AsyncStorage from '@react-native-async-storage/async-storage';
export type Records = { distance: number; score: number; games: number };
export const EMPTY: Records = { distance: 0, score: 0, games: 0 };
export async function loadRecords(): Promise<Records> {
  const text = await AsyncStorage.getItem('neva.records.v1');
  if (!text) return { ...EMPTY };
  const v = JSON.parse(text);
  if (
    !v ||
    ![v.distance, v.score, v.games].every(
      (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0,
    )
  )
    return { ...EMPTY };
  return { distance: v.distance, score: v.score, games: v.games };
}
export async function saveRecords(records: Records) {
  await AsyncStorage.setItem('neva.records.v1', JSON.stringify(records));
}
