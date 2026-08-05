import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SCALE_DICTIONARY } from './constants';

export const ScaleDictScreen = ({ theme }) => {
  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={[styles.screenTitle, { color: theme.text }]}>Scale Dictionary (Qenet)</Text>
      <Text style={[styles.screenSub, { color: theme.subText }]}>Traditional scale notes and features.</Text>
      {SCALE_DICTIONARY.map((s) => (
        <View key={s.name} style={[styles.dictCard, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Text style={[styles.dictTitle, { color: theme.text }]}>{s.name}</Text>
          <Text style={[styles.dictNotes, { color: theme.subText }]}>{s.notes}</Text>
          <Text style={[styles.dictDesc, { color: theme.subText }]}>{s.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screenTitle: { fontSize: 20, fontWeight: '800' },
  screenSub: { fontSize: 13, marginBottom: 14 },
  dictCard: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 10 },
  dictTitle: { fontSize: 16, fontWeight: '700' },
  dictNotes: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  dictDesc: { fontSize: 13 },
});