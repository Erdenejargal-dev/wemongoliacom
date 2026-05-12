// Design.md §8.3 — AI Assistant
import { useRef, useState } from 'react';
import {
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
import { SkeletonText } from '@/components/ui/Skeleton';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { C } from '@/constants/Colors';
import { S } from '@/constants/Spacing';
import { api } from '@/lib/api';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

type Conversation = {
  id: string;
  messages: Message[];
};

export default function AIScreen() {
  const qc = useQueryClient();
  const listRef = useRef<FlatList>(null);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);

  const { data: convo, isLoading } = useQuery<Conversation>({
    queryKey: ['conversation', conversationId],
    queryFn: () => api.get(`/conversations/${conversationId}`).then((r) => r.data),
    enabled: !!conversationId,
    refetchInterval: 5000, // poll for new messages
  });

  const messages = convo?.messages ?? [];

  const send = useMutation({
    mutationFn: async (text: string) => {
      let id = conversationId;
      if (!id) {
        const { data } = await api.post('/conversations', { subject: 'AI Trip Planning' });
        id = data.id;
        setConversationId(id);
      }
      await api.post(`/conversations/${id}/messages`, { content: text });
      return id;
    },
    onSuccess: (id) => {
      qc.invalidateQueries({ queryKey: ['conversation', id] });
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onError: () => Alert.alert('Error', 'Could not send message.'),
  });

  function handleSend() {
    if (!input.trim()) return;
    const text = input.trim();
    setInput('');
    send.mutate(text);
  }

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.aiAvatar}>
          <Text style={styles.aiAvatarIcon}>✦</Text>
        </View>
        <View>
          <View style={styles.aiChip}>
            <Text style={styles.aiChipText}>AI ASSISTANT</Text>
          </View>
          <Text style={styles.headerTitle}>Mongolia Travel AI</Text>
        </View>
      </View>

      {/* Messages */}
      {isLoading && conversationId ? (
        <View style={styles.loadingBox}>
          <SkeletonText width="60%" style={{ marginBottom: 8 }} />
          <SkeletonText width="80%" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Plan your Mongolia adventure</Text>
          <Text style={styles.emptyMuted}>Ask me anything about tours, destinations, itineraries, or travel tips</Text>
          <View style={styles.suggestions}>
            {[
              'Best time to visit Mongolia?',
              'Plan a 7-day Gobi Desert tour',
              'Top destinations for first-timers',
            ].map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => { setInput(s); }}
                accessibilityRole="button"
              >
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => (
            <View
              style={[
                styles.bubble,
                item.role === 'user' ? styles.bubbleUser : styles.bubbleAI,
              ]}
            >
              {item.role === 'assistant' && (
                <View style={styles.aiBubbleAvatar}>
                  <Text style={styles.aiBubbleAvatarIcon}>✦</Text>
                </View>
              )}
              <View
                style={[
                  styles.bubbleBody,
                  item.role === 'user' ? styles.bubbleBodyUser : styles.bubbleBodyAI,
                ]}
              >
                <Text
                  style={[
                    styles.bubbleText,
                    item.role === 'user' ? styles.bubbleTextUser : styles.bubbleTextAI,
                  ]}
                >
                  {item.content}
                </Text>
              </View>
            </View>
          )}
        />
      )}

      {/* Sending indicator */}
      {send.isPending && (
        <View style={[styles.bubble, styles.bubbleAI]}>
          <View style={styles.aiBubbleAvatar}>
            <Text style={styles.aiBubbleAvatarIcon}>✦</Text>
          </View>
          <View style={[styles.bubbleBody, styles.bubbleBodyAI]}>
            <Text style={styles.bubbleTextAI}>Thinking...</Text>
          </View>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Type a message..."
          placeholderTextColor={C.textSubtle}
          style={styles.input}
          multiline
          maxLength={1000}
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
          <IconSymbol name="arrow.up.right" size={16} color="#FFFFFF" />
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
    backgroundColor: C.bgPage,
    borderBottomWidth: 0.5,
    borderBottomColor: C.borderDefault,
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiAvatarIcon: { color: '#FFFFFF', fontSize: 18 },
  aiChip: {
    backgroundColor: C.blue,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  aiChipText: { color: '#FFFFFF', fontSize: 8, fontWeight: '700', fontFamily: 'Manrope_700Bold', letterSpacing: 0.5 },
  headerTitle: { fontSize: 14, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },

  messageList: { padding: S[5], gap: S[3], paddingBottom: 16 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: S[2] },
  bubbleUser: { justifyContent: 'flex-end' },
  bubbleAI: { justifyContent: 'flex-start' },
  aiBubbleAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBubbleAvatarIcon: { color: '#FFFFFF', fontSize: 12 },
  bubbleBody: {
    maxWidth: '75%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  bubbleBodyUser: {
    backgroundColor: C.navy,
    borderBottomRightRadius: 4,
  },
  bubbleBodyAI: {
    backgroundColor: '#FFFFFF',
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 13, lineHeight: 20, fontFamily: 'Manrope_400Regular' },
  bubbleTextUser: { color: '#FFFFFF' },
  bubbleTextAI: { color: C.textPrimary },

  // Empty
  loadingBox: { flex: 1, padding: S[5] },
  empty: { flex: 1, padding: S[5], paddingTop: 40, gap: S[4] },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textPrimary, fontFamily: 'Manrope_700Bold' },
  emptyMuted: { fontSize: 13, color: C.textMuted, fontFamily: 'Manrope_400Regular', lineHeight: 20 },
  suggestions: { gap: S[2] },
  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
    borderWidth: 0.5,
    borderColor: C.borderDefault,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  suggestionText: { fontSize: 13, color: C.blue, fontWeight: '600', fontFamily: 'Manrope_600SemiBold' },

  // Input
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
