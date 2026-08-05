import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parseChordLine, transposeChord } from './chordParser';

const LyricChordSegment = React.memo(({ chord, lyric, semitones, showChords, themeState, isDarkMode }) => {
  const chordColor = isDarkMode ? '#4DA6FF' : '#0066FF';
  const transposed = chord ? transposeChord(chord, semitones) : null;

  return (
    <View style={styles.segmentContainer}>
      {showChords && (
        <Text style={[styles.chordText, { color: chordColor }]}>
          {transposed || ' '}
        </Text>
      )}
      <Text style={[styles.lyricText, { color: themeState.text }]}>
        {lyric || ' '}
      </Text>
    </View>
  );
});

export const SongContentViewer = React.memo(({ content, semitones, showChords, themeState, isDarkMode }) => {
  const parsedLines = useMemo(() => {
    if (!content) return [];
    return content.split('\n').map(parseChordLine);
  }, [content]);

  if (!content || !content.trim()) {
    return (
      <Text style={{ fontStyle: 'italic', color: themeState.subText, textAlign: 'center', marginVertical: 20 }}>
        No lyrics or chords provided for this song.
      </Text>
    );
  }

  const headerColor = isDarkMode ? '#FFB74D' : '#E65100';

  return (
    <View style={{ flex: 1 }}>
      {parsedLines.map((lineObj, idx) => {
        if (lineObj.type === 'blank') {
          return <View key={`blank-${idx}`} style={{ height: 12 }} />;
        }

        if (lineObj.type === 'section') {
          return (
            <View key={`sec-${idx}`} style={{ marginTop: 14, marginBottom: 4 }}>
              <Text style={[styles.sectionHeader, { color: headerColor }]}>
                {lineObj.text}
              </Text>
            </View>
          );
        }

        return (
          <View key={`line-${idx}`} style={styles.lineRow}>
            {lineObj.segments.map((seg, sIdx) => (
              <LyricChordSegment
                key={`seg-${idx}-${sIdx}`}
                chord={seg.chord}
                lyric={seg.lyric}
                semitones={semitones}
                showChords={showChords}
                themeState={themeState}
                isDarkMode={isDarkMode}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  lineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginVertical: 2,
  },
  segmentContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  chordText: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 1,
    paddingRight: 2,
  },
  lyricText: {
    fontSize: 16,
    lineHeight: 22,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
});