import React, { createContext, useState, useContext } from 'react';

export const MessageContext = createContext();

export const MessageProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    {
      id: "1",
      sender: "ai",
      content: "你好！我是AI绘图助手，请告诉我你想创作什么样的图片？",
    },
  ]);

  const addMessage = (newMessage) => {
    setMessages(prevMessages => [...prevMessages, newMessage]);
  };

  const clearMessages = () => {
    setMessages([{
      id: "1",
      sender: "ai",
      content: "你好！我是AI绘图助手，请告诉我你想创作什么样的图片？",
    }]);
  };

  return (
    <MessageContext.Provider value={{ messages, addMessage, clearMessages }}>
      {children}
    </MessageContext.Provider>
  );
};

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
}; 