import React, { useState, useRef } from 'react';
import {
  View, Text, Modal, TextInput, TouchableOpacity,
  StyleSheet, Dimensions, Animated, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const { width: W } = Dimensions.get('window');

const INSTRUMENTS = [
  'Vocals', 'Guitar', 'Piano / Keys', 'Bass', 'Drums',
  'Violin', 'Cello', 'Trumpet', 'Saxophone', 'Flute', 'Ukulele', 'Organ', 'Synth', 'Other',
];
const PURPOSES = ['Worship leading', 'Band / ensemble practice', 'Learning chords', 'Songwriting', 'Personal devotion', 'Other'];
const SOURCES = ['Friend / word of mouth', 'Social media', 'App store search', 'YouTube', 'Church community', 'Other'];

const STEPS = [
  { key: null, type: 'splash' },
  { key: 'name', type: 'text', icon: 'person-outline', title: 'Your Name', subtitle: 'What should we call you?' },
  { key: 'instrument', type: 'dropdown', icon: 'musical-notes-outline', title: 'Your Instrument', subtitle: 'What instrument do you primarily play?' },
  { key: 'purpose', type: 'radio', icon: 'book-outline', title: 'Using This App', subtitle: 'What do you want to use Selah Kignit for?', options: PURPOSES },
  { key: 'source', type: 'radio', icon: 'megaphone-outline', title: 'How You Found Us', subtitle: 'Where did you hear about Selah Kignit?', options: SOURCES },
  { key: 'darkMode', type: 'theme', icon: 'contrast-outline', title: 'Choose Your Theme', subtitle: 'Pick the look that suits you best.' },
  { key: null, type: 'import' },
];

// ── Radio ─────────────────────────────────────────────────────────────────
const RadioGroup = ({ options, value, onChange, theme }) => (
  <View style={{ gap: 8 }}>
    {options.map((opt) => {
      const sel = value === opt;
      return (
        <TouchableOpacity
          key={opt}
          style={[rb.row, { borderColor: sel ? theme.tint : theme.border, backgroundColor: sel ? theme.chipSelectedBg : theme.cardBg }]}
          onPress={() => onChange(opt)} activeOpacity={0.75}>
          <View style={[rb.circle, { borderColor: sel ? theme.tint : theme.border }]}>
            {sel && <View style={[rb.dot, { backgroundColor: theme.tint }]} />}
          </View>
          <Text style={[rb.label, { color: sel ? theme.chipSelectedText : theme.text }]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);
const rb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 11, borderRadius: 10, borderWidth: 1, minHeight: 44 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5 },
  label: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 15, flex: 1 },
});

// ── Dropdown — list rendered in a transparent Modal so it always floats ──
const Dropdown = ({ options, value, onChange, placeholder, theme }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const openList = () => {
    triggerRef.current?.measureInWindow((x, y, w, h) => {
      setPos({ top: y + h - 2, left: x, width: w });
      setOpen(true);
    });
  };

  return (
    <View>
      <TouchableOpacity
        ref={triggerRef}
        style={[dd.trigger, { borderColor: value ? theme.tint : theme.border, backgroundColor: theme.cardBg }]}
        onPress={open ? () => setOpen(false) : openList}
        activeOpacity={0.8}>
        <Text style={[dd.triggerText, { color: value ? theme.text : theme.subText }]}>{value || placeholder}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.subText} />
      </TouchableOpacity>

      {/* Transparent modal so list floats above everything */}
      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[dd.floating, { top: pos.top, left: pos.left, width: pos.width, backgroundColor: theme.cardBg, borderColor: theme.border }]}>
          <View style={{ maxHeight: 240, overflow: 'hidden', borderRadius: 10 }}>
            <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
              {options.map((opt) => {
                const sel = value === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[dd.item, sel && { backgroundColor: theme.chipSelectedBg }]}
                    onPress={() => { onChange(opt); setOpen(false); }}>
                    <Text style={[dd.itemText, { color: sel ? theme.chipSelectedText : theme.text }]}>{opt}</Text>
                    {sel && <Ionicons name="checkmark" size={16} color={theme.tint} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {/* Bottom fade hint — 4 slices simulate gradient */}
            <View pointerEvents="none" style={dd.fadeWrap}>
              <View style={[dd.fadeSlice, { opacity: 0.0, backgroundColor: theme.cardBg }]} />
              <View style={[dd.fadeSlice, { opacity: 0.25, backgroundColor: theme.cardBg }]} />
              <View style={[dd.fadeSlice, { opacity: 0.6, backgroundColor: theme.cardBg }]} />
              <View style={[dd.fadeSlice, { opacity: 1.0, backgroundColor: theme.cardBg }]} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};
const dd = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14, borderRadius: 10, borderWidth: 1, minHeight: 52 },
  triggerText: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 16, flex: 1 },
  floating: { position: 'absolute', borderRadius: 10, borderWidth: 1, elevation: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 12 },
  item: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, minHeight: 44 },
  itemText: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 15 },
  fadeWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, flexDirection: 'column', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, overflow: 'hidden' },
  fadeSlice: { flex: 1 },
});

