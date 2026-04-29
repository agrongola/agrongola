'use client';

import dynamic from 'next/dynamic';

const AgroMap = dynamic(() => import('./AgroMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0f1e]/80 backdrop-blur-sm text-white">
      <div className="w-12 h-12 border-4 border-[#38bdf8] border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-medium text-white/80 uppercase tracking-widest text-xs">Carregando satélite...</p>
    </div>
  )
});

type Props = {
  farmLocation: { lat: number; lng: number } | null;
  onSetFarmLocation: (loc: { lat: number; lng: number }) => void;
};

export default function AgroMapWrapper(props: Props) {
  return <AgroMap {...props} />;
}
