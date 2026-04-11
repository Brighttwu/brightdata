import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, Smartphone, LayoutDashboard, Wallet } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    return (
        <nav className="glass sticky top-4 mx-4 mt-4 z-50 px-6 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 no-underline">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg">
                    <Smartphone className="text-white" size={24} />
                </div>
                <span className="text-xl font-bold tracking-tight gradient-text">BossuData</span>
            </Link>

            <div className="flex items-center gap-6">
                {user ? (
                    <>
                        <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-2 no-underline">
                            <LayoutDashboard size={18} /> Dashboard
                        </Link>
                        <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-700">
                            <Wallet size={16} className="text-cyan-400" />
                            <span className="text-xs font-bold text-white">₵ {user.balance.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={() => { logout(); navigate('/login'); }}
                            className="text-slate-400 hover:text-error transition-colors bg-transparent border-none cursor-pointer"
                        >
                            <LogOut size={20} />
                        </button>
                    </>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white no-underline">Login</Link>
                        <Link to="/register" className="btn-primary no-underline text-xs py-2 px-5">Get Started</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
