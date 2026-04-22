import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, User, Shield, ArrowLeft, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SupportPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get('/support/messages');
            setMessages(res.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch messages');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await api.post('/support/send', { message: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
            setSending(false);
        } catch (err) {
            console.error('Failed to send message');
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
                <div style={{ width: 40, height: 40, border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }}></div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: '#f1f5f9', 
            paddingBottom: 20,
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div className="support-header" style={{ 
                background: '#fff', 
                padding: '20px 24px', 
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                position: 'sticky',
                top: 0,
                zIndex: 10
            }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#64748b' }}
                >
                    <ArrowLeft size={24} />
                </button>
                <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <Shield size={24} />
                </div>
                <div>
                    <h1 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1e293b' }}>Customer Support</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                        <div style={{ width: 8, height: 8, background: '#22c55e', borderRadius: '50%' }}></div>
                        Admin Online
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="support-chat-container" style={{ 
                flex: 1, 
                padding: '24px 16px', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                maxWidth: 800,
                margin: '0 auto',
                width: '100%'
            }}>
                <style>{`
                    @media (max-width: 640px) {
                        .support-chat-container { padding: 16px 12px !important; }
                        .support-message-bubble { font-size: 13px !important; padding: 10px 14px !important; }
                        .support-header { padding: 16px !important; }
                        .support-header h1 { font-size: 16px !important; }
                    }
                `}</style>
                {messages.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                        <div style={{ margin: '0 auto 16px', width: 64, height: 64, background: '#e2e8f0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <MessageSquare size={32} />
                        </div>
                        <h3 style={{ margin: 0, color: '#475569' }}>No messages yet</h3>
                        <p style={{ fontSize: 14 }}>Send a message to start a conversation with the admin.</p>
                    </div>
                ) : (
                (Array.isArray(messages) ? messages : []).map((msg, i) => {
                        const isMe = msg.sender === (user.id || user._id);
                        return (
                            <div key={i} style={{ 
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: '85%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isMe ? 'flex-end' : 'flex-start'
                            }}>
                                <div style={{ 
                                    background: isMe ? '#4f46e5' : '#fff',
                                    color: isMe ? '#fff' : '#1e293b',
                                    padding: '12px 16px',
                                    borderRadius: i === 0 || messages[i-1].isAdmin !== msg.isAdmin ? (isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px') : '16px',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                    fontSize: 14,
                                    lineHeight: 1.5,
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word',
                                    border: isMe ? 'none' : '1px solid #e2e8f0'
                                }} className="support-message-bubble">
                                    {msg.message}
                                </div>
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 4, 
                                    marginTop: 4, 
                                    fontSize: 10, 
                                    color: '#94a3b8',
                                    fontWeight: 500
                                }}>
                                    <Clock size={10} />
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (
                                        msg.isRead ? <CheckCheck size={12} color="#10b981" /> : <Check size={12} />
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ 
                background: '#fff', 
                padding: '16px 16px', 
                borderTop: '1px solid #e2e8f0',
                position: 'sticky',
                bottom: 0
            }}>
                <form 
                    onSubmit={handleSendMessage}
                    style={{ 
                        maxWidth: 800, 
                        margin: '0 auto', 
                        display: 'flex', 
                        gap: 12,
                        alignItems: 'center'
                    }}
                >
                    <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        style={{ 
                            flex: 1, 
                            padding: '12px 16px', 
                            borderRadius: 12, 
                            border: '1.5px solid #e2e8f0',
                            fontSize: 14,
                            outline: 'none',
                            resize: 'none',
                            maxHeight: 120,
                            minHeight: 46,
                            fontFamily: 'inherit',
                            transition: 'border-color 0.2s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                        onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                    />
                    <button 
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        style={{ 
                            width: 46, 
                            height: 46, 
                            borderRadius: '50%', 
                            background: sending || !newMessage.trim() ? '#e2e8f0' : '#4f46e5',
                            color: '#fff',
                            border: 'none',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: sending || !newMessage.trim() ? 'default' : 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SupportPage;
