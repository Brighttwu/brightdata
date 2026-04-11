import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Zap, Shield, Globe, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const features = [
        { icon: <Zap className="text-yellow-400" />, title: "Instant Delivery", desc: "Data is delivered to your recipient instantly after payment." },
        { icon: <Shield className="text-green-400" />, title: "Secure Payments", desc: "Your transactions are protected with industry-standard security." },
        { icon: <Globe className="text-blue-400" />, title: "Multiple Networks", desc: "Support for MTN, Vodafone, and AirtelTigo bundles." }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
            <div className="text-center mb-24">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
                        The Smartest Way to <br />
                        <span className="gradient-text">Resell Data.</span>
                    </h1>
                    <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10">
                        Join thousands of agents using BossuData to provide affordable data services to their customers across all major networks.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/register" className="btn-primary text-lg px-8 py-4 w-full sm:w-auto no-underline">
                            Start Reselling Now <ArrowRight size={20} />
                        </Link>
                        <Link to="/login" className="px-8 py-4 glass text-white font-semibold hover:bg-white/5 transition-all w-full sm:w-auto no-underline text-center">
                            Admin Login
                        </Link>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {features.map((f, i) => (
                    <motion.div 
                        key={i}
                        className="glass card p-8"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        viewport={{ once: true }}
                    >
                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center mb-6">
                            {f.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                        <p className="text-slate-400 leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default Home;
