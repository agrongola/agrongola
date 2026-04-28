'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, LayersControl, Polyline, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Crosshair, Tractor, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';

// Required to fix Leaflet default icon issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const farmIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const userIcon = new L.Icon({
  iconUrl: 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const tractorIconHtml = `
  <div style="background-color: #eab308; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 11 11 .9c.6 0 .9.5.8 1.1l-.8 5h-1"/><path d="M16 18h-5"/><path d="M18 5a1 1 0 0 0-1 1v5.573"/><path d="M3 4h9l1 7.246"/><path d="M4 11V4"/><path d="M7 15h.01"/><path d="M8 10.1V4"/><circle cx="18" cy="18" r="2"/><circle cx="7" cy="15" r="5"/></svg>
  </div>
`;

const tractorIcon = L.divIcon({
  html: tractorIconHtml,
  className: '',
  iconSize: [44, 44],
  iconAnchor: [22, 22],
  popupAnchor: [0, -22]
});

type AgroMapProps = {
  farmLocation: { lat: number; lng: number } | null;
  onSetFarmLocation: (loc: { lat: number; lng: number }) => void;
};

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToMe({ pos }: { pos: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo([pos.lat, pos.lng], 16, { animate: true, duration: 1.5 });
    }
  }, [pos, map]);
  return null;
}

