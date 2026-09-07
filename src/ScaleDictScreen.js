import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SCALE_DICTIONARY } from './constants';

const AMBER = '#E5A93C';

export const ScaleDictScreen = ({ theme }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredScales = SCALE_DICTIONARY.filter((scale) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      scale.name.toLowerCase().includes(q) ||
      scale.notes.toLowerCase().includes(q) ||
      scale.description.toLowerCase().includes(q)
    );
  });

  return (
    <ScrollView
      style={[st.root, { backgroundColor: theme.bg }]}
      contentContainerStyle={st.content}
      showsVerticalScrollIndicator={false}>

      {/* ── Header Hero ── */}
      <View style={[st.header, { borderBottomColor: theme.divider }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <View style={[st.iconPill, { backgroundColor: `${AMBER}18` }]}>
            <Ionicons name="book-outline" size={16} color={AMBER} />
          </View>

          <Text style={[st.title, { color: theme.text }]}>Scale Dictionary (ቅኝት)</Text>
        </View>

        <Text style={[st.sub, { color: theme.subText }]}>
          Traditional Ethiopian liturgical pentatonic & modal scales, pitch structures, and worship characteristics.
        </Text>
      </View>

      {/* ── Search Bar ── */}
      <View style={st.searchWrap}>
        <View style={[st.searchBar, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <Ionicons name="search-outline" size={18} color={theme.subText} style={st.searchIcon} />
          <TextInput
            style={[st.searchInput, { color: theme.text }]}
            placeholder="Search scales by name (Tizeta, Ambassel, Bati…)"
            placeholderTextColor={theme.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
          />
          {searchQuery.length > 0 && Platform.OS !== 'ios' ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={theme.subText} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ── Scale Cards List ── */}
      <View style={st.list}>
        {filteredScales.length === 0 ? (
          <View style={st.empty}>
            <Ionicons name="search-outline" size={32} color={theme.subText} style={{ marginBottom: 8 }} />
            <Text style={[st.emptyTitle, { color: theme.text }]}>No Scales Found</Text>
            <Text style={[st.emptySub, { color: theme.subText }]}>
              No scale matching "{searchQuery}" was found.
            </Text>
          </View>
        ) : (
          filteredScales.map((scale) => (
            <View
              key={scale.name}
              style={[st.card, { backgroundColor: theme.secondaryBg, borderColor: theme.border }]}>
              {/* Header line */}
              <View style={st.cardHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[st.scaleName, { color: theme.text }]}>{scale.name}</Text>
                </View>

                {/* Notes Pill */}
                <View style={[st.notesPill, { backgroundColor: theme.cardBg, borderColor: `${AMBER}35` }]}>
                  <Ionicons name="key-outline" size={11} color={AMBER} style={{ marginRight: 4 }} />
                  <Text style={[st.scaleNotes, { color: AMBER }]}>{scale.notes}</Text>
                </View>
              </View>

              {/* Description */}
              <Text style={[st.scaleDesc, { color: theme.subText }]}>{scale.description}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const st = StyleSheet.create({
  root: { flex: 1 },
  content: { paddingBottom: 96 },

  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconPill: {
    padding: 6,
    borderRadius: 8,
  },
  title: { fontSize: 19, fontWeight: '700', letterSpacing: -0.2 },
  sub: { fontSize: 13, marginTop: 4, lineHeight: 19 },

  searchWrap: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    height: 46,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14.5, padding: 0, fontWeight: '500' },

  list: { paddingHorizontal: 16, paddingTop: 4, gap: 10 },
  card: {
    padding: 14,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  scaleName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  notesPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  scaleNotes: { fontSize: 12, fontWeight: '700' },
  scaleDesc: { fontSize: 13.5, lineHeight: 19 },

  empty: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  emptySub: { fontSize: 13, textAlign: 'center' },
});

export default ScaleDictScreen;