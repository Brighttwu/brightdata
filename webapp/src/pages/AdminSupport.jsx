import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Send, User, ChevronRight, Search, MessageSquare, Clock, ArrowLeft, Shield, CheckCheck, Check } from 'lucide-react';

const AdminSupport = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await api.get('/support/admin/conversations');
            setConversations(res.data);
            setLoading(false);

            // Auto-select user if ID is in URL
            const urlParams = new URLSearchParams(window.location.search);
            const userId = urlParams.get('user');
            if (userId && !selectedUser) {
                const conv = res.data.find(c => c._id === userId);
                if (conv) {
                    setSelectedUser(conv.userDetails);
                    fetchMessages(conv._id);
                } else {
                    // If no message from user yet, we could potentially fetch user details separately
                    // but for now let's just assume they have messages.
                }
            }
        } catch (err) {
            console.error('Failed to fetch conversations');
            setLoading(false);
        }
    };

    const fetchMessages = async (userId) => {
        setMessagesLoading(true);
        try {
            const res = await api.get(`/support/admin/messages/${userId}`);
            setMessages(res.data);
            setMessagesLoading(false);
            // Update conversation unread count locally
            setConversations(prev => prev.map(c => c._id === userId ? { ...c, unreadCount: 0 } : c));
        } catch (err) {
            console.error('Failed to fetch messages');
            setMessagesLoading(false);
        }
    };

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(() => {
            fetchConversations();
            if (selectedUser) {
                api.get(`/support/admin/messages/${selectedUser._id}`).then(res => setMessages(res.data));
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSelectUser = (conv) => {
        setSelectedUser(conv.userDetails);
        fetchMessages(conv._id);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedUser) return;

        setSending(true);
        try {
            const res = await api.post(`/support/admin-reply/${selectedUser._id}`, { message: newMessage });
            setMessages([...messages, res.data]);
            setNewMessage('');
            setSending(false);
        } catch (err) {
            console.error('Failed to send reply');
            setSending(false);
        }
    };

    const filteredConversations = conversations.filter(c => 
        c.userDetails.name.toLowerCase().includes(search.toLowerCase()) ||
        c.userDetails.email.toLowerCase().includes(search.toLowerCase())
    );

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
            height: '100vh', 
            background: '#f8fafc', 
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Header */}
            <div style={{ background: '#0f172a', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Shield size={24} color="#6366f1" />
                    <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Support Dashboard</h1>
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', background: 'rgba(255,255,255,0.1)', padding: '4px 12px', borderRadius: 20 }}>
                    {conversations.reduce((acc, c) => acc + c.unreadCount, 0)} Unread Messages
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Sidebar: Conversations */}
                <div style={{ 
                    width: selectedUser ? (isMobile ? '100%' : '320px') : '100%', 
                    background: '#fff', 
                    borderRight: '1px solid #e2e8f0',
                    display: (selectedUser && isMobile) ? 'none' : 'flex',
                    flexDirection: 'column'
                }}>
                    <div style={{ padding: 16 }}>
                        <div style={{ position: 'relative' }}>
                            <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={16} />
                            <input 
                                type="text" 
                                placeholder="Search conversations..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px 12px 10px 40px', 
                                    borderRadius: 10, 
                                    border: '1px solid #e2e8f0',
                                    fontSize: 14,
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {filteredConversations.map((conv) => (
                            <div 
                                key={conv._id}
                                onClick={() => handleSelectUser(conv)}
                                style={{ 
                                    padding: '16px', 
                                    borderBottom: '1px solid #f1f5f9',
                                    cursor: 'pointer',
                                    background: selectedUser?._id === conv._id ? '#f1f5f9' : 'transparent',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    gap: 12,
                                    position: 'relative'
                                }}
                            >
                                <div style={{ 
                                    width: 48, 
                                    height: 48, 
                                    borderRadius: 12, 
                                    background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#475569',
                                    fontWeight: 700,
                                    fontSize: 18
                                }}>
                                    {conv.userDetails.name.charAt(0)}
                                </div>
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{conv.userDetails.name}</h3>
                                        <span style={{ fontSize: 10, color: '#94a3b8' }}>{new Date(conv.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <p style={{ 
                                        margin: '4px 0 0', 
                                        fontSize: 12, 
                                        color: conv.unreadCount > 0 ? '#1e293b' : '#64748b', 
                                        fontWeight: conv.unreadCount > 0 ? 600 : 400,
                                        whiteSpace: 'nowrap', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis' 
                                    }}>
                                        {conv.lastSender === conv._id ? '' : 'You: '}{conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div style={{ 
                                        minWidth: 20, 
                                        height: 20, 
                                        background: '#ef4444', 
                                        borderRadius: 10, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center', 
                                        color: '#fff', 
                                        fontSize: 10, 
                                        fontWeight: 800,
                                        padding: '0 6px'
                                    }}>
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main: Chat Content */}
                {selectedUser ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
                        {/* Chat Header */}
                        <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button 
                                onClick={() => setSelectedUser(null)}
                                style={{ display: isMobile ? 'block' : 'none', background: 'none', border: 'none', cursor: 'pointer' }}
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>
                                {selectedUser.name.charAt(0)}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{selectedUser.name}</h2>
                                <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>{selectedUser.email}</p>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12, background: '#f8fafc' }}>
                            {messagesLoading ? (
                                <div style={{ textAlign: 'center', padding: 20 }}>Loading...</div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMe = msg.isAdmin;
                                    return (
                                        <div key={i} style={{ 
                                            alignSelf: isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '80%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: isMe ? 'flex-end' : 'flex-start'
                                        }}>
                                            <div style={{ 
                                                background: isMe ? '#1e293b' : '#fff',
                                                color: isMe ? '#fff' : '#1e293b',
                                                padding: '10px 14px',
                                                borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                                fontSize: 13,
                                                lineHeight: 1.5,
                                                border: isMe ? 'none' : '1px solid #e2e8f0'
                                            }}>
                                                {msg.message}
                                            </div>
                                            <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                {isMe && (
                                                    msg.isRead ? <CheckCheck size={10} color="#10b981" /> : <Check size={10} />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Footer Input */}
                        <form onSubmit={handleSendMessage} style={{ padding: 16, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12 }}>
                            <input 
                                type="text"
                                placeholder="Write a reply..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                style={{ 
                                    flex: 1, 
                                    padding: '12px 16px', 
                                    borderRadius: 10, 
                                    border: '1px solid #e2e8f0',
                                    fontSize: 14,
                                    outline: 'none'
                                }}
                            />
                            <button 
                                type="submit"
                                disabled={sending || !newMessage.trim()}
                                style={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: 10, 
                                    background: '#4f46e5', 
                                    color: '#fff', 
                                    border: 'none', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: isMobile ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: '#94a3b8' }}>
                        <MessageSquare size={64} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <h3 style={{ fontSize: 18, fontWeight: 700 }}>Select a customer</h3>
                        <p style={{ fontSize: 14 }}>Pick a conversation from the left to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSupport;
