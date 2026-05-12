// Design.md §8.9 — Messaging thread (traveler ↔ provider)
// GET /conversations/:id/messages → { messages: Message[], nextCursor: string|null }
// POST /conversations/:id/messages { text }
// POST /conversations/:id/read  — on mount
// Messages are newest-first from backend; FlatList inverted renders latest at bottom.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

type MessageSender = {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'traveler' | 'provider';
  text: string;
  attachments: string[];
  createdAt: string;
  sender: MessageSender;
};

type MessagesResponse = {
  messages: Message[];
  nextCursor: string | null;
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function Avatar({ name, size = 28 }: { name: string; size?: number }) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.avatarInitial, { fontSize: size * 0.4 }]}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export default function ConversationScreen() {
  const router = useRouter();
  const { id, providerName, listingName } = useLocalSearchParams<{
    id: string;
    providerName?: string;
    listingName?: string;
  }>();
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [input, setInput] = useState('');
  const flatRef = useRef<FlatList>(null);

  // Fetch messages — poll every 5s for new ones
  const { data, isLoading, isError } = useQuery<MessagesResponse>({
    queryKey: ['conversation-messages', id],
    queryFn: () => api.get(`/conversations/${id}/messages`).then((r) => r.data),
    enabled: !!id,
    refetchInterval: 5000,
    staleTime: 0,
  });

  // Mark as read on mount
  useEffect(() => {
    if (!id) return;
    api.post(`/conversations/${id}/read`).catch(() => {});
  }, [id]);

  const send = useMutation({
    mutationFn: (text: string) =>
      api.post(`/conversations/${id}/messages`, { text }),
    onMutate: async (text) => {
      // Optimistic update — prepend to messages list (list is newest-first)
      await qc.cancelQueries({ queryKey: ['conversation-messages', id] });
      const prev = qc.getQueryData<MessagesResponse>(['conversation-messages', id]);

      if (prev && user) {
        const optimistic: Message = {
          id: `optimistic-${Date.now()}`,
          conversationId: id,
          senderId: user.id,
          senderRole: 'traveler',
          text,
          attachments: [],
          createdAt: new Date().toISOString(),
          sender: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUrl: user.avatarUrl ?? null,
          },
        };
        qc.setQueryData<MessagesResponse>(['conversation-messages', id], {
          ...prev,
          messages: [optimistic, ...prev.messages],
        });
      }

      return { prev };
    },
    onError: (_err, _text, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(['conversation-messages', id], ctx.prev);
      }
      Alert.alert('Error', 'Could not send message.');
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ['conversation-messages', id] });
    },
  });

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    send.mutate(text);
  }

  // Messages are newest-first; FlatList inverted renders them bottom-up
  const messages = data?.messages ?? [];

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <IconSymbol name="chevron.left" size={20} color={C.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {providerName ?? 'Provider'}
          </Text>
          {listingName ? (
            <Text style={styles.headerSub} numberOfLines={1}>{listingName}</Text>
          ) : null}
        </View>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={C.blue} />
        </View>
      ) : isError ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>Could not load messages.</Text>
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No messages yet.</Text>
          <Text style={styles.emptyMuted}>Send a message to start the conversation.</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(m) => m.id}
          inverted
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item, index }) => {
            const isMine = item.senderId === user?.id;
            const prevMsg = messages[index + 1]; // inverted: next in array = older
            const showAvatar = !isMine && (index === 0 || prevMsg?.senderId !== item.senderId);

            return (
              <View
                style={[
                  styles.row,
                  isMine ? styles.rowMine : styles.rowTheirs,
                ]}
              >
                {/* Avatar placeholder to keep alignment when not shown */}
                {!isMine && (
                  <View style={styles.avatarSlot}>
                    {showAvatar ? (
                      <Avatar name={item.sender.firstName} size={28} />
                    ) : null}
                  </View>
                )}

                <View style={styles.bubbleWrap}>
                  {!isMine && showAvatar && (
                    <Text style={styles.senderName}>
                      {item.sender.firstName} {item.sender.lastName}
                    </Text>
                  )}
                  <View
                    style={[
                      styles.bubble,
                      isMine ? styles.bubbleMine : styles.bubbleTheirs,
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        isMine ? styles.bubbleTextMine : styles.bubbleTextTheirs,
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                  <Text style={[styles.time, isMine && styles.timeRight]}>
                    {formatTime(item.createdAt)}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Message…"
          placeholderTextColor={C.textSubtle}
          style={styles.input}
          multiline
          maxLength={2000}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          disabled={!input.trim() || send.isPending}
          accessibilityRole="button"
          accessibilityLabel="Send message"
        >
          <IconSymbol name="paperplane.fill" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bgPage },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 60,
    paddingHorizontal: S[5],
    paddingBottom: S[3],
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textPrimary,
    fontFamily: 'Manrope_700Bold',
  },
  headerSub: {
    fontSize: 11,
    color: C.textMuted,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: S[5] },
  errorText: { fontSize: 13, color: C.error, fontFamily: 'Manrope_400Regular' },
  emptyText: { fontSize: 15, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold', marginBottom: 6 },
  emptyMuted: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', textAlign: 'center' },

  list: { paddingHorizontal: S[4], paddingVertical: S[3], gap: 4 },

  row: { flexDirection: 'row', marginBottom: 2 },
  rowMine: { justifyContent: 'flex-end' },
  rowTheirs: { justifyContent: 'flex-start' },

  avatarSlot: { width: 36, alignItems: 'flex-start', justifyContent: 'flex-end', marginRight: 4 },
  avatar: { backgroundColor: C.blueLight, alignItems: 'center', justifyContent: 'center' },
  avatarInitial: { color: C.navy, fontWeight: '700', fontFamily: 'Manrope_700Bold' },

  bubbleWrap: { maxWidth: '72%' },
  senderName: {
    fontSize: 10,
    color: C.textMuted,
    fontFamily: 'Manrope_600SemiBold',
    marginBottom: 3,
    paddingLeft: 4,
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleMine: {
    backgroundColor: C.navy,
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 20, fontFamily: 'Manrope_400Regular' },
  bubbleTextMine: { color: '#FFFFFF' },
  bubbleTextTheirs: { color: C.textPrimary },

  time: {
    fontSize: 10,
    color: C.textSubtle,
    fontFamily: 'Manrope_400Regular',
    marginTop: 3,
    paddingLeft: 4,
  },
  timeRight: { textAlign: 'right', paddingRight: 4, paddingLeft: 0 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: S[5],
    paddingVertical: 12,
    paddingBottom: 28,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 0.5,
    borderTopColor: C.borderDefault,
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: C.bgPage,
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    paddingHorizontal: 16,
    paddingVertical: 11,
    fontSize: 13,
    color: C.textPrimary,
    fontFamily: 'Manrope_400Regular',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.borderDefault },
});
