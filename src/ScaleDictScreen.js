import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SCALE_DICTIONARY } from './constants';

export const ScaleDictScreen = ({ theme }) => {
  return (
    <ScrollView
      style={[st.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={st.content}>

      {/* Header */}
      <View style={[st.header, { borderBottomColor: theme.divider }]}>
        <Text style={[st.title, { color: theme.text }]}>Scale Dictionary (Qenet)</Text>
        <Text style={[st.sub, { color: theme.subText }]}>
          Traditional Ethiopian scales, notes, and characteristics.
        </Text>
      </View>

      {/* Scale list */}
      <View style={st.list}>
        {SCALE_DICTIONARY.map((scale, index) => (
          <View
            key={scale.name}
            style={[
              st.item,
              index < SCALE_DICTIONARY.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.divider,
              },
            ]}>
            <View style={st.rowHeader}>
              <Text style={[st.scaleName, { color: theme.text }]}>{scale.name}</Text>
              <Text style={[st.scaleNotes, { color: theme.subText, borderColor: theme.border }]}>
                {scale.notes}
              </Text>
            </View>
            <Text style={[st.scaleDesc, { color: theme.subText }]}>{scale.description}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 48 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 18, fontWeight: '600' },
  sub: { fontSize: 13, marginTop: 2, lineHeight: 18 },

  list: { paddingHorizontal: 16 },
  item: {
    paddingVertical: 14,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  scaleName: { fontSize: 16, fontWeight: '500' },
  scaleNotes: {
    fontSize: 12, fontWeight: '500',
    borderWidth: 1, borderRadius: 4,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  scaleDesc: { fontSize: 14, lineHeight: 20 },
});