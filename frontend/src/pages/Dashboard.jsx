import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Smartphone, Send, History, CheckCircle2, XCircle, Clock, Search, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const { user, updateBalance } = useAuth();
    const [network, setNetwork] = useState('mtn');
    const [packages, setPackages] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [buying, setBuying] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const networks = [
        { id: 'mtn', name: 'MTN', color: 'bg-yellow-400' },
        { id: 'telecel', name: 'Telecel', color: 'bg-red-500' },
        { id: 'at', name: 'AT', color: 'bg-blue-600' }
    ];

    useEffect(() => {
        const fetchPackages = async () => {
            setLoading(true);
            try {
                const res = await axios.get(`http://localhost:5000/api/data/packages/${network}`);
                const rawPackages = res.data.packages || res.data.data || [];
                const mappedPackages = Array.isArray(rawPackages) ? rawPackages.map(p => ({
                    key: p.package_key || p.key || '',
                    name: p.display_name || p.name || 'Unknown Plan',
                    price: Number(p.price) || 0
                })) : [];
                setPackages(mappedPackages);
            } catch (err) {
                console.error("Error fetching packages", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPackages();
    }, [network]);

    const handleBuy = async () => {
        if (!selectedPackage || !phone) return;
        
        setBuying(true);
        setMessage({ type: '', text: '' });

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post('http://localhost:5000/api/data/buy', {
                network,
                package_key: selectedPackage.key,
                package_name: selectedPackage.name,
                recipient_phone: phone,
                amount: selectedPackage.price
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            updateBalance(res.data.balance);
            setMessage({ type: 'success', text: 'Order placed successfully! It will be delivered shortly.' });
            setPhone('');
            setSelectedPackage(null);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Transaction failed. Please try again.' });
        } finally {
            setBuying(false);
        }
    };

    const filteredPackages = packages.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-10">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Left Column: Purchase Form */}
                <div className="lg:col-span-2 space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Smartphone className="text-indigo-400" /> Purchase Data
                        </h2>

                        {/* Network Selection */}
                        <div className="mb-8">
                            <label className="text-sm font-medium text-slate-400 mb-3 block">Select Network</label>
                            <div className="flex gap-4">
                                {networks.map(n => (
                                    <button 
                                        key={n.id}
                                        onClick={() => { setNetwork(n.id); setSelectedPackage(null); }}
                                        className={`flex-1 py-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2 font-bold ${
                                            network === n.id 
                                            ? `border-indigo-500 bg-indigo-500/10 text-white` 
                                            : `border-slate-800 bg-slate-900/50 text-slate-500 hover:border-slate-700`
                                        }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${n.color}`}></div>
                                        {n.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Package Selection */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-4">
                                <label className="text-sm font-medium text-slate-400">Select Package</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2 text-slate-500" size={14} />
                                    <input 
                                        type="text"
                                        placeholder="Search bundles..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="bg-slate-800/50 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-height-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {loading ? (
                                    <div className="col-span-full py-10 text-center"><Clock className="animate-spin mx-auto mb-2" /> Loading packages...</div>
                                ) : filteredPackages.length > 0 ? (
                                    filteredPackages.map(p => (
                                        <div 
                                            key={p.key}
                                            onClick={() => setSelectedPackage(p)}
                                            className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                                                selectedPackage?.key === p.key
                                                ? 'border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/10'
                                                : 'border-slate-800 bg-slate-900/30 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="text-sm font-bold mb-1">{p.name}</div>
                                            <div className="text-indigo-400 font-bold">₵ {p.price.toFixed(2)}</div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-10 text-slate-500">No packages found for this network.</div>
                                )}
                            </div>
                        </div>

                        {/* Recipient Info */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-400">Recipient Phone Number</label>
                                <input 
                                    type="tel"
                                    placeholder="024XXXXXXX"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-4 px-6 text-xl font-mono text-white tracking-widest focus:border-indigo-500 focus:outline-none"
                                />
                            </div>

                            <AnimatePresence>
                                {message.text && (
                                    <motion.div 
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className={`p-4 rounded-xl flex items-center gap-3 ${
                                            message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/50' : 'bg-red-500/10 text-red-400 border border-red-500/50'
                                        }`}
                                    >
                                        {message.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                                        <span className="text-sm font-medium">{message.text}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button 
                                onClick={handleBuy}
                                disabled={buying || !selectedPackage || phone.length < 10}
                                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
                                    buying || !selectedPackage || phone.length < 10
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'btn-primary shadow-xl shadow-indigo-500/20'
                                }`}
                            >
                                {buying ? <Clock className="animate-spin" /> : <Send size={20} />}
                                {buying ? 'Processing Transaction...' : selectedPackage ? `Confirm Purchase - ₵ ${selectedPackage.price.toFixed(2)}` : 'Select a Bundle'}
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Column: Wallet & Recent Activity */}
                <div className="space-y-8">
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass bg-gradient-to-br from-indigo-600/20 to-cyan-600/10 p-8 border-indigo-500/20"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-slate-300 font-medium">Available Balance</span>
                            <Wallet className="text-indigo-400" size={20} />
                        </div>
                        <div className="text-4xl font-black mb-2 tracking-tight">
                            ₵ {user?.balance.toFixed(2)}
                        </div>
                        <div className="text-xs text-indigo-300 font-medium bg-indigo-500/20 px-2 py-1 rounded inline-block">
                           + 0.00 this month
                        </div>
                        <button className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-sm transition-all border border-white/10">
                            Top Up Wallet
                        </button>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass p-8"
                    >
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <History size={18} className="text-slate-400" /> Recent Activity
                        </h3>
                        <div className="space-y-4">
                            {/* In a real app, fetch transactions here */}
                            <div className="text-center py-8 text-slate-500 italic text-sm">
                                Your recent purchases will appear here.
                            </div>
                        </div>
                    </motion.div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
