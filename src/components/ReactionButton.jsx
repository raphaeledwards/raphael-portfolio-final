import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { incrementReaction } from '../services/contentService';

const ReactionButton = ({ collectionName, docId, initialCount = 0, onReaction }) => {
    const [count, setCount] = useState(initialCount);
    const [hasReacted, setHasReacted] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        // optimistically check session storage to see if user already reacted this session
        const key = `reacted_${collectionName}_${docId}`;
        if (sessionStorage.getItem(key)) {
            setHasReacted(true);
        }
        setCount(initialCount);
    }, [collectionName, docId, initialCount]);

    useEffect(() => {
        if (!isAnimating) return;
        const timer = setTimeout(() => setIsAnimating(false), 1000);
        return () => clearTimeout(timer);
    }, [isAnimating]);

    const handleReaction = async (e) => {
        e.stopPropagation();
        if (hasReacted) return;

        // 1. Optimistic UI update
        const newCount = count + 1;
        setCount(newCount);
        setHasReacted(true);
        setIsAnimating(true);
        sessionStorage.setItem(`reacted_${collectionName}_${docId}`, 'true');

        // Notify parent to sync other views (e.g. List view vs Modal view)
        if (onReaction) onReaction(newCount);

        // 3. Backend update
        try {
            await incrementReaction(collectionName, docId);
        } catch (error) {
            console.error("Failed to sync reaction:", error);
            // Revert on failure (optional, but good practice)
            setCount(prev => prev - 1);
            setHasReacted(false);
            sessionStorage.removeItem(`reacted_${collectionName}_${docId}`);
            // Revert parent if necessary (complex, maybe skip for now as edge case)
        }
    };

    return (
        <button
            onClick={handleReaction}
            disabled={hasReacted}
            className={`group relative flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 ${hasReacted
                ? 'bg-rose-500/10 text-rose-500 cursor-default'
                : 'bg-neutral-800 text-neutral-400 hover:bg-rose-500 hover:text-white cursor-pointer'
                }`}
            aria-label="React to this post"
        >
            <div className={`relative ${isAnimating ? 'animate-[bounce_0.5s_infinite]' : ''}`}>
                <Flame
                    size={16}
                    className={`transition-all duration-300 ${hasReacted ? 'fill-rose-500' : 'group-hover:scale-110'}`}
                />
                {isAnimating && (
                    <div className="absolute inset-0 animate-ping opacity-75">
                        <Flame size={16} className="fill-rose-500 text-rose-500" />
                    </div>
                )}
            </div>
            <span className={`text-xs font-bold font-mono ${isAnimating ? 'scale-110 text-white' : ''} transition-transform`}>
                {count > 0 ? count : ''}
            </span>

            {/* Tooltip/Status */}
            {hasReacted && (
                <span className="sr-only">You reacted</span>
            )}
        </button>
    );
};

export default ReactionButton;