// ── Main component ────────────────────────────────────────────────────────
  export const OnboardingModal = ({ visible, theme, onComplete, onImportBackup, onThemeChange }) => {
    const [step, setStep] = useState(0);
    const [data, setData] = useState({ name: '', instrument: '', purpose: '', source: '', darkMode: null });
    const [error, setError] = useState('');
    const slideAnim = useRef(new Animated.Value(0)).current;

    const isLast = step === STEPS.length - 1;
    const current = STEPS[step];
    const noValidate = current.type === 'splash' || current.type === 'import';

    const slideTo = (next) => {
      const dir = next > step ? -1 : 1;
      Animated.timing(slideAnim, { toValue: dir * W * 0.45, duration: 200, useNativeDriver: true }).start(() => {
        setStep(next); setError('');
        slideAnim.setValue(-dir * W * 0.45);
        Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
      });
    };

    const validate = () => {
      if (noValidate) return true;
      const val = current.type === 'theme'
        ? data.darkMode !== null
        : (data[current.key] || '').trim();
      if (!val) { setError('Please complete this step to continue.'); return false; }
      setError(''); return true;
    };

    const handleNext = () => { if (validate()) isLast ? onComplete(data) : slideTo(step + 1); };
    const handleBack = () => { if (step > 0) slideTo(step - 1); };
    const setField = (v) => { setData((d) => ({ ...d, [current.key]: v })); if (error) setError(''); };

    const tint = theme.tint;

    // ── Splash ──
    if (current.type === 'splash') {
      return (
        <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
          <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
            <View style={s.splashCenter}>
              <Ionicons name="musical-notes" size={64} color={tint} style={{ marginBottom: 24 }} />
              <Text style={[s.splashTitle, { color: theme.text }]}>Selah Kignit</Text>
              <Text style={[s.splashSub, { color: theme.subText }]}>
                Your chords, lyrics, and setlists — all in one place.
                {'\n'}Let's set up your profile.
              </Text>
              <TouchableOpacity style={[s.nextBtn, { backgroundColor: tint, marginTop: 48, alignSelf: 'center', paddingHorizontal: 48 }]} onPress={handleNext} activeOpacity={0.85}>
                <Text style={[s.nextText, { color: theme.fabText }]}>Get Started</Text>
                <Ionicons name="arrow-forward" size={18} color={theme.fabText} style={{ marginLeft: 6 }} />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Modal>
      );
    }

    // ── Import step ──
    if (current.type === 'import') {
      return (
        <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
          <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
            <View style={s.top}>
              <View style={s.dotsRow}>
                {STEPS.filter(s => s.type !== 'splash' && s.type !== 'import').map((_, i) => (
                  <View key={i} style={[s.dot, { backgroundColor: tint, width: 20 }]} />
                ))}
              </View>
              <View style={s.headRow}>
                <View style={[s.iconRing, { borderColor: tint }]}>
                  <Ionicons name="cloud-upload-outline" size={28} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.title, { color: theme.text }]}>Import a Backup</Text>
                  <Text style={[s.subtitle, { color: theme.subText }]}>
                    Have a previous Selah Kignit backup? Import it now, or start fresh.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[s.importBtn, { borderColor: tint }]}
                onPress={onImportBackup}
                activeOpacity={0.8}>
                <Ionicons name="document-attach-outline" size={22} color={tint} />
                <Text style={[s.importBtnText, { color: tint }]}>Import Backup File</Text>
              </TouchableOpacity>

              <View style={[s.footer, { marginTop: 16 }]}>
                <TouchableOpacity style={[s.backBtn, { borderColor: theme.border }]} onPress={handleBack}>
                  <Ionicons name="chevron-back" size={18} color={theme.subText} />
                  <Text style={[s.backText, { color: theme.subText }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.nextBtn, { backgroundColor: tint }]} onPress={() => onComplete(data)} activeOpacity={0.85}>
                  <Text style={[s.nextText, { color: theme.fabText }]}>Start Fresh</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{ flex: 1 }} />
          </SafeAreaView>
        </Modal>
      );
    }

    // ── Theme step ──
    const isTheme = current.type === 'theme';
    const THEME_OPTIONS = [
      { label: 'Warm Parchment', value: false, icon: 'sunny-outline' },
      { label: 'Midnight Sanctuary', desc: 'Dark & focused', value: true, icon: 'moon-outline' },
    ];

    return (
      <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent>
        <SafeAreaView style={[s.root, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
          <View style={s.top}>

            {/* Dots — exclude splash & import */}
            <View style={s.dotsRow}>
              {STEPS.filter(st => st.key !== null).map((_, i) => {
                const realStep = STEPS.findIndex((st, si) => st.key !== null && si <= step && i === STEPS.filter(x => x.key !== null).indexOf(STEPS.filter(x => x.key !== null)[i]));
                const active = i < STEPS.filter(st => st.key !== null).indexOf(current) + 1;
                const isCur = STEPS.filter(st => st.key !== null)[i] === current;
                return <View key={i} style={[s.dot, { backgroundColor: active || isCur ? tint : theme.border, width: isCur ? 20 : 8 }]} />;
              })}
            </View>

            <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
              <View style={s.headRow}>
                <View style={[s.iconRing, { borderColor: tint }]}>
                  <Ionicons name={current.icon} size={28} color={tint} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.title, { color: theme.text }]}>{current.title}</Text>
                  <Text style={[s.subtitle, { color: theme.subText }]}>{current.subtitle}</Text>
                </View>
              </View>

              <View>
                {current.type === 'text' && (
                  <TextInput
                    style={[s.input, { backgroundColor: theme.cardBg, borderColor: error ? theme.destructive : theme.border, color: theme.text }]}
                    placeholder="Type your answer…"
                    placeholderTextColor={theme.subText}
                    value={data[current.key]}
                    onChangeText={setField}
                    returnKeyType="next"
                    onSubmitEditing={handleNext}
                    autoFocus
                  />
                )}
                {current.type === 'dropdown' && (
                  <Dropdown options={INSTRUMENTS} value={data.instrument} onChange={setField} placeholder="Select an instrument…" theme={theme} />
                )}
                {current.type === 'radio' && (
                  <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                    <RadioGroup options={current.options} value={data[current.key]} onChange={setField} theme={theme} />
                  </ScrollView>
                )}
                {isTheme && (
                  <View style={{ gap: 12 }}>
                    {THEME_OPTIONS.map((opt) => {
                      const sel = data.darkMode === opt.value;
                      return (
                        <TouchableOpacity
                          key={opt.label}
                          style={[rb.row, { borderColor: sel ? tint : theme.border, backgroundColor: sel ? theme.chipSelectedBg : theme.cardBg, paddingVertical: 16 }]}
                          onPress={() => { setData(d => ({ ...d, darkMode: opt.value })); onThemeChange?.(opt.value); if (error) setError(''); }}
                          activeOpacity={0.75}>
                          <Ionicons name={opt.icon} size={22} color={sel ? theme.chipSelectedText : tint} />
                          <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={[rb.label, { color: sel ? theme.chipSelectedText : theme.text, fontFamily: 'AnthropicSansDisplay-Bold' }]}>{opt.label}</Text>
  
                          </View>
                          <View style={[rb.circle, { borderColor: sel ? tint : theme.border }]}>
                            {sel && <View style={[rb.dot, { backgroundColor: tint }]} />}
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {!!error && (
                  <View style={s.errorRow}>
                    <Ionicons name="alert-circle-outline" size={14} color={theme.destructive} />
                    <Text style={[s.errorText, { color: theme.destructive }]}>{error}</Text>
                  </View>
                )}
              </View>
            </Animated.View>

            <View style={s.footer}>
              {step > 1
                ? (
                  <TouchableOpacity style={[s.backBtn, { borderColor: theme.border }]} onPress={handleBack}>
                    <Ionicons name="chevron-back" size={18} color={theme.subText} />
                    <Text style={[s.backText, { color: theme.subText }]}>Back</Text>
                  </TouchableOpacity>
                )
                : <View style={{ flex: 1 }} />}
              <TouchableOpacity style={[s.nextBtn, { backgroundColor: tint }]} onPress={handleNext} activeOpacity={0.85}>
                <Text style={[s.nextText, { color: theme.fabText }]}>Continue</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.fabText} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
          <View style={{ flex: 1 }} />
        </SafeAreaView>
      </Modal>
    );
  };

  const s = StyleSheet.create({
    root: { flex: 1 },
    top: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
    splashCenter: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
    dotsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 28 },
    dot: { height: 8, borderRadius: 4 },
    headRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, marginBottom: 24 },
    iconRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
    title: { fontFamily: 'AnthropicSansDisplay-Bold', fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 4 },
    subtitle: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 14, lineHeight: 20 },
    input: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 16, borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 13, minHeight: 52 },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10 },
    errorText: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 13 },
    footer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
    backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10, borderWidth: 1, minHeight: 48 },
    backText: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 15 },
    nextBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 32, borderRadius: 10, minHeight: 48, alignSelf: 'stretch' },
    nextText: { fontFamily: 'AnthropicSansDisplay-Bold', fontSize: 16, fontWeight: '700' },
    splashTitle: { fontFamily: 'AnthropicSansDisplay-Bold', fontSize: 36, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
    splashSub: { fontFamily: 'AnthropicSerifText-Medium', fontSize: 17, lineHeight: 26, textAlign: 'center' },
    importBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 12, borderWidth: 2, minHeight: 56, marginTop: 8 },
    importBtnText: { fontFamily: 'AnthropicSansDisplay-Bold', fontSize: 16 },
  });
