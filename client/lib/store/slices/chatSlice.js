import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sessions: {},
  activeChatId: null
};

const normaliseMessages = (messages, fallback = []) => (Array.isArray(messages) ? messages : fallback);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChatId = action.payload || null;
    },
    upsertSession: (state, action) => {
      const { chatId, session } = action.payload || {};
      if (!chatId) return;
      const existing = state.sessions[chatId] || {};
      const next = {
        ...existing,
        ...(session || {})
      };
      if (session && "messages" in session) {
        next.messages = normaliseMessages(session.messages);
      } else if (existing.messages && !next.messages) {
        next.messages = existing.messages;
      }
      state.sessions[chatId] = next;
    },
    appendMessage: (state, action) => {
      const { chatId, message } = action.payload || {};
      if (!chatId || !message) return;
      const session = state.sessions[chatId] || {};
      const messages = normaliseMessages(session.messages);
      state.sessions[chatId] = {
        ...session,
        messages: [...messages, message]
      };
    },
    updateLastMessageText: (state, action) => {
      const { chatId, text } = action.payload || {};
      if (!chatId) return;
      const session = state.sessions[chatId];
      if (!session || !Array.isArray(session.messages) || session.messages.length === 0) return;
      const lastIndex = session.messages.length - 1;
      const lastMsg = session.messages[lastIndex];
      session.messages[lastIndex] = { ...lastMsg, text: text ?? "" };
    }
  }
});

export const { setActiveChat, upsertSession, appendMessage, updateLastMessageText } = chatSlice.actions;

export const selectChatSessions = (state) => state.chat.sessions;
export const selectActiveChatId = (state) => state.chat.activeChatId;
export const selectChatSessionById = (state, chatId) => state.chat.sessions[chatId] || null;

export const chatReducer = chatSlice.reducer;
