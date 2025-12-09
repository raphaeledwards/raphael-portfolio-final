import React, { useState } from 'react';
import { Lock, Database, X, MessageSquare, ChevronRight, LogOut, BrainCircuit } from 'lucide-react';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { seedDatabase, fetchChatLogs } from '../services/contentService';

const AdminPanel = ({ isOpen, onClose }) => {
    const [seedingStatus, setSeedingStatus] = useState(null); // 'loading', 'success', 'error'
    const [activeTab, setActiveTab] = useState('database');
    const [chatLogs, setChatLogs] = useState([]);
    const [expandedLog, setExpandedLog] = useState(null);
    const ALLOWED_EMAILS = ["raphaeledwards@gmail.com"];

    // Check if user is authorized
    const isAuthorized = auth.currentUser && ALLOWED_EMAILS.includes(auth.currentUser.email);

    // Fetch logs on tab switch
    React.useEffect(() => {
        if (isOpen && activeTab === 'logs' && isAuthorized) {
            fetchChatLogs().then(setChatLogs);
        }
    }, [isOpen, activeTab, isAuthorized]);

    if (!isOpen) return null;

    const handleSeed = async () => {
        if (!auth.currentUser) return;
        if (!window.confirm("Overwrite Firestore database with local content? This cannot be undone.")) return;

        setSeedingStatus('loading');
        try {
            const count = await seedDatabase();
            setSeedingStatus('success');
            alert(`Database seeded successfully! (${count} items)`);
            window.location.reload();
        } catch (e) {
            console.error(e);
            setSeedingStatus('error');
            alert(`Seeding failed: ${e.message}`);
        } finally {
            setSeedingStatus(null);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);
            onClose(); // Close the panel after logout
        } catch (error) {
            console.error("Error signing out: ", error);
            alert("Error signing out");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="bg-neutral-800 p-4 flex justify-between items-center border-b border-neutral-700">
                    <div className="flex items-center gap-2 font-bold text-white">
                        <Lock className="text-rose-500" size={20} />
                        <span>Admin Console</span>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex border-b border-neutral-800">
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'database' ? 'text-rose-500 border-b-2 border-rose-500 bg-neutral-900' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <Database size={16} /> Database
                    </button>
                    <button
                        onClick={() => setActiveTab('logs')}
                        className={`flex-1 p-3 text-sm font-bold flex items-center justify-center gap-2 transition-colors ${activeTab === 'logs' ? 'text-rose-500 border-b-2 border-rose-500 bg-neutral-900' : 'text-neutral-500 hover:text-white'}`}
                    >
                        <MessageSquare size={16} /> Chat History
                    </button>
                </div>

                <div className="p-6 space-y-6 h-[400px] overflow-y-auto">
                    {/* AUTH INFO */}
                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800 shrink-0">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Authenticated User</h3>
                        <div className="flex items-center justify-between">
                            <p className="font-mono text-green-500 truncate">{auth.currentUser?.email || 'Unknown User'}</p>
                            <button
                                onClick={handleLogout}
                                className="text-xs bg-neutral-900 border border-neutral-700 text-neutral-400 hover:text-white hover:bg-red-900/30 hover:border-red-500/50 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                title="Sign Out"
                            >
                                <LogOut size={12} /> Sign Out
                            </button>
                        </div>
                    </div>

                    {/* TAB CONTENT: DATABASE */}
                    {activeTab === 'database' && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                                <Database size={16} /> Database Management
                            </h3>
                            <p className="text-sm text-neutral-400 mb-4">
                                Upload local portfolio data (projects, blogs, expertise) to Firestore. This will overwrite existing collections.
                            </p>
                            {isAuthorized ? (
                                <div className="space-y-3">
                                    <button
                                        onClick={handleSeed}
                                        disabled={seedingStatus === 'loading'}
                                        className="w-full bg-rose-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {seedingStatus === 'loading' ? (
                                            <>Seeding...</>
                                        ) : (
                                            <>⚡ Seed Database</>
                                        )}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (!window.confirm("Generate embeddings for all items? This consumes API quota.")) return;
                                            setSeedingStatus('loading');
                                            try {
                                                const { updateEmbeddings } = await import('../services/contentService');
                                                await updateEmbeddings();
                                                alert("Embeddings generated!");
                                            } catch (e) {
                                                alert("Error: " + e.message);
                                            } finally {
                                                setSeedingStatus(null);
                                            }
                                        }}
                                        disabled={seedingStatus === 'loading'}
                                        className="w-full bg-neutral-800 border border-neutral-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-neutral-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <BrainCircuit size={16} /> Generate Embeddings
                                    </button>
                                </div>
                            ) : (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm font-bold text-center">
                                    ⛔ Unauthorized Access
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB CONTENT: CHAT LOGS */}
                    {activeTab === 'logs' && (
                        <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            {!isAuthorized ? (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm font-bold text-center">
                                    ⛔ Unauthorized Access
                                </div>
                            ) : chatLogs.length === 0 ? (
                                <p className="text-neutral-500 text-center py-8">No logs found.</p>
                            ) : (
                                chatLogs.map(log => (
                                    <div
                                        key={log.id}
                                        className={`bg-neutral-950 border border-neutral-800 rounded-lg overflow-hidden transition-all ${expandedLog === log.id ? 'ring-1 ring-rose-500' : 'hover:border-neutral-700'}`}
                                    >
                                        <div
                                            className="p-3 flex items-center justify-between cursor-pointer"
                                            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                        >
                                            <div className="flex flex-col gap-1 overflow-hidden">
                                                <div className="flex items-center gap-2 text-xs font-mono text-neutral-500">
                                                    <span>{log.timestamp?.toLocaleDateString()} {log.timestamp?.toLocaleTimeString()}</span>
                                                    <span>•</span>
                                                    <span className="truncate max-w-[100px]">{log.userId}</span>
                                                </div>
                                                <p className="text-sm text-white truncate font-medium">{log.userQuery}</p>
                                            </div>
                                            <ChevronRight size={16} className={`text-neutral-600 transition-transform ${expandedLog === log.id ? 'rotate-90' : ''}`} />
                                        </div>

                                        {expandedLog === log.id && (
                                            <div className="p-3 pt-0 border-t border-neutral-800 bg-neutral-900/50">
                                                <div className="mb-2">
                                                    <span className="text-xs font-bold text-rose-500 uppercase tracking-wider">AI Response</span>
                                                    <p className="text-sm text-neutral-300 mt-1 whitespace-pre-wrap">{log.aiResponse}</p>
                                                </div>
                                                <div className="text-xs text-neutral-600 font-mono mt-2">
                                                    Model: {log.model} | Context: {log.context}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <div className="bg-neutral-950 p-4 text-center border-t border-neutral-800">
                    <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-300">Close Panel</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
