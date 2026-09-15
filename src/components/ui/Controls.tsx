import React, { type PropsWithChildren } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../config/theme';

export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        { opacity: disabled ? 0.4 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text style={[styles.buttonText, secondary && { color: colors.ink }]}>{label}</Text>
    </Pressable>
  );
}
export function Panel({
  label,
  title,
  children,
}: PropsWithChildren<{ label: string; title: string }>) {
  return (
    <View style={styles.overlay}>
      <ScrollView contentContainerStyle={styles.panelWrap}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>{label}</Text>
          <Text style={styles.title}>{title}</Text>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}
export function Note({ children }: PropsWithChildren) {
  return children ? <Text style={styles.error}>{children}</Text> : null;
}
export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.body}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
export const styles = StyleSheet.create({
  eyebrow: { fontSize: 10, letterSpacing: 2, fontWeight: '800', color: colors.muted },
  title: {
    fontSize: 30,
    lineHeight: 36,
    color: colors.ink,
    fontWeight: '800',
    marginVertical: 15,
    letterSpacing: -0.8,
  },
  body: { fontSize: 14, lineHeight: 22, color: colors.muted },
  small: { fontSize: 11, lineHeight: 18, color: colors.muted, textAlign: 'center' },
  button: {
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 17,
    marginTop: 12,
  },
  secondary: { backgroundColor: colors.soft },
  buttonText: { fontSize: 12, fontWeight: '800', letterSpacing: 1.1, color: colors.white },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: '#18354b66' },
  panelWrap: { flexGrow: 1, justifyContent: 'center', padding: 22, paddingVertical: 50 },
  card: {
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    padding: 26,
    borderRadius: 28,
    backgroundColor: colors.paper,
  },
  error: { color: colors.error, fontSize: 12, lineHeight: 19, marginVertical: 12 },
  stat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontWeight: '700', color: colors.ink, fontSize: 16 },
});
