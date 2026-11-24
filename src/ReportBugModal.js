import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ReportBugModal = ({ visible, onClose, theme }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [description, setDescription] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const categories = ['General', 'Playback / Audio', 'Chords / Transpose', 'Import / Export', 'UI / Display'];

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please provide a short summary of the bug.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe what went wrong or how to reproduce it.');
      return;
    }

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setTitle('');
      setDescription('');
      setCategory('General');
      onClose();
      Alert.alert(
        'Bug Report Recorded',
        'Thank you for reporting this issue! Your feedback will help improve Selah Kignit.'
      );
    }, 600);
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setCategory('General');
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}>
      <SafeAreaView style={[st.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={[st.header, { borderBottomColor: theme.border, backgroundColor: theme.headerBg || theme.cardBg }]}>
          <TouchableOpacity onPress={handleClose} style={st.headerBtn} activeOpacity={0.7}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={[st.headerTitle, { color: theme.text }]}>Report a Bug</Text>
          <View style={{ width: 36 }} />
        </View>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={st.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={[st.card, { backgroundColor: theme.cardBg, borderColor: theme.border }]}>
              {/* Category Picker */}
              <Text style={[st.fieldLabel, { color: theme.subText }]}>BUG CATEGORY</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={st.catRow}>
                {categories.map((cat) => {
                  const sel = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        st.catChip,
                        {
                          backgroundColor: sel ? theme.tint : theme.secondaryBg,
                          borderColor: sel ? theme.tint : theme.border,
                        },
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}>
                      <Text
                        style={[
                          st.catChipText,
                          { color: sel ? '#1E1909' : theme.text, fontWeight: sel ? '700' : '500' },
                        ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Title / Summary */}
              <Text style={[st.fieldLabel, { color: theme.subText, marginTop: 16 }]}>SUMMARY</Text>
              <TextInput
                style={[st.input, { color: theme.text, backgroundColor: theme.secondaryBg, borderColor: theme.border }]}
                placeholder="Brief description of the problem..."
                placeholderTextColor={theme.subText}
                value={title}
                onChangeText={setTitle}
              />

              {/* Description */}
              <Text style={[st.fieldLabel, { color: theme.subText, marginTop: 16 }]}>DETAILS & REPRODUCTION</Text>
              <TextInput
                style={[
                  st.textArea,
                  { color: theme.text, backgroundColor: theme.secondaryBg, borderColor: theme.border },
                ]}
                placeholder="What happened? What were you doing when it occurred?"
                placeholderTextColor={theme.subText}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                st.submitBtn,
                { backgroundColor: isSubmitted ? '#10B981' : theme.tint },
              ]}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <Ionicons
                name={isSubmitted ? 'checkmark-circle' : 'bug-outline'}
                size={18}
                color="#1E1909"
                style={{ marginRight: 8 }}
              />
              <Text style={st.submitBtnText}>
                {isSubmitted ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const st = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    fontFamily: 'AnthropicSansDisplay-Bold',
  },
  headerBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'AnthropicSansDisplay-Bold',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  catRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  catChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
  },
  catChipText: {
    fontSize: 13,
    fontFamily: 'AnthropicSerifText-Medium',
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    fontFamily: 'AnthropicSerifText-Medium',
  },
  textArea: {
    height: 120,
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    fontSize: 14,
    fontFamily: 'AnthropicSerifText-Medium',
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#1E1909',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'AnthropicSansDisplay-Bold',
  },
});

