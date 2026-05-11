import React from 'react';
import { createRoot } from 'react-dom/client';
import { Settings } from './settings/Settings';
import './styles/globals.css';

const root = createRoot(document.getElementById('root')!);
root.render(<React.StrictMode><Settings /></React.StrictMode>);
