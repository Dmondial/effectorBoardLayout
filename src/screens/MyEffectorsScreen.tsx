import React from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MyEffectorsStackParamList } from '../navigation/AppNavigator';
import { useMyEffectors } from '../hooks/useMyEffectors';
import { MyEffector } from '../types';
import { APP_COLORS } from '../constants/colors';

type Props = NativeStackScreenProps<MyEffectorsStackParamList, 'MyEffectors'>;

export function MyEffectorsScreen({ navigation }: Props) {
  const { effectors, loading, removeEffector } = useMyEffectors();

  const handleDelete = (effector: MyEffector) => {
    Alert.alert(
      '削除確認',
      `「${effector.name}」を削除しますか？\nボードに配置されたものは残ります。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => removeEffector(effector.id),
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingTxt}>読み込み中...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <FlatList
        data={effectors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🎸</Text>
            <Text style={styles.emptyTitle}>まだ登録がありません</Text>
            <Text style={styles.emptySubtitle}>
              右下の「＋」ボタンから{'\n'}エフェクターを登録しましょう
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <EffectorCard
            effector={item}
            onEdit={() =>
              navigation.navigate('AddEditEffector', { effector: item })
            }
            onDelete={() => handleDelete(item)}
          />
        )}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditEffector', {})}
      >
        <Text style={styles.fabTxt}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function EffectorCard({
  effector,
  onEdit,
  onDelete,
}: {
  effector: MyEffector;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <TouchableOpacity style={styles.card} onPress={onEdit} activeOpacity={0.8}>
      <View style={[styles.colorBar, { backgroundColor: effector.color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <Text style={styles.cardName}>{effector.name}</Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryTxt}>{effector.category}</Text>
          </View>
        </View>
        <Text style={styles.cardSize}>
          {effector.size.width} × {effector.size.depth} {effector.size.unit}
          {effector.price != null
            ? `  ·  ¥${effector.price.toLocaleString()}`
            : ''}
        </Text>
        {effector.memo ? (
          <Text style={styles.cardMemo} numberOfLines={1}>
            {effector.memo}
          </Text>
        ) : null}
        <View style={styles.jackInfo}>
          <Text style={styles.jackTxt}>
            IN: {effector.inputJack.side}  OUT: {effector.outputJack.side}
          </Text>
        </View>
      </View>
      <TouchableOpacity style={styles.deleteBtn} onPress={onDelete} hitSlop={8}>
        <Text style={styles.deleteTxt}>🗑</Text>
      </TouchableOpacity>
    </TouchableOpacity>
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
  list: {
    padding: 12,
    paddingBottom: 80,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: APP_COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: APP_COLORS.surface,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  colorBar: {
    width: 6,
  },
  cardBody: {
    flex: 1,
    padding: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardName: {
    color: APP_COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: APP_COLORS.card,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  categoryTxt: {
    color: APP_COLORS.primary,
    fontSize: 11,
    fontWeight: '600',
  },
  cardSize: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 2,
  },
  cardMemo: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  jackInfo: {
    marginTop: 4,
  },
  jackTxt: {
    color: APP_COLORS.textSecondary,
    fontSize: 11,
  },
  deleteBtn: {
    padding: 14,
    justifyContent: 'center',
  },
  deleteTxt: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: APP_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  fabTxt: {
    color: '#FFFFFF',
    fontSize: 28,
    lineHeight: 32,
  },
});