export default function AgroMap({ farmLocation, onSetFarmLocation }: AgroMapProps) {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [triggerFly, setTriggerFly] = useState(0);
  const [isTrackingTractor, setIsTrackingTractor] = useState(false);
  const [tractorLoc, setTractorLoc] = useState<{lat: number, lng: number} | null>(null);
  const [tractorPath, setTractorPath] = useState<[number, number][]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [aiInsights, setAiInsights] = useState(false);

  useEffect(() => {
    // Tenta encontrar o usuário silenciosamente ao iniciar o mapa se não houver fazenda
    if (!farmLocation && !userLocation) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
            setTriggerFly(prev => prev + 1);
          },
          () => {}, // Falha silenciosa
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      }
    }
  }, []);

  // O alvo do scan será a farmLocation se existir, senão a userLocation
  const targetLocation = farmLocation || userLocation;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let initialTimer: NodeJS.Timeout;
    if (targetLocation) {
      initialTimer = setTimeout(() => {
        setIsScanning(true);
        setAiInsights(false);
      }, 0);
      timer = setTimeout(() => {
        setIsScanning(false);
        setAiInsights(true);
      }, 3500);
      return () => {
        clearTimeout(initialTimer);
        clearTimeout(timer);
      };
    }
  }, [targetLocation]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTrackingTractor) {
      interval = setInterval(() => {
        setTractorLoc(prev => {
          const startLat = farmLocation ? farmLocation.lat : -12.5763;
          const startLng = farmLocation ? farmLocation.lng : 13.4055;
          
          const t = Date.now() / 4000; 
          const nextLat = startLat + (Math.sin(t) * 0.0015);
          const nextLng = startLng + (Math.cos(t * 1.5) * 0.002);

          setTractorPath(path => {
            const newPath = [...path, [nextLat, nextLng]] as [number, number][];
            if (newPath.length > 200) newPath.shift();
            return newPath;
          });
          return { lat: nextLat, lng: nextLng };
        });
      }, 1000);
    } else {
      setTimeout(() => {
        setTractorLoc(null);
        setTractorPath([]);
      }, 0);
    }
    return () => clearInterval(interval);
  }, [isTrackingTractor, farmLocation]);

  const locateUser = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setTriggerFly(prev => prev + 1);
        },
        (error) => {
          console.error("Geolocalização negada ou falhou", error);
          alert("Não foi possível acessar a localização. Verifique as permissões de geolocalização no navegador.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      alert("Seu navegador não suporta geolocalização.");
    }
  };

  return (
    <div className="relative w-full h-full bg-black/20">
      <MapContainer 
        center={farmLocation || [-12.5763, 13.4055]} 
        zoom={6} 
        style={{ height: '100%', width: '100%', zIndex: 10 }}
        zoomControl={false}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Satélite de Alta Precisão (Esri)">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Mapa Terrestre (OpenStreetMap)">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        <ClickHandler onLocationSelect={(lat, lng) => onSetFarmLocation({lat, lng})} />

        {/* Trigger fly to user only when they click the button */}
        {userLocation && triggerFly > 0 && <FlyToMe pos={userLocation} />}

        {farmLocation && (
          <Marker position={[farmLocation.lat, farmLocation.lng]} icon={farmIcon}>
            <Popup className="agro-popup">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-green-700">Fazenda / Lote</span>
                <span className="text-xs text-gray-500 mt-1">Lat: {farmLocation.lat.toFixed(6)}</span>
                <span className="text-xs text-gray-500">Lng: {farmLocation.lng.toFixed(6)}</span>
              </div>
            </Popup>
          </Marker>
        )}

        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
             <Popup>
              <div className="font-bold text-sm text-blue-700">Sua Localização Atual</div>
            </Popup>
          </Marker>
        )}

        {targetLocation && (
          <Circle 
            center={[targetLocation.lat, targetLocation.lng]} 
            pathOptions={{ 
              color: isScanning ? '#76c893' : '#3b82f6', 
              fillColor: isScanning ? '#76c893' : '#3b82f6', 
              fillOpacity: isScanning ? 0.2 : 0.1, 
              weight: 2, 
              dashArray: isScanning ? '5, 10' : undefined,
              className: isScanning ? 'animate-spin-slow origin-center' : '' 
            }} 
            radius={178.4} // ~10 hectares
          />
        )}

        {tractorLoc && tractorPath.length > 1 && (
          <Polyline 
            positions={tractorPath} 
            pathOptions={{ color: '#eab308', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
          />
        )}

        {tractorLoc && (
          <Marker position={[tractorLoc.lat, tractorLoc.lng]} icon={tractorIcon}>
            <Popup className="agro-popup">
              <div className="flex flex-col">
                <span className="font-bold text-sm text-yellow-700">Trator John Deere 5090</span>
                <span className="text-xs text-gray-500 mt-1">Status: Em operação (Plantio)</span>
                <span className="text-xs text-gray-500">Velocidade: 6.2 km/h</span>
                <span className="text-[10px] text-green-600 mt-1">Sinal GPS Analisado (Tempo Real)</span>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Floating Action Buttons */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-3">
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsTrackingTractor(!isTrackingTractor); }}
          className={cn("w-12 h-12 rounded-full shadow-2xl border flex items-center justify-center transition-all focus:outline-none", isTrackingTractor ? "bg-amber-500 text-white border-amber-600 shadow-amber-500/50" : "bg-black/70 text-white border-white/20 hover:bg-black/90")}
          title="Rastreamento de Trator"
        >
          <Tractor className="w-6 h-6" />
        </button>
        <button 
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); locateUser(); }}
          className="bg-white text-black w-12 h-12 rounded-full shadow-2xl border border-gray-200 flex items-center justify-center hover:bg-blue-50 transition-colors focus:outline-none"
          title="Minha Localização por Satélite"
        >
          <Crosshair className="w-6 h-6 text-blue-600" />
        </button>
      </div>

      <div className="absolute top-6 left-6 z-[1000] bg-black/70 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-white max-w-[260px] pointer-events-none shadow-2xl">
        <h3 className="font-bold text-sm mb-1.5 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#76c893]" />
          Georreferenciamento
        </h3>
        <p className="text-xs text-white/80 leading-relaxed">
          Sistema ligado a satélites de alta resolução. Ao focar num local, a IA analisa o perímetro de 10ha.
        </p>
      </div>

      {isScanning && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[1000] pointer-events-none flex flex-col items-center">
          <div className="w-32 h-32 border-4 border-[#76c893] rounded-full border-t-transparent animate-spin"></div>
          <div className="mt-4 bg-black/80 px-4 py-2 rounded-full text-[#76c893] text-[10px] font-bold font-mono tracking-widest flex items-center gap-2 shadow-xl border border-[#76c893]/30">
            <BrainCircuit className="w-3.5 h-3.5 animate-pulse" />
            ANALISANDO BORDAS (10ha)...
          </div>
        </div>
      )}

      {aiInsights && !isScanning && (
         <div className="absolute top-6 right-6 z-[1000] bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-[#76c893]/40 text-white w-[280px] shadow-2xl max-h-[85vh] overflow-y-auto">
           <h4 className="font-bold text-sm text-[#76c893] gap-2 mb-3 flex items-center border-b border-white/10 pb-2">
             <BrainCircuit className="w-4 h-4" />
             Relatório IoT IA (10ha)
           </h4>
           <div className="text-xs text-white/90 space-y-3 font-mono">
             <div className="space-y-1">
               <p className="flex justify-between items-center"><span className="text-white/60">Índice Vegetativo (NDVI):</span> <span className="text-green-400 font-bold bg-green-400/10 px-1.5 rounded">0.72 - Ótimo</span></p>
               <div className="w-full bg-white/10 rounded-full h-1"><div className="bg-green-400 h-1 rounded-full w-[72%]"></div></div>
             </div>
             <div className="space-y-1">
               <p className="flex justify-between items-center"><span className="text-white/60">Umidade Estimada:</span> <span className="text-amber-400 font-bold bg-amber-400/10 px-1.5 rounded">45% - Alerta</span></p>
               <div className="w-full bg-white/10 rounded-full h-1"><div className="bg-amber-400 h-1 rounded-full w-[45%]"></div></div>
             </div>
             <div className="space-y-1">
               <p className="flex justify-between items-center"><span className="text-white/60">Risco de Pragas/Patógenos:</span> <span className="text-blue-400 font-bold bg-blue-400/10 px-1.5 rounded">Baixo</span></p>
               <div className="w-full bg-white/10 rounded-full h-1"><div className="bg-blue-400 h-1 rounded-full w-[20%]"></div></div>
             </div>
             
             <div className="bg-[#76c893]/10 p-2.5 rounded-lg mt-3 border border-[#76c893]/20">
               <p className="text-[10px] uppercase text-[#76c893] font-bold mb-1">Diagnóstico Específico</p>
               <p className="leading-relaxed text-white/80">
                 Identificada leve assimetria térmica no quadrante leste. Sugestão: verificar aspersores da área ou adicionar matéria orgânica no solo.
               </p>
             </div>
           </div>
         </div>
      )}
    </div>
  );
}
