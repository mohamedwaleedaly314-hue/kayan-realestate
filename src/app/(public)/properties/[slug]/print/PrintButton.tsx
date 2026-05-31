'use client';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-[#B8860B] text-white rounded-lg text-sm font-semibold hover:bg-[#9a7009] transition-colors shadow-md"
    >
      <Printer className="w-4 h-4" />
      طباعة / PDF
    </button>
  );
}
