
// SNAPSHOT OF SOURCE CODE FOR RAG INDEXING
// This file is auto-generated or manually updated to provide the "Source Code" context to the AI.

import AppSource from '../App.jsx?raw';
import ContentServiceSource from '../services/contentService.js?raw';
import VectorUtilsSource from '../utils/vectorUtils.js?raw';
import AdminPanelSource from '../components/AdminPanel.jsx?raw';
import LoginSource from '../Login.jsx?raw';

export const SOURCE_CODE_MANIFEST = [
    {
        id: 'file_App_jsx',
        filePath: 'src/App.jsx',
        title: 'App.jsx (Main Application Logic)',
        description: 'The core React component containing the chat interface, navigation, section rendering, and state management.',
        category: 'Source Code',
        // Vite allows importing files as raw strings using ?raw suffix
        content: AppSource
    },
    {
        id: 'file_contentService_js',
        filePath: 'src/services/contentService.js',
        title: 'contentService.js (Firestore Logic)',
        description: 'Handles all interactions with Firebase Firestore, including fetching content, logging chats, and updating embeddings.',
        category: 'Source Code',
        content: ContentServiceSource
    },
    {
        id: 'file_vectorUtils_js',
        filePath: 'src/utils/vectorUtils.js',
        title: 'vectorUtils.js (Vector Search Implementation)',
        description: 'Utilities for generating embeddings via Gemini API and calculating cosine similarity.',
        category: 'Source Code',
        content: VectorUtilsSource
    },
    {
        id: 'file_AdminPanel_jsx',
        filePath: 'src/components/AdminPanel.jsx',
        title: 'AdminPanel.jsx (Admin Logic)',
        description: 'Secured administrative interface for database seeding and viewing chat logs.',
        category: 'Source Code',
        content: AdminPanelSource
    },
    {
        id: 'file_Login_jsx',
        filePath: 'src/Login.jsx',
        title: 'Login.jsx (Authentication)',
        description: 'Handles user authentication via Firebase Auth (Google Sign-In) and anonymous fallback.',
        category: 'Source Code',
        content: LoginSource
    }
];
