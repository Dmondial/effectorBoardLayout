import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MyEffectorsStackParamList } from '../navigation/AppNavigator';
import { useMyEffectors } from '../hooks/useMyEffectors';
import {
  EffectorCategory,
  JackConfig,
  JackSide,
  MyEffector,
  SizeUnit,
} from '../types';
import { APP_COLORS, EFFECTOR_COLORS } from '../constants/colors';

type Props = NativeStackScreenProps<MyEffectorsStackParamList, 'AddEditEffector'>;

const CATEGORIES: EffectorCategory[] = [
  'Overdrive', 'Distortion', 'Fuzz', 'Compressor',
  'Delay', 'Reverb', 'Chorus', 'Wah', 'EQ', 'Other',
];

const JACK_SIDES: { label: string; value: JackSide }[] = [
  { label: '左', value: 'left' },
  { label: '右', value: 'right' },
  { label: '上', value: 'top' },
  { label: '下', value: 'bottom' },
];

const DEFAULT_JACK: JackConfig = { side: 'right', position: 0.5 };

export function AddEditEffectorScreen({ navigation, route }: Props) {
  const { effector } = route.params ?? {};
  const { addEffector, updateEffector } = useMyEffectors();

  const [name, setName] = useState(effector?.name ?? '');
  const [width, setWidth] = useState(String(effector?.size.width ?? ''));
  const [depth, setDepth] = useState(String(effector?.size.depth ?? ''));
  const [unit, setUnit] = useState<SizeUnit>(effector?.size.unit ?? 'cm');
  const [category, setCategory] = useState<EffectorCategory>(effector?.category ?? 'Overdrive');
  const [color, setColor] = useState(effector?.color ?? EFFECTOR_COLORS[0]);
  const [memo, setMemo] = useState(effector?.memo ?? '');
  const [price, setPrice] = useState(effector?.price != null ? String(effector.price) : '');
  const [inputJacks, setInputJacks] = useState<JackConfig[]>(
    effector?.inputJacks ?? [{ side: 'right', position: 0.3 }]
  );
  const [outputJacks, setOutputJacks] = useState<JackConfig[]>(
    effector?.outputJacks ?? [{ side: 'left', position: 0.3 }]
  );

  const isEdit = !!effector;

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('入力エラー', '名前を入力してください'); return; }
    const w = parseFloat(width);
    const d = parseFloat(depth);
    if (isNaN(w) || isNaN(d) || w <= 0 || d <= 0) {
      Alert.alert('入力エラー', 'サイズに正しい数値を入力してください'); return;
    }
    if (inputJacks.length === 0 && outputJacks.length === 0) {
      Alert.alert('入力エラー', 'INまたはOUTジャックを最低1つ設定してください'); return;
    }

    const data: MyEffector = {
      id: effector?.id ?? Date.now().toString(),
      name: name.trim(),
      size: { width: w, depth: d, unit },
      category,
      color,
      memo: memo.trim() || undefined,
      price: price ? parseFloat(price) : undefined,
      inputJacks,
      outputJacks,
      createdAt: effector?.createdAt ?? new Date().toISOString(),
    };

    if (isEdit) await updateEffector(data);
    else await addEffector(data);
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <Field label="名前 *">
          <TextInput style={styles.input} value={name} onChangeText={setName}
            placeholder="例: TS9 Tube Screamer"
            placeholderTextColor={APP_COLORS.textSecondary} />
        </Field>

        <Field label="カテゴリ">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chipRow}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity key={c}
                  style={[styles.chip, category === c && styles.chipActive]}
                  onPress={() => setCategory(c)}>
                  <Text style={[styles.chipTxt, category === c && styles.chipTxtActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </Field>

        <Field label="サイズ">
          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.subLabel}>幅</Text>
              <TextInput style={styles.input} value={width} onChangeText={setWidth}
                keyboardType="numeric" placeholder="0.0"
                placeholderTextColor={APP_COLORS.textSecondary} />
            </View>
            <Text style={styles.times}>×</Text>
            <View style={styles.flex1}>
              <Text style={styles.subLabel}>奥行き</Text>
              <TextInput style={styles.input} value={depth} onChangeText={setDepth}
                keyboardType="numeric" placeholder="0.0"
                placeholderTextColor={APP_COLORS.textSecondary} />
            </View>
            <View style={styles.unitPicker}>
              {(['cm', 'inch'] as SizeUnit[]).map((u) => (
                <TouchableOpacity key={u}
                  style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                  onPress={() => setUnit(u)}>
                  <Text style={[styles.unitBtnTxt, unit === u && styles.unitBtnTxtActive]}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Field>

        <Field label="カラー">
          <View style={styles.colorRow}>
            {EFFECTOR_COLORS.map((c) => (
              <TouchableOpacity key={c}
                style={[styles.colorSwatch, { backgroundColor: c },
                  color === c && styles.colorSwatchActive]}
                onPress={() => setColor(c)} />
            ))}
          </View>
        </Field>

        {/* IN Jacks */}
        <JackListEditor
          label="INジャック（黄色）"
          jacks={inputJacks}
          onChange={setInputJacks}
          defaultSide="right"
        />

        {/* OUT Jacks */}
        <JackListEditor
          label="OUTジャック（緑色）"
          jacks={outputJacks}
          onChange={setOutputJacks}
          defaultSide="left"
        />

        <Field label="金額 (円)">
          <TextInput style={styles.input} value={price} onChangeText={setPrice}
            keyboardType="numeric" placeholder="例: 15000"
            placeholderTextColor={APP_COLORS.textSecondary} />
        </Field>

        <Field label="メモ">
          <TextInput style={[styles.input, styles.textArea]} value={memo}
            onChangeText={setMemo} multiline numberOfLines={4}
            placeholder="自由メモ" placeholderTextColor={APP_COLORS.textSecondary} />
        </Field>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveTxt}>{isEdit ? '変更を保存' : '登録する'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Jack list editor ────────────────────────────────────────────────────────

function JackListEditor({
  label, jacks, onChange, defaultSide,
}: {
  label: string;
  jacks: JackConfig[];
  onChange: (jacks: JackConfig[]) => void;
  defaultSide: JackSide;
}) {
  const add = () => onChange([...jacks, { side: defaultSide, position: 0.5 }]);

  const update = (index: number, patch: Partial<JackConfig>) => {
    onChange(jacks.map((j, i) => (i === index ? { ...j, ...patch } : j)));
  };

  const remove = (index: number) => {
    onChange(jacks.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.jackSection}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {jacks.map((jack, index) => (
        <View key={index} style={styles.jackRow}>
          {/* Side selector */}
          <View style={styles.jackSidePicker}>
            {JACK_SIDES.map(({ label: l, value }) => (
              <TouchableOpacity key={value}
                style={[styles.jackSideBtn, jack.side === value && styles.jackSideBtnActive]}
                onPress={() => update(index, { side: value })}>
                <Text style={[styles.jackSideTxt, jack.side === value && styles.jackSideTxtActive]}>
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Position input */}
          <View style={styles.jackPosWrapper}>
            <Text style={styles.subLabel}>位置 (0〜1)</Text>
            <TextInput
              style={[styles.input, styles.jackPosInput]}
              value={String(jack.position)}
              onChangeText={(v) => {
                const n = parseFloat(v);
                if (!isNaN(n)) update(index, { position: Math.min(1, Math.max(0, n)) });
              }}
              keyboardType="numeric"
              placeholderTextColor={APP_COLORS.textSecondary}
            />
          </View>
          {/* Delete */}
          <TouchableOpacity style={styles.jackDeleteBtn} onPress={() => remove(index)}>
            <Text style={styles.jackDeleteTxt}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
      <TouchableOpacity style={styles.addJackBtn} onPress={add}>
        <Text style={styles.addJackTxt}>＋ ジャックを追加</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  scroll: { padding: 16, paddingBottom: 32 },
  field: { marginBottom: 20 },
  fieldLabel: {
    color: APP_COLORS.textSecondary, fontSize: 12, marginBottom: 8,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  subLabel: { color: APP_COLORS.textSecondary, fontSize: 11, marginBottom: 4 },
  input: {
    backgroundColor: APP_COLORS.card, color: APP_COLORS.text, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 15,
    borderWidth: 1, borderColor: APP_COLORS.border,
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  flex1: { flex: 1 },
  times: { color: APP_COLORS.textSecondary, fontSize: 18, marginBottom: 10 },
  unitPicker: { gap: 4 },
  unitBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: APP_COLORS.border, alignItems: 'center',
  },
  unitBtnActive: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  unitBtnTxt: { color: APP_COLORS.textSecondary, fontSize: 12 },
  unitBtnTxtActive: { color: '#FFFFFF', fontWeight: 'bold' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1, borderColor: APP_COLORS.border, backgroundColor: APP_COLORS.card,
  },
  chipActive: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  chipTxt: { color: APP_COLORS.textSecondary, fontSize: 13 },
  chipTxtActive: { color: '#FFFFFF', fontWeight: '600' },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'transparent' },
  colorSwatchActive: { borderColor: '#FFFFFF', transform: [{ scale: 1.15 }] },
  saveBtn: {
    backgroundColor: APP_COLORS.primary, paddingVertical: 14,
    borderRadius: 10, alignItems: 'center', marginTop: 8,
  },
  saveTxt: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  // Jack editor
  jackSection: { marginBottom: 20 },
  jackRow: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 6,
    marginBottom: 10, backgroundColor: APP_COLORS.card,
    borderRadius: 8, padding: 10, borderWidth: 1, borderColor: APP_COLORS.border,
  },
  jackSidePicker: { flexDirection: 'row', gap: 4 },
  jackSideBtn: {
    paddingHorizontal: 8, paddingVertical: 6, borderRadius: 6,
    borderWidth: 1, borderColor: APP_COLORS.border, alignItems: 'center',
  },
  jackSideBtnActive: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  jackSideTxt: { color: APP_COLORS.textSecondary, fontSize: 12 },
  jackSideTxtActive: { color: '#FFFFFF', fontWeight: 'bold' },
  jackPosWrapper: { flex: 1 },
  jackPosInput: { paddingVertical: 7, fontSize: 13 },
  jackDeleteBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: APP_COLORS.danger, alignItems: 'center', justifyContent: 'center',
  },
  jackDeleteTxt: { color: '#FFFFFF', fontSize: 18, lineHeight: 20 },
  addJackBtn: {
    borderWidth: 1, borderColor: APP_COLORS.primary, borderStyle: 'dashed',
    borderRadius: 8, paddingVertical: 10, alignItems: 'center',
  },
  addJackTxt: { color: APP_COLORS.primary, fontSize: 14 },
});
