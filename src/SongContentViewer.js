import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { parseChordLine, transposeChord } from './chordParser';

const LyricChordSegment = React.memo(
  ({ chord, lyric, semitones, showChords, themeState, isDarkMode, fontSize = 16 }) => {
    // Sanctuary Cyan (#38BDF8 in dark, #0284C7 in light)
    const chordColor = themeState.chord || (isDarkMode ? '#38BDF8' : '#0284C7');
    const transposed = chord ? transposeChord(chord, semitones) : null;
    const chordFontSize = Math.max(12, Math.round(fontSize * 0.88));

    return (
      <View style={styles.segmentContainer}>
        {showChords && (
          <Text
            style={[
              styles.chordText,
              { color: chordColor, fontSize: chordFontSize, lineHeight: chordFontSize + 4 },
            ]}>
            {transposed || ' '}
          </Text>
        )}
        <Text
          style={[
            styles.lyricText,
            {
              color: themeState.text,
              fontSize: fontSize,
              lineHeight: Math.round(fontSize * 1.6),
            },
          ]}>
          {lyric || ' '}
        </Text>
      </View>
    );
  }
);

export const SongContentViewer = React.memo(
  ({ content, semitones, showChords, themeState, isDarkMode, fontSize = 16 }) => {
    const parsedLines = useMemo(() => {
      if (!content) return [];
      return content.split('\n').map(parseChordLine);
    }, [content]);

    if (!content || !content.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: themeState.subText }]}>
            No lyrics or chords provided for this song.
          </Text>
        </View>
      );
    }

    const headerBg = isDarkMode ? 'rgba(134, 38, 51, 0.25)' : 'rgba(134, 38, 51, 0.12)';
    const headerBorder = isDarkMode ? 'rgba(229, 169, 60, 0.3)' : 'rgba(134, 38, 51, 0.25)';
    const headerTextColor = isDarkMode ? '#FFC665' : '#862633';

    return (
      <View style={styles.container}>
        {parsedLines.map((lineObj, idx) => {
          if (lineObj.type === 'blank') {
            return <View key={`blank-${idx}`} style={{ height: Math.round(fontSize * 0.75) }} />;
          }

          if (lineObj.type === 'section') {
            return (
              <View
                key={`sec-${idx}`}
                style={[
                  styles.sectionHeaderWrap,
                  { backgroundColor: headerBg, borderColor: headerBorder },
                ]}>
                <Text style={[styles.sectionHeader, { color: headerTextColor }]}>
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
                  fontSize={fontSize}
                />
              ))}
            </View>
          );
        })}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lineRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    marginVertical: 3,
  },
  segmentContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  chordText: {
    fontWeight: '700',
    marginBottom: 2,
    paddingRight: 3,
    letterSpacing: 0.4,
  },
  lyricText: {
    fontWeight: '400',
  },
  sectionHeaderWrap: {
    alignSelf: 'flex-start',
    marginTop: 18,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
