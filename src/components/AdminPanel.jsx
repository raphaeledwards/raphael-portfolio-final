import React, { useState } from 'react';
import { Lock, Database, X } from 'lucide-react';
import { auth } from '../firebase';
import { seedDatabase } from '../services/contentService';

const AdminPanel = ({ isOpen, onClose }) => {
    const [seedingStatus, setSeedingStatus] = useState(null); // 'loading', 'success', 'error'
    const ALLOWED_EMAILS = ["raphael@raphaeljedwards.com"];

    // Check if user is authorized
    const isAuthorized = auth.currentUser && ALLOWED_EMAILS.includes(auth.currentUser.email);

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

                <div className="p-6 space-y-6">
                    <div className="bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                        <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-2">Authenticated User</h3>
                        <p className="font-mono text-green-500 truncate">{auth.currentUser?.email || 'Unknown User'}</p>
                        <p className="text-xs text-neutral-600 mt-1 font-mono">UID: {auth.currentUser?.uid}</p>
                    </div>

                    <div>
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                            <Database size={16} /> Database Management
                        </h3>
                        <p className="text-sm text-neutral-400 mb-4">
                            Upload local portfolio data (projects, blogs, expertise) to Firestore. This will overwrite existing collections.
                        </p>
                        {isAuthorized ? (
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
                        ) : (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm font-bold text-center">
                                ⛔ Unauthorized Access
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-neutral-950 p-4 text-center border-t border-neutral-800">
                    <button onClick={onClose} className="text-sm text-neutral-500 hover:text-neutral-300">Close Panel</button>
                </div>
            </div>
        </div>
    );
};

export default AdminPanel;
