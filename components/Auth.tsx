import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Auth: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                setMessage('Check your email for the login link!');
            }
        } catch (error: any) {
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md w-96">
                <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h1>
                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            placeholder="Your email"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            placeholder="Your password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                    </button>
                </form>
                {message && <p className="mt-4 text-sm text-center text-red-500">{message}</p>}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-sm text-blue-600 hover:underline focus:outline-none"
                    >
                        {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Auth;
