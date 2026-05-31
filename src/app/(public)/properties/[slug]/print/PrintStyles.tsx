'use client';

export default function PrintStyles() {
  return (
    <style>{`
      @media print {
        .no-print { display: none !important; }
        body { background: white; }
        @page { margin: 0.5cm; size: A4; }
      }
    `}</style>
  );
}
