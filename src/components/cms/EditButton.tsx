'use client';

import { Edit2 } from 'lucide-react';

interface EditButtonProps {
  onClick: () => void;
  label?: string;
}

export default function EditButton({ onClick, label = 'Edit Section' }: EditButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-blue-600/90 hover:bg-blue-700 text-white px-3 py-2 rounded shadow-lg backdrop-blur-sm transition-all duration-200 transform hover:scale-105 border border-blue-500/50"
    >
      <Edit2 size={16} />
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
