import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { EffectorPreset, MyEffector } from '../types';
import { APP_COLORS } from '../constants/colors';
import { EFFECTOR_PRESETS } from '../constants/presets';

interface Props {
  visible: boolean;
  myEffectors: MyEffector[];
  onAdd: (
    effectorId: string,
    effectorType: 'preset' | 'my'
  ) => void;
  onClose: () => void;
}

type Tab = 'preset' | 'my';

export function AddEffectorModal({ visible, myEffectors, onAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('preset');

  const presets = EFFECTOR_PRESETS;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>エフェクターを追加</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeTxt}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, tab === 'preset' && styles.tabActive]}
              onPress={() => setTab('preset')}
            >
              <Text style={[styles.tabTxt, tab === 'preset' && styles.tabTxtActive]}>
                プリセット
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, tab === 'my' && styles.tabActive]}
              onPress={() => setTab('my')}
            >
              <Text style={[styles.tabTxt, tab === 'my' && styles.tabTxtActive]}>
                マイエフェクター ({myEffectors.length})
              </Text>
            </TouchableOpacity>
          </View>

          {tab === 'preset' ? (
            <FlatList
              data={presets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <PresetRow
                  preset={item}
                  onPress={() => {
                    onAdd(item.id, 'preset');
                    onClose();
                  }}
                />
              )}
              style={styles.list}
            />
          ) : (
            <FlatList
              data={myEffectors}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <View style={styles.empty}>
                  <Text style={styles.emptyTxt}>
                    マイエフェクターが登録されていません
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <MyEffectorRow
                  effector={item}
                  onPress={() => {
                    onAdd(item.id, 'my');
                    onClose();
                  }}
                />
              )}
              style={styles.list}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

function PresetRow({
  preset,
  onPress,
}: {
  preset: EffectorPreset;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.colorDot, { backgroundColor: preset.color }]} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{preset.name}</Text>
        <Text style={styles.rowSub}>
          {preset.size.width} × {preset.size.depth} {preset.size.unit}
        </Text>
      </View>
      <Text style={styles.rowArrow}>›</Text>
    </TouchableOpacity>
  );
}

function MyEffectorRow({
  effector,
  onPress,
}: {
  effector: MyEffector;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={[styles.colorDot, { backgroundColor: effector.color }]} />
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{effector.name}</Text>
        <Text style={styles.rowSub}>
          {effector.category} · {effector.size.width} × {effector.size.depth}{' '}
          {effector.size.unit}
        </Text>
      </View>
      <Text style={styles.rowArrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: APP_COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  title: {
    color: APP_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  closeTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 18,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: APP_COLORS.primary,
  },
  tabTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
  },
  tabTxtActive: {
    color: APP_COLORS.primary,
    fontWeight: 'bold',
  },
  list: {
    flexGrow: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 12,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    color: APP_COLORS.text,
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  rowArrow: {
    color: APP_COLORS.textSecondary,
    fontSize: 20,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
  },
});
