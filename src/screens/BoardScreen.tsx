import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useBoard } from '../hooks/useBoard';
import { useMyEffectors } from '../hooks/useMyEffectors';
import { Board } from '../components/Board';
import { AddEffectorModal } from '../components/AddEffectorModal';
import { EFFECTOR_PRESETS, toCm } from '../constants/presets';
import { APP_COLORS, WIRING_COLORS } from '../constants/colors';
import { BoardMode, ResolvedPlacement, Wiring, SizeUnit } from '../types';

export function BoardScreen() {
  const {
    board,
    loading,
    updateBoardSettings,
    addEffector,
    moveEffector,
    removeEffector,
    addWiring,
    removeWiring,
  } = useBoard();
  const { effectors: myEffectors } = useMyEffectors();

  const [mode, setMode] = useState<BoardMode>('move');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [wiringFrom, setWiringFrom] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Resolve placements to displayable data
  const resolvedPlacements = useMemo<ResolvedPlacement[]>(() => {
    return board.placedEffectors
      .map((p) => {
        if (p.effectorType === 'preset') {
          const preset = EFFECTOR_PRESETS.find((e) => e.id === p.effectorId);
          if (!preset) return null;
          return {
            placementId: p.placementId,
            name: preset.name,
            color: preset.color,
            widthCm: toCm(preset.size.width, preset.size.unit),
            depthCm: toCm(preset.size.depth, preset.size.unit),
            x: p.x,
            y: p.y,
            inputJack: preset.inputJack,
            outputJack: preset.outputJack,
          } satisfies ResolvedPlacement;
        } else {
          const my = myEffectors.find((e) => e.id === p.effectorId);
          if (!my) return null;
          return {
            placementId: p.placementId,
            name: my.name,
            color: my.color,
            widthCm: toCm(my.size.width, my.size.unit),
            depthCm: toCm(my.size.depth, my.size.unit),
            x: p.x,
            y: p.y,
            inputJack: my.inputJack,
            outputJack: my.outputJack,
          } satisfies ResolvedPlacement;
        }
      })
      .filter(Boolean) as ResolvedPlacement[];
  }, [board.placedEffectors, myEffectors]);

  const handleAddEffector = (effectorId: string, effectorType: 'preset' | 'my') => {
    addEffector({
      placementId: Date.now().toString(),
      effectorId,
      effectorType,
      x: 2,
      y: 2,
    });
  };

  const handleSelectEffector = (placementId: string) => {
    if (mode === 'delete') {
      Alert.alert('削除', 'このエフェクターをボードから取り除きますか？', [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => removeEffector(placementId),
        },
      ]);
      return;
    }

    if (mode === 'wire') {
      if (!wiringFrom) {
        setWiringFrom(placementId);
        return;
      }
      if (wiringFrom === placementId) {
        setWiringFrom(null);
        return;
      }
      // Create wiring
      const newWiring: Wiring = {
        id: Date.now().toString(),
        fromPlacementId: wiringFrom,
        toPlacementId: placementId,
        color: WIRING_COLORS[board.wirings.length % WIRING_COLORS.length],
      };
      addWiring(newWiring);
      setWiringFrom(null);
      return;
    }

    setSelectedId((prev) => (prev === placementId ? null : placementId));
  };

  const handleModeChange = (newMode: BoardMode) => {
    setMode(newMode);
    setSelectedId(null);
    setWiringFrom(null);
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingTxt}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.boardName}>{board.name}</Text>
        <Text style={styles.boardSize}>
          {board.width} × {board.height} {board.unit}
        </Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => setShowSettings(true)}
        >
          <Text style={styles.settingsTxt}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Mode selector */}
      <View style={styles.modeBar}>
        <ModeButton label="移動" modeKey="move" current={mode} onPress={handleModeChange} />
        <ModeButton label="配線" modeKey="wire" current={mode} onPress={handleModeChange} />
        <ModeButton label="削除" modeKey="delete" current={mode} onPress={handleModeChange} />
      </View>

      {/* Board */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEnabled={mode === 'move' ? false : true}
      >
        <Board
          board={board}
          resolvedPlacements={resolvedPlacements}
          mode={mode}
          selectedId={selectedId}
          wiringFrom={wiringFrom}
          onMoveEffector={moveEffector}
          onSelectEffector={handleSelectEffector}
        />
      </ScrollView>

      {/* Bottom toolbar */}
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addBtnTxt}>＋ エフェクター追加</Text>
        </TouchableOpacity>
        {mode === 'wire' && board.wirings.length > 0 && (
          <TouchableOpacity
            style={styles.clearWireBtn}
            onPress={() => {
              Alert.alert('配線を全削除', '全ての配線を削除しますか？', [
                { text: 'キャンセル', style: 'cancel' },
                {
                  text: '削除',
                  style: 'destructive',
                  onPress: () =>
                    board.wirings.forEach((w) => removeWiring(w.id)),
                },
              ]);
            }}
          >
            <Text style={styles.clearWireTxt}>配線を全削除</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add effector modal */}
      <AddEffectorModal
        visible={showAddModal}
        myEffectors={myEffectors}
        onAdd={handleAddEffector}
        onClose={() => setShowAddModal(false)}
      />

      {/* Board settings modal */}
      <BoardSettingsModal
        visible={showSettings}
        board={board}
        onSave={updateBoardSettings}
        onClose={() => setShowSettings(false)}
      />
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  modeKey,
  current,
  onPress,
}: {
  label: string;
  modeKey: BoardMode;
  current: BoardMode;
  onPress: (m: BoardMode) => void;
}) {
  const active = current === modeKey;
  return (
    <TouchableOpacity
      style={[styles.modeBtn, active && styles.modeBtnActive]}
      onPress={() => onPress(modeKey)}
    >
      <Text style={[styles.modeBtnTxt, active && styles.modeBtnTxtActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function BoardSettingsModal({
  visible,
  board,
  onSave,
  onClose,
}: {
  visible: boolean;
  board: ReturnType<typeof useBoard>['board'];
  onSave: (patch: { name?: string; width?: number; height?: number; unit?: SizeUnit }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(board.name);
  const [width, setWidth] = useState(String(board.width));
  const [height, setHeight] = useState(String(board.height));
  const [unit, setUnit] = useState<SizeUnit>(board.unit);

  const handleSave = () => {
    const w = parseFloat(width);
    const h = parseFloat(height);
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0) {
      Alert.alert('入力エラー', 'サイズに正しい数値を入力してください');
      return;
    }
    onSave({ name: name.trim() || board.name, width: w, height: h, unit });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.settingsOverlay}>
        <View style={styles.settingsSheet}>
          <Text style={styles.settingsTitle}>ボード設定</Text>

          <Text style={styles.fieldLabel}>ボード名</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="例: My Pedalboard"
            placeholderTextColor={APP_COLORS.textSecondary}
          />

          <Text style={styles.fieldLabel}>単位</Text>
          <View style={styles.unitRow}>
            {(['cm', 'inch'] as SizeUnit[]).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.unitBtn, unit === u && styles.unitBtnActive]}
                onPress={() => setUnit(u)}
              >
                <Text
                  style={[styles.unitBtnTxt, unit === u && styles.unitBtnTxtActive]}
                >
                  {u}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>横 ({unit})</Text>
          <TextInput
            style={styles.input}
            value={width}
            onChangeText={setWidth}
            keyboardType="numeric"
            placeholderTextColor={APP_COLORS.textSecondary}
          />

          <Text style={styles.fieldLabel}>縦 ({unit})</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
            placeholderTextColor={APP_COLORS.textSecondary}
          />

          <View style={styles.settingsBtns}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelTxt}>キャンセル</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveTxt}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.background,
  },
  loadingTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: APP_COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  boardName: {
    color: APP_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  boardSize: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    marginRight: 8,
  },
  settingsBtn: {
    padding: 4,
  },
  settingsTxt: {
    fontSize: 20,
  },
  modeBar: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: APP_COLORS.card,
  },
  modeBtnActive: {
    backgroundColor: APP_COLORS.primary,
  },
  modeBtnTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  modeBtnTxtActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    alignItems: 'center',
  },
  toolbar: {
    flexDirection: 'row',
    backgroundColor: APP_COLORS.surface,
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: APP_COLORS.border,
  },
  addBtn: {
    flex: 1,
    backgroundColor: APP_COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addBtnTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  clearWireBtn: {
    backgroundColor: APP_COLORS.danger,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearWireTxt: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Settings modal
  settingsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  settingsSheet: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 16,
    padding: 20,
  },
  settingsTitle: {
    color: APP_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  fieldLabel: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: APP_COLORS.card,
    color: APP_COLORS.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  unitBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  unitBtnActive: {
    backgroundColor: APP_COLORS.primary,
    borderColor: APP_COLORS.primary,
  },
  unitBtnTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
  },
  unitBtnTxtActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  settingsBtns: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  cancelTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 15,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: APP_COLORS.primary,
  },
  saveTxt: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});
