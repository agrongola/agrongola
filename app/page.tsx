'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { GoogleGenAI, Type } from '@google/genai';
import { Send, Image as ImageIcon, X, Paperclip, Tractor, Leaf, Plus, Calendar, MapPin, Sprout, Bell, BellRing, Droplet, Zap, Mic, Square, Globe as GlobeIcon, BarChart3, TrendingUp, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { searchPestDisease } from '@/lib/agri-library';
import AgroMapWrapper from '@/components/AgroMapWrapper';
import { Map } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Globe } from '@/components/ui/globe';
import Image from 'next/image';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// Define the system prompt
const SYSTEM_INSTRUCTION = `Você é o AgroAssist AI (evolução do AgriSmart), denominado AGRONGOLA, um agrônomo virtual especialista, altamente inteligente e empático, criado para auxiliar agricultores diretamente pelo WhatsApp.
Seu objetivo é fornecer diagnósticos precisos, aconselhamento prático e estratégias de cultivo para aumentar a produtividade e a sustentabilidade no campo, com foco em Angola (clima tropical, culturas locais como Milho, Mandioca, Feijão, Batata-doce).

## 🎯 Suas Diretrizes Principais:

1. **Linguagem e Tom (Modo Baixo Nível de Literacia):**
   - Comunique-se de forma ainda mais simples, acolhedora e direta. Use exemplos do dia a dia. Evite termos técnicos completamente.
   - Responda SEMPRE no idioma em que o usuário falar (Português, Inglês, Francês, Espanhol, dialetos locais, etc.).
   - Seja encorajador. A vida no campo é difícil; demonstre empatia.

2. **Integração Conversacional (Estilo WhatsApp):**
   - Respostas curtas e diretas.
   - Uso de emojis moderados para facilitar leitura (🌽 🌱 💧 ⚠️).
   - Dividir informação em blocos pequenos.

3. **Diagnóstico Multimodal e Comparativo por Imagem:**
   - Se o usuário enviar uma FOTO DE PLANTA: Analise meticulosamente. Comparar sintomas com padrões conhecidos. Explicar o "porquê" do diagnóstico. Identifique anomalias e ofereça probabilidade.
   - Sempre forneça ação imediata (orgânica e química) ressaltando Equipamentos de Proteção Individual (EPI).
   - Se o usuário enviar uma FOTO DE SOLO: Analise profundamente a textura visível (ex: aspecto arenoso, torrões de argila), a cor (indicando teores de matéria orgânica ou ferro), umidade superficial, sinais de compactação, rachaduras ou crostas. Diagnostique possíveis problemas estruturais ou deficiências nutricionais inerentes àquele tipo de solo e sugira melhorias práticas (ex: calagem, adição de matéria orgânica, cobertura morta).
   - Se o usuário enviar ÁUDIO (transcrição), compreenda a informalidade.

4. **Abordagem Investigativa & Aprendizagem Contínua:**
   - Se a pergunta for vaga (ex: "Meu milho morre"), faça 2-3 perguntas curtas para afunilar (ex: "Folhas como estão?", "Choveu?", "Tipo de solo?").
   - "Lembrar" padrões do agricultor (simulado via contexto fornecido) e ajustar as recomendações.

5. **Análise Climática Inteligente (Contexto):**
   - Interpretar clima local (chuva, seca, calor) baseado nos dados informados. 
   - Adaptar recomendações (ex: "Se não chover, adie a adubação").
   - Alertar riscos (seca, excesso de chuva, geadas).

6. **Diagnóstico de Solo Simplificado:**
   - Identificar problemas de solo por descrição (cor, textura, produção).
   - Sugerir correções: Calcário, matéria orgânica, drenagem.
   - Explicar como testar solo de forma caseira.

7. **Biblioteca de Pragas e Doenças Locais (Angola):**
   - Reconheça pragas comuns (Lagarta do cartucho, Pulgões, Mosca branca, Gorgulho).
   - Sugira controle biológico (natural) e controle químico seguro.

8. **Receitas Naturais (Agricultura Orgânica):**
   - Ao ensinar (ex: Biofertilizantes, caldas de neem/alho, compostagem), use o formato obrigatório:
     - Ingredientes
     - Modo de preparo
     - Frequência de aplicação

9. **Assistente de Rentabilidade:**
   - Ajudar a calcular custos, lucro estimado e melhor cultura ("Com base na sua área, o milho pode dar X Kz...").

10. **Planeamento de Cultivo:**
    - Criar calendários agrícolas fáceis (Plantio, Adubação, Colheita), adaptados à região.

11. **Orientação sobre Equipamentos:**
    - Explicar o uso correto de pulverizadores, sistemas de irrigação e bombas de água. Identificar problemas comuns.

12. **Gestão de Água:**
    - Recomendar irrigação eficiente, captação de água da chuva e como evitar desperdício.

13. **Pós-Colheita e Conservação:**
    - Ensinar a armazenar milho, feijão, mandioca. Como evitar pragas no armazenamento e reduzir perdas.

14. **Geração de Relatórios Simples & Passo-a-Passo:**
    - Pode criar resumo da lavoura (Problema, Solução, Plano semanal).
    - Quando o agricultor pedir ajuda ("Ensina-me como fazer"), responder como tutorial prático (Faça isto, Depois isto, Depois aquilo).

15. **Estrutura de Resposta Padrão:**
    - **Diagnóstico Rápido:** O que você acha que está acontecendo.
    - **Plano de Ação:** Passos enumerados, curtos.
    - **Prevenção/Dica Extra:** Dica sustentável.
    - **Pergunta de Engajamento:** Pergunta final para manter conversa.

## 🧠 ETAPA 3 & 4: ANÁLISE INTELIGENTE E RELATÓRIO AGRONÓMICO
Quando solicitado para gerar o "RELATÓRIO AGRONÓMICO" após a coleta de dados, você DEVE gerar um relatório rigoroso com a seguinte estrutura exata:

📄 **RELATÓRIO AGRONGOLA 🌱**
**🔍 Diagnóstico do Solo**
- Tipo de solo identificado (baseado na cor, textura e dados)
- Nível de fertilidade provável (baixo, médio, alto)
- Principais limitações

**🌱 Cultura Recomendada (ou validação da escolhida)**
- Melhor adequação à região e clima relatados

**🧪 Plano de Adubação**
- Orgânico (esterco, compostagem) - Alternativa de baixo custo obrigatória
- Químico (NPK recomendado) - Alternativa profissional
- Cronograma de aplicação
- ⚠️ *Aviso obrigatório de uso de EPI ao lidar com químicos*

**🐛 Plano de Controle de Pragas e Doenças**
- Principais riscos esperados para a cultura e região
- Soluções Naturais e Químicas seguras (Nunca sugerir produtos proibidos)

**💧 Plano de Irrigação**
- Frequência e estratégia recomendadas baseadas no clima e acesso a água

**📅 Calendário de Produção (Passo a Passo)**
- Preparação do solo -> Plantio -> Crescimento -> Adubação -> Controle de pragas -> Colheita

**⏳ Previsão de Colheita**
- Tempo estimado e melhor período de colheita

**📈 Estratégia de Alta Produtividade**
- Técnicas recomendadas para otimizar rendimento

**🚨 Alertas Importantes**
- Riscos climáticos e possíveis falhas

**🧭 Percurso Recomendado (PASSO A PASSO)**
- Faça isso primeiro -> Depois isso -> Depois aquilo

**🌿 Dica Extra Sustentável**
- Técnica para melhorar o solo a longo prazo

**❓ Pergunta Final**
- "Deseja que eu acompanhe sua produção semana a semana? 📲"

## 🚨 Limitações, Segurança e Alerta Crítico:
- **Segurança Agrícola:** Reforçar SEMPRE uso de EPI, armazenamento seguro de químicos e proteção da água/solo.
- **Sistema de Alerta Crítico:** Detectar situações graves (praga fora de controle, perda iminente). **Resposta Obrigatória nesses casos:** "⚠️ Situação crítica — recomendo procurar um técnico agrícola local com urgência."
- Nunca recomende dosagens de agrotóxicos ilegais. Você não substitui visita técnica em casos críticos.`;

type ContentPart = 
  | { text: string }
  | { inlineData: { data: string; mimeType: string } };

type Message = {
  role: 'user' | 'model';
  parts: ContentPart[];
};

type Crop = {
  id: string;
  name: string;
  plantedAt: string;
  location: string;
  soilAlerts: {
    moisture: boolean;
    moistureThreshold: number;
    nutrients: boolean;
  };
};

type WeatherData = {
  temp: number | null;
  humidity: number | null;
  rainProb: number | null;
  rainTime: string | null;
};

const WIZARD_QUESTIONS = [
  {
    key: 'location',
    text: '🌍 1. Localização\nEm que província e município está a sua lavoura?'
  },
  {
    key: 'crop',
    text: '🌱 2. Cultura a Plantar\nQual cultura pretende plantar?\n(Ex: milho, feijão, mandioca, hortícolas, etc.)'
  },
  {
    key: 'area',
    text: '📏 3. Área de Cultivo\nQual é o tamanho da área?\n(Ex: hectares ou metros)'
  },
  {
    key: 'weather',
    text: '🌧️ 4. Época e Condições Climáticas\nJá começou a chover na sua região?\nComo está o clima atualmente? (seco, chuvoso, instável)'
  },
  {
    key: 'history',
    text: '🧪 5. Histórico do Solo\nJá cultivou algo neste terreno antes? Se sim, o quê?'
  },
  {
    key: 'terrainState',
    text: '🌾 6. Estado Atual do Terreno\nO terreno está:\n- Limpo\n- Com vegetação\n- Já preparado'
  },
  {
    key: 'images',
    text: '📸 7. ENVIO DE IMAGENS (OBRIGATÓRIO)\n\nAgora precisarei que você envie de 1 a 4 fotos do seu solo 📸:\n(Vista geral, solo de perto/textura, outro ângulo ou área com vegetação).\n\n⚠️ Anexe as imagens aqui e me envie para continuarmos.'
  },
  {
    key: 'water',
    text: '💧 8. Acesso à Água\nTem acesso à água?\n(rio, chuva, furo, nenhum)'
  },
  {
    key: 'investment',
    text: '💰 9. Capacidade de Investimento\nPretende investir:\n- Baixo custo\n- Médio\n- Alto (produção intensiva)'
  },
  {
    key: 'goal',
    text: '🧑🏾‍🌾 10. Objetivo da Produção\nProdução para:\n- Consumo próprio\n- Venda local\n- Produção comercial em grande escala'
  }
];

type CropPlan = {
  id: string;
  timestamp: string;
  crop: string;
  report: string;
  data: Record<string, string>;
};

// Helper functions outside component to satisfy purity rules
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Define glossary of technical terms for tooltips
const AGRO_GLOSSARY: Record<string, string> = {
  'NDVI': 'Índice de Vegetação por Diferença Normalizada. Mede a densidade e saúde da vegetação através de sensores (satélite ou drone).',
  'EPI': 'Equipamento de Proteção Individual. Inclui botas, luvas, máscaras e viseiras para proteger o agricultor agrícola.',
  'PH': 'Potencial de Hidrogênio. Escala que mede a acidez ou alcalinidade do solo (ideal entre 5.5 e 6.5 para a maioria das culturas).',
  'CALAGEM': 'Aplicação de calcário para corrigir a acidez (neutralizar o Alumínio tóxico) e fornecer Cálcio e Magnésio ao solo.',
  'NPK': 'Adubo mineral composto por Nitrogênio (N), Fósforo (P) e Potássio (K), os três nutrientes principais para as plantas.',
  'LIXIVIAÇÃO': 'Processo onde os nutrientes são "lavados" para camadas profundas do solo pela água da chuva ou irrigação em excesso.',
  'ADUBAÇÃO': 'Ato de fornecer nutrientes ao solo ou diretamente às plantas para garantir um bom crescimento e produção.',
  'SAFRA': 'O período de colheita principal de uma determinada cultura agrícola.',
  'ENTRESSAFRA': 'Período entre o fim de uma colheita e o início de um novo plantio, muitas vezes usado para rotação de culturas.',
  'HUMUS': 'Matéria orgânica decomposta que melhora a estrutura, a retenção de água e a fertilidade do solo.',
  'DEFENSIVOS': 'Também chamados de pesticidas ou agrotóxicos; produtos usados para prevenir ou combater pragas e doenças.',
  'PULVERIZAÇÃO': 'Método de aplicação de defensivos ou fertilizantes líquidos em forma de névoa ou gotas finas.',
  'FENOLOGIA': 'Estudo das fases de crescimento das plantas (germinação, floração, maturação) de acordo com o clima.',
  'FOTOSSÍNTESE': 'Processo químico das plantas que usa luz solar, CO2 e água para produzir açúcar e oxigênio.',
  'MATÉRIA ORGÂNICA': 'Restos de plantas e animais no solo que servem como "comida" para a terra e plantas.',
  'COMPACTAÇÃO': 'Quando o solo fica muito "duro" ou apertado, dificultando a entrada de ar, água e o crescimento das raízes.',
  'ROTAÇÃO DE CULTURAS': 'Técnica de alternar diferentes plantas na mesma área para evitar o esgotamento do solo e pragas.',
  'ADUBAÇÃO DE COBERTURA': 'Aplicação de nutrientes quando a planta já está em crescimento, geralmente com Nitrogênio.',
};

const TermTooltip = ({ term, description }: { term: string; description: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <span className="relative inline-block group">
      <span 
        className="underline decoration-dotted decoration-[#38bdf8]/60 cursor-help font-bold text-[#38bdf8] hover:text-sky-300 transition-colors"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        {term}
      </span>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 p-4 bg-[#0a0f1e] border border-white/20 rounded-2xl shadow-2xl z-[100] pointer-events-none"
          >
            <p className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
              {term}
            </p>
            <p className="text-[12px] text-white/80 leading-relaxed font-medium">
              {description}
            </p>
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#0a0f1e]" />
          </motion.div>
        )}
      </AnimatePresence>
    </span>
  );
};

function renderWithTooltips(node: any): React.ReactNode {
  if (typeof node !== 'string') {
    if (Array.isArray(node)) {
      return node.map((child, i) => <React.Fragment key={i}>{renderWithTooltips(child)}</React.Fragment>);
    }
    if (node && typeof node === 'object' && 'props' in node && node.props.children) {
      return React.cloneElement(node, {
        ...node.props,
        children: renderWithTooltips(node.props.children)
      });
    }
    return node;
  }

  // Define alphabetical list of terms to avoid partial matches on shorter terms first
  const terms = Object.keys(AGRO_GLOSSARY).sort((a, b) => b.length - a.length);
  const regex = new RegExp(`\\b(${terms.join('|')})\\b`, 'gi');
  
  const parts = node.split(regex);
  if (parts.length === 1) return node;

  return parts.map((part, i) => {
    const upperPart = part.toUpperCase();
    if (AGRO_GLOSSARY[upperPart]) {
      return <TermTooltip key={i} term={part} description={AGRO_GLOSSARY[upperPart]} />;
    }
    return part;
  });
}

// Custom components for ReactMarkdown to use our tooltip renderer
const markdownComponents = {
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{renderWithTooltips(children)}</p>,
  li: ({ children }: any) => <li className="mb-1">{renderWithTooltips(children)}</li>,
  strong: ({ children }: any) => <strong className="text-[#38bdf8] font-bold">{renderWithTooltips(children)}</strong>,
  em: ({ children }: any) => <em className="italic">{renderWithTooltips(children)}</em>,
};

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [wizardState, setWizardState] = useState({ active: false, step: 0, data: {} as Record<string, string> });
  const [crops, setCrops] = useState<Crop[]>([]);
  const [savedPlans, setSavedPlans] = useState<CropPlan[]>([]);
  
  const [showAddCrop, setShowAddCrop] = useState(false);
  const [editingCrop, setEditingCrop] = useState<Crop | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newCrop, setNewCrop] = useState({ name: '', plantedAt: '', location: '' });
  const [editingAlertId, setEditingAlertId] = useState<string | null>(null);
  const [weatherData, setWeatherData] = useState<WeatherData>({ temp: null, humidity: null, rainProb: null, rainTime: null });

  // Hardcoded for demo/tutorial - in real app would use auth.getUser()
  const USER_ID = '00000000-0000-0000-0000-000000000000';

  // Hydration from Supabase (with localStorage fallback)
  useEffect(() => {
    async function hydrate() {
      if (typeof window === 'undefined') return;

      // Try Supabase first
      try {
        const { data: cropsData } = await supabase.from('crops').select('*').eq('user_id', USER_ID);
        if (cropsData && cropsData.length > 0) {
          setCrops(cropsData.map((c: any) => ({
            id: c.id,
            name: c.name,
            plantedAt: c.planted_at,
            location: c.location,
            soilAlerts: {
              moisture: c.moisture_alert,
              moistureThreshold: c.moisture_threshold,
              nutrients: c.nutrients_alert
            }
          })));
        } else {
          // Fallback to local
          const savedCrops = localStorage.getItem('agrongola_crops');
          if (savedCrops) setCrops(JSON.parse(savedCrops));
        }

        const { data: msgsData } = await supabase.from('messages').select('*').eq('user_id', USER_ID).order('created_at', { ascending: true });
        if (msgsData && msgsData.length > 0) {
          setMessages(msgsData.map((m: any) => ({ role: m.role as 'user' | 'model', parts: m.parts })));
        } else {
          const savedMessages = localStorage.getItem('agrongola_messages');
          if (savedMessages) setMessages(JSON.parse(savedMessages));
          else setMessages([{ role: 'model', parts: [{ text: 'Olá! Sou o **AGRONGOLA**, seu agrônomo virtual. Como posso ajudar com sua plantação ou criação hoje?' }] }]);
        }

        const { data: plansData } = await supabase.from('crop_plans').select('*').eq('user_id', USER_ID).order('created_at', { ascending: false });
        if (plansData && plansData.length > 0) {
          setSavedPlans(plansData.map((p: any) => ({
            id: p.id,
            timestamp: p.timestamp,
            crop: p.crop,
            report: p.report,
            data: p.data
          })));
        } else {
          const savedP = localStorage.getItem('agrongola_plans');
          if (savedP) setSavedPlans(JSON.parse(savedP));
        }
      } catch (err) {
        console.error("Supabase hydration error:", err);
      } finally {
        setIsHydrated(true);
      }
    }
    hydrate();
  }, []);

  const deleteMessage = (index: number) => {
    const messageToDelete = messages[index];
    const newMessages = messages.filter((_, i) => i !== index);
    setMessages(newMessages);
    
    // Attempt to delete from Supabase if we can identify it (usually by content/timestamp or just clearing and re-inserting)
    // For simplicity with this current schema, we'll just clear and re-insert or use a more specific query if we had IDs
    // Since our messages don't have IDs in the state yet, we'll just update the local state.
    // In a production app, messages would have UUIDs.
  };

  // Sync to Supabase
  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('agrongola_crops', JSON.stringify(crops));
  }, [crops, isHydrated]);

  const globeMarkers = useMemo(() => {
    // Sync crops to globe markers
    const markers = crops.map(c => {
      // Deterministic "randomness" based on ID to satisfy purity rules
      const seed = c.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const latOffset = (seed % 100) / 50; // -1 to 1
      const lngOffset = ((seed * 1.5) % 100) / 50; // -1 to 1
      
      return {
        location: [
          // Default to Angola region if no coords
          c.id.length % 2 === 0 ? -12.77 + latOffset : -9.54 + latOffset,
          c.id.length % 2 === 0 ? 15.73 + lngOffset : 13.40 + lngOffset
        ] as [number, number],
        size: 0.1,
      };
    });
    
    // Add some default markers for Angola's main hubs
    markers.push({ location: [-8.8383, 13.2344], size: 0.15 }); // Luanda
    markers.push({ location: [-12.5763, 13.4055], size: 0.1 });    // Benguela
    markers.push({ location: [-12.7761, 15.7392], size: 0.1 });    // Huambo
    
    return markers;
  }, [crops]);

  const updateCropAlerts = (cropId: string, alerts: Crop['soilAlerts']) => {
    const newCrops = crops.map(c => c.id === cropId ? { ...c, soilAlerts: alerts } : c);
    setCrops(newCrops);
    
    // Sync to Supabase
    supabase.from('crops').update({
      moisture_alert: alerts.moisture,
      moisture_threshold: alerts.moistureThreshold,
      nutrients_alert: alerts.nutrients
    }).eq('id', cropId).then();
  };

  useEffect(() => {
    if (!isHydrated) return;
    if (savedPlans.length > 0) {
      localStorage.setItem('agrongola_plans', JSON.stringify(savedPlans));
    }
  }, [savedPlans, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    if (messages.length > 1) {
      localStorage.setItem('agrongola_messages', JSON.stringify(messages));
    }
  }, [messages, isHydrated]);

  // Helper to calculate estimated crop stage
  const getCropStage = (plantedAt: string, name: string) => {
    const plantedDate = new Date(plantedAt);
    const today = new Date();
    // Default to today if invalid date
    if (isNaN(plantedDate.getTime())) return { stage: 'Desconhecido', progress: 0 };
    
    const diffTime = today.getTime() - plantedDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (name.toLowerCase().includes('milho')) {
      if (diffDays < 15) return { stage: 'Germinação', progress: 10 };
      if (diffDays < 60) return { stage: 'Crescimento Vegetativo', progress: 40 };
      if (diffDays < 90) return { stage: 'Floração', progress: 70 };
      if (diffDays < 120) return { stage: 'Enchimento de Grãos', progress: 90 };
      return { stage: 'Colheita', progress: 100 };
    }
    
    if (diffDays < 30) return { stage: 'Fase Inicial', progress: 20 };
    if (diffDays < 90) return { stage: 'Desenvolvimento', progress: 50 };
    return { stage: 'Colheita', progress: 100 };
  };

  // Helper for dynamic suggestions based on context
  const getDynamicSuggestions = () => {
    // Basic defaults if no chat history
    let defaultSuggestions = [
      { icon: '🐛', text: 'Ajuda com praga / doença' },
      { icon: '📸', text: 'Analisar foto do meu solo' },
      { icon: '💰', text: 'Calcular lucro da lavoura' },
      { icon: '📅', text: 'Criar calendário de cultivo' },
      { icon: '🧾', text: 'Resumo / Relatório' }
    ];

    if (crops.length > 0 && messages.length === 1) {
       // Se acabamos de começar, mencione a cultura
       const cropNames = crops.map(c => c.name).join(' e ');
       return [
         { icon: '🌱', text: `Como melhorar a adubação do ${cropNames}?` },
         { icon: '🐛', text: `Quais as pragas comuns do ${cropNames}?` },
         { icon: '💧', text: 'Dicas de irrigação para hoje' },
         { icon: '🧾', text: 'Resumo / Relatório' }
       ];
    }
    
    if (messages.length > 1) {
       // Look at the last messages to derive context
       const lastMessage = messages[messages.length - 1];
       const text = lastMessage.parts.map(p => 'text' in p ? p.text : '').join(' ').toLowerCase();

       if (text.includes('praga') || text.includes('doença') || text.includes('inseto') || text.includes('lagarta') || text.includes('pulgão') || text.includes('bicho') || text.includes('fungo')) {
         return [
           { icon: '🔍', text: 'Como identificar a praga?' },
           { icon: '🌿', text: 'Recomande um tratamento natural' },
           { icon: '🛡️', text: 'Qual EPI usar no controle químico?' }
         ];
       }

       if (text.includes('adubo') || text.includes('fertilizante') || text.includes('crescimento') || text.includes('solo') || text.includes('terra')) {
         return [
           { icon: '📸', text: 'Pode analisar uma foto do meu solo?' },
           { icon: '🧪', text: 'Como testar o solo de forma caseira?' },
           { icon: '💩', text: 'Tem receita de biofertilizante?' },
           { icon: '🌱', text: 'Sinais de falta de nutrientes' }
         ];
       }
       
       if (text.includes('colheita') || text.includes('armazenamento') || text.includes('vender') || text.includes('lucro')) {
         return [
           { icon: '💰', text: 'Como calcular meu lucro?' },
           { icon: '🌽', text: 'Dicas de armazenamento sem perdas' },
           { icon: '📅', text: 'Como planejar a próxima safra?' }
         ];
       }
       
       // Fallback for ongoing conversation
       return [
         { icon: '❓', text: 'Pode me dar mais detalhes?' },
         { icon: '📝', text: 'Pode dar o passo a passo?' },
         { icon: '🧾', text: 'Pode fazer um resumo?' }
       ];
    }

    return defaultSuggestions;
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-12.5763&longitude=13.4055&current=temperature_2m,relative_humidity_2m&hourly=precipitation_probability&timezone=auto&forecast_days=1');
        const data = await res.json();
        
        const temp = data.current?.temperature_2m ?? null;
        const humidity = data.current?.relative_humidity_2m ?? null;
        
        let rainProb = null;
        let rTime = null;
        
        if (data.hourly?.precipitation_probability) {
          const currentHour = new Date().getHours();
          const futureProbs = data.hourly.precipitation_probability.slice(currentHour, currentHour + 12);
          if (futureProbs.length > 0) {
              const maxProb = Math.max(...futureProbs);
              if (maxProb > 0) {
                rainProb = maxProb;
                const maxIndex = futureProbs.indexOf(maxProb);
                const hour = (currentHour + maxIndex) % 24;
                rTime = `${hour}h`;
              }
          }
        }
        
        setWeatherData({ temp, humidity, rainProb, rainTime: rTime });
      } catch (err) {
        console.error('Error fetching weather:', err);
      }
    }
    fetchWeather();
  }, []);

  const [viewMode, setViewMode] = useState<'chat' | 'map' | 'planning' | 'globe' | 'dashboard'>('chat');
  const [selectedCropDetail, setSelectedCropDetail] = useState<Crop | null>(null);
  const [farmLocation, setFarmLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedPlanDetail, setSelectedPlanDetail] = useState<CropPlan | null>(null);
  
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const AVAILABLE_SYMPTOMS = ['Manchas', 'Furos nas folhas', 'Insetos visíveis', 'Murchando', 'Podridão', 'Amarelamento', 'Teias/Pó'];

  const toggleSymptom = (sym: string) => {
    setSelectedSymptoms(prev => prev.includes(sym) ? prev.filter(s => s !== sym) : [...prev, sym]);
  };
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingDuration(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    // Simulate transcription
    if (recordingDuration > 1) {
       setInput(prev => prev + (prev ? " " : "") + "[Áudio transcrito]: Tenho notado umas manchas amarelas no meu milho, o que pode ser?");
    }
    setRecordingDuration(0);
  };
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).slice(0, 4 - selectedImages.length).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    if (selectedImages.length === 1 && fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearImages = () => {
    setSelectedImages([]);
    setSelectedSymptoms([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && selectedImages.length === 0) || isLoading) return;

    let textPrompt = input.trim();
    if (selectedImages.length > 0 && selectedSymptoms.length > 0) {
      textPrompt += (textPrompt ? '\n\n' : '') + `Sintomas adicionais observados: ${selectedSymptoms.join(', ')}.`;
    }

    const userParts: ContentPart[] = [];
    
    // Process images if selected
    selectedImages.forEach(img => {
      const base64Data = img.split(',')[1];
      const mimeType = img.split(';')[0].split(':')[1];
      userParts.push({ inlineData: { data: base64Data, mimeType } });
    });
    
    // Process text
    if (textPrompt) {
      userParts.push({ text: textPrompt });
    }

    const newUserMessage: Message = {
      role: 'user',
      parts: userParts,
    };

    // Sync to Supabase
    supabase.from('messages').insert({
      user_id: USER_ID,
      role: 'user',
      parts: userParts
    }).then();

    setMessages((prev) => [...prev, newUserMessage]);
    setInput('');
    clearImages();
    
    // --- WIZARD INTERCEPTION LOGIC ---
    if (wizardState.active) {
      const stepDataValue = textPrompt + (selectedImages.length > 0 ? (textPrompt ? ` [${selectedImages.length} Imagens anexadas]` : `[${selectedImages.length} Imagens anexadas]`) : '');
      const newWizardData = { ...wizardState.data, [WIZARD_QUESTIONS[wizardState.step].key]: stepDataValue };
      const nextStep = wizardState.step + 1;
      
      if (nextStep < WIZARD_QUESTIONS.length) {
         setWizardState({ active: true, step: nextStep, data: newWizardData });
         setIsLoading(true);
         setTimeout(() => {
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: WIZARD_QUESTIONS[nextStep].text }] }]);
            setIsLoading(false);
         }, 800);
      } else {
         setWizardState({ active: false, step: 0, data: {} });
         setIsLoading(true);
         
         const finalPrompt = `O agricultor concluiu a coleta de dados de forma guiada para o seu **PLANEJAMENTO DE SAFRA**. Por favor, gere o RELATÓRIO AGRONÓMICO rigoroso baseado nestes dados que ele forneceu:\n
1. Localização: ${newWizardData.location}
2. Cultura: ${newWizardData.crop}
3. Área: ${newWizardData.area}
4. Clima: ${newWizardData.weather}
5. Histórico: ${newWizardData.history}
6. Terreno: ${newWizardData.terrainState}
7. Imagens/Visual do Solo: ${newWizardData.images}
8. Água: ${newWizardData.water}
9. Investimento: ${newWizardData.investment}
10. Objetivo: ${newWizardData.goal}

Lembre-se de seguir a estrutura 📄 RELATÓRIO AGRONGOLA 🌱 especificada nas suas instruções.
IMPORTANTE: Inclua uma seção detalhada de **ESTRATÉGIA DE ROTAÇÃO DE CULTURAS** (ex: o que plantar depois do ${newWizardData.crop} para recuperar o solo).`;

         try {
           const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : undefined);
           if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === 'MY_GEMINI_API_KEY') {
             throw new Error('API Key não configurada. Se estiver no Vercel, adicione NEXT_PUBLIC_GEMINI_API_KEY às variáveis de ambiente.');
           }
           
           const ai = new GoogleGenAI({ apiKey });
           const chatHistory = [...messages, newUserMessage].map(m => ({
             role: m.role,
             parts: m.parts
           }));
           chatHistory.push({ role: 'user', parts: [{ text: finalPrompt }] });
           
           const response = await ai.models.generateContent({
             model: 'gemini-3-flash-preview',
             contents: [
               { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
               { role: 'model', parts: [{ text: 'Entendido. Estou pronto para ajudar.' }] },
               ...chatHistory
             ],
           });

           if (response.text) {
             const reportText = response.text || '';
             const modelMsg: Message = { role: 'model', parts: [{ text: reportText }] };
             setMessages((prev) => [...prev, modelMsg]);
             
             // Sync to Supabase
             supabase.from('messages').insert({
               user_id: USER_ID,
               role: 'model',
               parts: modelMsg.parts
             }).then();
             
             const newPlan: CropPlan = {
               id: generateId(),
               timestamp: new Date().toLocaleDateString('pt-AO'),
               crop: newWizardData.crop || 'Plano de Safra',
               report: reportText,
               data: newWizardData
             };
             setSavedPlans(prev => [newPlan, ...prev]);

             // Sync to Supabase
             supabase.from('crop_plans').insert({
                id: newPlan.id,
                user_id: USER_ID,
                crop: newPlan.crop,
                report: newPlan.report,
                data: newPlan.data,
                timestamp: newPlan.timestamp
             }).then();
           }
         } catch (error: any) {
           console.error("Error generating report:", error);
           let msg = '⚠️ Erro ao gerar relatório. Verifique sua conexão ou limite de uso.';
           if (error?.message && error.message.includes('API Key')) {
             msg = `⚠️ **Erro de Configuração:** ${error.message}`;
           }
           setMessages((prev) => [...prev, { role: 'model', parts: [{ text: msg }] }]);
         } finally {
           setIsLoading(false);
         }
      }
      return;
    }
    // ---------------------------------

    setIsLoading(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).GEMINI_API_KEY : undefined);
      if (!apiKey || apiKey === 'your-gemini-api-key' || apiKey === 'MY_GEMINI_API_KEY') {
        throw new Error('API Key não configurada. Se estiver no Vercel, adicione NEXT_PUBLIC_GEMINI_API_KEY às variáveis de ambiente.');
      }

      const ai = new GoogleGenAI({ apiKey });

      // Build context
      let contextualInfo = '';
      if (crops.length > 0) {
        contextualInfo += `\n\n**Culturas Cadastradas pelo Agricultor:**\n${crops.map(c => `- ${c.name} (${c.location}), plantado em ${c.plantedAt}`).join('\n')}`;
      }

      contextualInfo += `\n\n**Clima Local Atual:**
- Temperatura: ${weatherData.temp !== null ? `${Math.round(weatherData.temp)}°C` : 'Desconhecida'}
- Umidade: ${weatherData.humidity !== null ? `${Math.round(weatherData.humidity)}%` : 'Desconhecida'}
- Probabilidade de Chuva: ${weatherData.rainProb !== null ? `${weatherData.rainProb}%` : 'Desconhecida'}`;

      const dynamicSystemInstruction = SYSTEM_INSTRUCTION + contextualInfo;

      let historyContents = [...messages, newUserMessage].map(msg => ({
        role: msg.role,
        parts: msg.parts,
      }));

      // Function tools configuration
      const tools = [{
        functionDeclarations: [
          {
            name: 'searchPestDisease',
            description: 'Busca na biblioteca interna de pragas e doenças usando um sintoma ou nome.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: {
                  type: Type.STRING,
                  description: 'Sintoma, nome da praga ou doença para buscar',
                },
              },
              required: ['query'],
            },
          },
        ],
      }];

      setMessages((prev) => [
        ...prev,
        { role: 'model', parts: [{ text: '' }] }
      ]);

      const generateResponse = async (contents: any[]) => {
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: contents,
          config: {
            systemInstruction: dynamicSystemInstruction,
            tools: tools,
          }
        });

        const call = response.functionCalls?.[0];
        if (call) {
          if (call.name === 'searchPestDisease') {
            const args = call.args as { query: string };
            const results = searchPestDisease(args.query);
            
            contents.push({ role: 'model', parts: [{ functionCall: { name: call.name, args: call.args } }] });
            contents.push({ role: 'user', parts: [{ functionResponse: { name: call.name, response: { results: results.length > 0 ? results : { message: 'Nenhum resultado encontrado.' } } } }] });
            
            return generateResponse(contents);
          }
        } else if (response.text) {
          const modelResponseText = response.text || '';
          
          // Sync to Supabase
          supabase.from('messages').insert({
            user_id: USER_ID,
            role: 'model',
            parts: [{ text: modelResponseText }]
          }).then();

          setMessages((prev) => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = {
              role: 'model',
              parts: [{ text: modelResponseText }]
            };
            return newMessages;
          });
        }
      };

      await generateResponse(historyContents);

    } catch (error: any) {
      console.error("Error generating response:", error);
      
      let errorMessage = '⚠️ *Desculpe, ocorreu um erro ao analisar sua mensagem. Por favor, tente novamente.*';
      
      // Use specific error message if it's one of ours
      if (error?.message && error.message.includes('API Key')) {
        errorMessage = `⚠️ **Erro de Configuração:** ${error.message}`;
      } else {
        const errorString = typeof error === 'string' ? error : JSON.stringify(error) + (error?.message || '');
        if (errorString.includes('429') || errorString.includes('quota') || errorString.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = '⚠️ *O limite de uso (quota) da inteligência artificial foi atingido. Por favor, aguarde um pouco antes de tentar novamente, ou verifique sua configuração de API.*';
        }
      }

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage && lastMessage.role === 'model' && lastMessage.parts[0] && 'text' in lastMessage.parts[0] && lastMessage.parts[0].text === '') {
          newMessages[newMessages.length - 1] = {
             role: 'model',
             parts: [{ text: errorMessage }]
          };
          return newMessages;
        }
        
        return [
          ...prev,
          { role: 'model', parts: [{ text: errorMessage }] }
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCrop = () => {
    if (newCrop.name && newCrop.location && newCrop.plantedAt) {
      if (editingCrop) {
        // Update existing crop
        const updatedCrops = crops.map(c => c.id === editingCrop.id ? { ...editingCrop, ...newCrop } : c);
        setCrops(updatedCrops);

        // Sync to Supabase
        supabase.from('crops').update({
          name: newCrop.name,
          planted_at: newCrop.plantedAt,
          location: newCrop.location
        }).eq('id', editingCrop.id).then();

        setEditingCrop(null);
      } else {
        // Create new crop
        const planId = generateId();
        const planData = { 
          ...newCrop, 
          id: planId,
          soilAlerts: { moisture: false, moistureThreshold: 30, nutrients: false }
        };
        setCrops([...crops, planData]);
        
        // Sync to Supabase
        supabase.from('crops').insert({
          id: planId,
          user_id: USER_ID,
          name: newCrop.name,
          planted_at: newCrop.plantedAt,
          location: newCrop.location,
          moisture_alert: false,
          moisture_threshold: 30,
          nutrients_alert: false
        }).then();
      }

      setNewCrop({ name: '', plantedAt: '', location: '' });
      setShowAddCrop(false);
    }
  };

  const handleDeleteCrop = (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta plantação?')) {
      const updatedCrops = crops.filter(c => c.id !== id);
      setCrops(updatedCrops);
      
      // Sync to Supabase
      supabase.from('crops').delete().eq('id', id).then();
    }
  };

  const handleDeletePlan = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este planejamento de safra?')) {
      const updatedPlans = savedPlans.filter(p => p.id !== id);
      setSavedPlans(updatedPlans);
      
      // Sync to Supabase
      supabase.from('crop_plans').delete().eq('id', id).then();
      
      if (selectedPlanDetail?.id === id) {
        setSelectedPlanDetail(null);
      }
    }
  };

  return (
    <div className="w-full h-screen bg-[#0a0f1e] overflow-hidden flex font-sans relative text-white">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Global Background Elements */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none" 
        style={{ background: 'radial-gradient(circle at 20% 20%, #1e3a5f 0%, transparent 50%), radial-gradient(circle at 80% 80%, #0a192f 0%, transparent 60%), radial-gradient(circle at 50% 50%, #2d4a7c 0%, transparent 70%)' }}>
      </div>

      {/* Left Sidebar - Culturas */}
      <aside className={cn(
        "fixed inset-y-0 left-0 bg-[#0a0f1e]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col z-[70] transition-all duration-300 lg:static lg:w-80 p-6 overflow-y-auto shrink-0",
        isSidebarOpen ? "w-80 translate-x-0 shadow-2xl shadow-black/50" : "w-80 -translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#38bdf8] rounded-xl flex items-center justify-center shadow-lg">
              <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white rounded-sm rotate-45 flex items-center justify-center overflow-hidden">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white"></div>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase">AGRONGOLA</h1>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 lg:hidden text-white/50 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Clima Widget */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase font-bold text-white/50 tracking-wider">Clima Local</p>
            {weatherData.temp !== null ? (
              <span className="flex items-center gap-1 text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Ao vivo
              </span>
            ) : (
              <span className="text-[10px] text-white/30">Carregando...</span>
            )}
          </div>
          <div className="flex items-end gap-3 mb-4">
            <span className="text-4xl font-light text-white tracking-tighter">
              {weatherData.temp !== null ? Math.round(weatherData.temp) : '--'}°
            </span>
            <div className="pb-1">
              <p className="text-sm font-medium text-white/90">Angola</p>
              <p className="text-xs text-white/50">Hoje</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-white/5">
            <div className="bg-black/20 rounded-xl p-2.5 flex items-center gap-2">
              <Droplet className="w-4 h-4 text-blue-400" />
              <div>
                <p className="text-[9px] text-white/40 uppercase">Umidade</p>
                <p className="text-xs font-medium">{weatherData.humidity !== null ? `${Math.round(weatherData.humidity)}%` : '--'}</p>
              </div>
            </div>
            <div className="bg-black/20 rounded-xl p-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              <div>
                <p className="text-[9px] text-white/40 uppercase">Chuva prob.</p>
                <p className="text-xs font-medium">{weatherData.rainProb !== null ? `${weatherData.rainProb}%` : '--'}</p>
              </div>
            </div>
          </div>
          {weatherData.rainTime && (
             <div className="mt-2 text-[10px] text-center text-blue-300 bg-blue-500/10 rounded-lg py-1.5">
               🌧️ Previsão de chuva: ~{weatherData.rainTime}
             </div>
          )}
        </div>

        <div className="space-y-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-0">Culturas Cadastradas</p>
            <button 
              onClick={() => setShowAddCrop(!showAddCrop)}
              className="p-1 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-white/70" />
            </button>
          </div>

          {showAddCrop && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 space-y-3 mb-4">
              <input 
                placeholder="Nome (ex: Milho)"
                value={newCrop.name}
                onChange={e => setNewCrop({...newCrop, name: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
              />
               <input 
                type="date"
                value={newCrop.plantedAt}
                onChange={e => setNewCrop({...newCrop, plantedAt: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <input 
                placeholder="Localização (ex: Lote 2)"
                value={newCrop.location}
                onChange={e => setNewCrop({...newCrop, location: e.target.value})}
                className="w-full bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white placeholder-white/40 focus:outline-none"
              />
              <button 
                onClick={handleAddCrop}
                className="w-full bg-[#38bdf8] text-black text-xs font-bold py-1.5 rounded-lg hover:bg-sky-400 transition-colors"
              >
                Adicionar Cultura
              </button>
            </div>
          )}

          <div className="space-y-3">
            {crops.map(crop => {
              const stageInfo = getCropStage(crop.plantedAt, crop.name);
              return (
                  <div 
                    key={crop.id} 
                    onClick={() => setSelectedCropDetail(crop)}
                    className="p-3 bg-white/10 rounded-xl border border-white/10 cursor-pointer hover:bg-white/20 transition-all flex flex-col gap-2 relative group-item"
                  >
                  <div>
                    <div className="flex justify-between items-start">
                      <p className="text-sm font-medium">{crop.name}</p>
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCrop(crop);
                            setNewCrop({ name: crop.name, plantedAt: crop.plantedAt, location: crop.location });
                            setShowAddCrop(true);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-[#38bdf8] transition-colors border border-transparent"
                          title="Editar"
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCrop(crop.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-red-400 transition-colors border border-transparent"
                          title="Excluir"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => setEditingAlertId(editingAlertId === crop.id ? null : crop.id)}
                          className={cn("p-1.5 rounded-lg transition-colors border ml-1", editingAlertId === crop.id ? "bg-amber-500/20 text-amber-400 border-amber-500/50" : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white border-transparent")}
                          title="Alertas de Solo por Satélite"
                        >
                          {crop.soilAlerts.moisture || crop.soilAlerts.nutrients ? <BellRing className="w-3.5 h-3.5 text-amber-400" /> : <Bell className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>{crop.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-white/60 mt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{crop.plantedAt}</span>
                    </div>
                  </div>
                  
                  {/* Phase visualization */}
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 mt-1">
                    <div className="flex justify-between items-end mb-2">
                       <div>
                         <p className="text-[9px] uppercase font-bold text-white/40 tracking-wider mb-0.5">ESTÁGIO ATUAL</p>
                         <p className="text-xs text-[#38bdf8] font-medium">{stageInfo.stage}</p>
                       </div>
                       <div className="text-right">
                         <p className="text-[10px] text-white/50">{stageInfo.progress}% concluído</p>
                       </div>
                    </div>
                    {/* Dynamic progressive bar */}
                    <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                       <div 
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-[#38bdf8] transition-all duration-1000 rounded-full" 
                          style={{ width: `${Math.min(Math.max(stageInfo.progress, 2), 100)}%` }} 
                       />
                       {/* Subtle markers for stages */}
                       <div className="absolute top-0 left-1/4 w-px h-full bg-white/20"></div>
                       <div className="absolute top-0 left-2/4 w-px h-full bg-white/20"></div>
                       <div className="absolute top-0 left-3/4 w-px h-full bg-white/20"></div>
                    </div>
                    <div className="flex justify-between mt-1.5 px-0.5">
                       <span className="text-[8px] text-white/40 font-medium">Plantio</span>
                       <span className="text-[8px] text-white/40 font-medium">Colheita</span>
                    </div>
                  </div>

                  {editingAlertId === crop.id && (
                    <div className="mt-2 pt-3 border-t border-white/10 space-y-3">
                      <p className="text-[10px] uppercase font-bold text-white/50 mb-2 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Monitoramento Satélite</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-4 h-4 text-blue-400" />
                          <span className="text-xs">Baixa Umidade</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={crop.soilAlerts.moisture} onChange={(e) => {
                            updateCropAlerts(crop.id, { ...crop.soilAlerts, moisture: e.target.checked });
                          }} />
                          <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>

                      {crop.soilAlerts.moisture && (
                        <div className="pl-6 flex items-center justify-between gap-2">
                           <span className="text-[10px] text-white/50">Limiar:</span>
                           <div className="flex items-center gap-1">
                             <input 
                               type="number" 
                               value={crop.soilAlerts.moistureThreshold}
                               onChange={(e) => {
                                 const val = parseInt(e.target.value) || 0;
                                 updateCropAlerts(crop.id, { ...crop.soilAlerts, moistureThreshold: val });
                               }}
                               className="w-12 bg-white/10 border border-white/20 rounded-md px-1 py-0.5 text-xs text-center focus:outline-none"
                             />
                             <span className="text-xs text-white/60">%</span>
                           </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-xs">Níveis de Nutrientes</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={crop.soilAlerts.nutrients} onChange={(e) => {
                            updateCropAlerts(crop.id, { ...crop.soilAlerts, nutrients: e.target.checked });
                          }} />
                          <div className="w-8 h-4 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-500"></div>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
          <button 
            onClick={() => {
              if (!isLoading && !wizardState.active) {
                setWizardState({ active: true, step: 0, data: {} });
                
                // Show the first question
                setMessages(prev => [
                  ...prev, 
                  { 
                    role: 'model', 
                    parts: [{ text: "Vou fazer algumas perguntas rápidas para gerar um Relatório Agronômico completo.\n\n" + WIZARD_QUESTIONS[0].text }] 
                  }
                ]);
              } else if (wizardState.active) {
                 // Cancel wizard
                 setWizardState({ active: false, step: 0, data: {} });
                 setMessages(prev => [...prev, { role: 'model', parts: [{ text: 'Coleta de dados cancelada.' }] }]);
              }
            }}
            className="w-full bg-[#38bdf8]/20 border border-[#38bdf8]/50 hover:bg-[#38bdf8]/30 text-white text-xs font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Calendar className="w-4 h-4 text-[#38bdf8]" />
            <span>{wizardState.active ? "Cancelar Coleta" : "Iniciar Relatório Guiado"}</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-xs text-white/60">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              Agrônomo Virtual Online
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 h-full w-full max-w-4xl mx-auto flex flex-col z-10 sm:p-6 lg:p-8 lg:gap-6">
        <div className="flex-1 bg-white/10 backdrop-blur-md sm:rounded-3xl border-x sm:border border-white/20 shadow-2xl flex flex-col overflow-hidden">
      
      {/* Header */}
      <header className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 lg:hidden text-white/70 hover:text-white -ml-2"
          >
            <Map className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 bg-[#38bdf8] rounded-xl flex items-center justify-center shadow-lg hidden sm:flex">
            <Leaf className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white font-serif tracking-tight">AGRONGOLA <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded ml-1 font-sans">3.0</span></h1>
            <p className="text-[10px] text-blue-400 uppercase font-bold tracking-wider">Assistente Agronómico Digital</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              if (confirm('Tem certeza que deseja apagar todo o histórico de conversas?')) {
                const initialMsg = [
                  {
                    role: 'model' as const,
                    parts: [{ text: 'Olá! Sou o **AGRONGOLA**, seu agrônomo virtual. Como posso ajudar com sua plantação ou criação hoje?' }]
                  }
                ];
                setMessages(initialMsg);
                localStorage.setItem('agrongola_messages', JSON.stringify(initialMsg));
                // Sync to Supabase
                supabase.from('messages').delete().eq('user_id', USER_ID).then();
              }
            }}
            className="p-2 text-white/40 hover:text-red-400 transition-colors"
            title="Limpar Conversa"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex border border-white/20 rounded-xl overflow-hidden bg-white/5 p-1">
            <button 
              onClick={() => setViewMode('chat')}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2", viewMode === 'chat' ? 'bg-[#38bdf8] text-black shadow-md' : 'text-white/70 hover:text-white')}
            >
              Chat
            </button>
            <button 
              onClick={() => setViewMode('dashboard')}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2", viewMode === 'dashboard' ? 'bg-[#38bdf8] text-black shadow-md' : 'text-white/70 hover:text-white')}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Painel
            </button>
            <button 
              onClick={() => setViewMode('planning')}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2", viewMode === 'planning' ? 'bg-[#38bdf8] text-black shadow-md' : 'text-white/70 hover:text-white')}
            >
              <Calendar className="w-3.5 h-3.5" />
              Safra
            </button>
            <button 
              onClick={() => setViewMode('map')}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2", viewMode === 'map' ? 'bg-[#38bdf8] text-black shadow-md' : 'text-white/70 hover:text-white')}
            >
              <Map className="w-3.5 h-3.5" />
              Mapa
            </button>
            <button 
              onClick={() => setViewMode('globe')}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2", viewMode === 'globe' ? 'bg-[#38bdf8] text-black shadow-md' : 'text-white/70 hover:text-white')}
            >
              <GlobeIcon className="w-3.5 h-3.5" />
              Globo
            </button>
          </div>
        </div>
      </header>

      {viewMode === 'dashboard' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
              <div>
                <h2 className="text-2xl font-bold font-serif text-white">Painel de Gestão</h2>
                <p className="text-sm text-white/50">Visão geral da sua exploração agrícola</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-white/60 font-bold uppercase tracking-widest">
                  Última atualização: {new Date().toLocaleTimeString('pt-AO')}
                </span>
              </div>
            </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Tractor className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Culturas Ativas</p>
              <h3 className="text-3xl font-bold text-white">{crops.length}</h3>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-[#38bdf8]">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12% vs mês anterior</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-5 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Droplet className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Precipitação</p>
              <h3 className="text-3xl font-bold text-white">{weatherData.rainProb || 0}%</h3>
              <p className="mt-4 text-xs text-white/50">Probabilidade para hoje em Benguela</p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="p-5 bg-white/5 border border-white/10 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-12 h-12" />
              </div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">Alertas do Solo</p>
              <h3 className="text-3xl font-bold text-white">
                {crops.filter(c => c.soilAlerts.moisture || c.soilAlerts.nutrients).length}
              </h3>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-orange-400">
                <Bell className="w-3.5 h-3.5" />
                <span>Necessita atenção imediata</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="p-5 bg-[#38bdf8]/10 border border-[#38bdf8]/20 rounded-3xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <Layers className="w-12 h-12 text-[#38bdf8]" />
              </div>
              <p className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest mb-1">Estimativa de Safra</p>
              <h3 className="text-3xl font-bold text-white">2.4 t/ha</h3>
              <p className="mt-4 text-xs text-[#38bdf8]/80 font-medium font-mono uppercase tracking-tighter">Projeção Regional</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-2 p-6 bg-white/5 border border-white/10 rounded-3xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-lg">Projeção de Crescimento vs Ideal</h3>
                  <p className="text-xs text-white/40">Baseado no ciclo fenológico do Milho em Angola</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></div>
                    <span className="text-[10px] font-bold text-white/50 uppercase">Projetado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                    <span className="text-[10px] font-bold text-white/50 uppercase">Mínimo</span>
                  </div>
                </div>
              </div>
              
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={[
                      { name: 'Sem 1', projected: 10, min: 5 },
                      { name: 'Sem 3', projected: 30, min: 20 },
                      { name: 'Sem 5', projected: 45, min: 35 },
                      { name: 'Sem 7', projected: 70, min: 55 },
                      { name: 'Sem 9', projected: 85, min: 75 },
                      { name: 'Sem 11', projected: 100, min: 90 },
                    ]}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorProj" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#0a0f1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#38bdf8' }}
                    />
                    <Area type="monotone" dataKey="projected" stroke="#38bdf8" strokeWidth={3} fillOpacity={1} fill="url(#colorProj)" />
                    <Area type="monotone" dataKey="min" stroke="rgba(255,255,255,0.2)" strokeWidth={2} fill="transparent" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Price Tracker & Quick Actions */}
            <div className="space-y-6">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="p-6 bg-white/5 border border-white/10 rounded-3xl"
              >
                <h3 className="font-bold text-lg mb-4">Preços no Mercado (Luanda)</h3>
                <div className="space-y-4">
                  {[
                    { item: 'Milho (Saco 50kg)', price: '12.500 Kz', trend: 'up' },
                    { item: 'Mandioca (Kg)', price: '450 Kz', trend: 'down' },
                    { item: 'Feijão (Kg)', price: '1.200 Kz', trend: 'stable' },
                  ].map((market, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-2xl">
                      <div>
                        <p className="text-xs font-bold text-white/80">{market.item}</p>
                        <p className="text-sm font-bold text-[#38bdf8]">{market.price}</p>
                      </div>
                      <div className={cn(
                        "p-1.5 rounded-lg",
                        market.trend === 'up' ? "bg-green-400/10 text-green-400" : 
                        market.trend === 'down' ? "bg-red-400/10 text-red-400" :
                        "bg-white/10 text-white/40"
                      )}>
                        <TrendingUp className={cn("w-4 h-4", market.trend === 'down' && "rotate-180", market.trend === 'stable' && "rotate-90")} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="p-6 bg-[#38bdf8] text-black rounded-3xl shadow-xl shadow-[#38bdf8]/10"
              >
                <h3 className="font-bold text-lg mb-2">Dica do AgroAssist</h3>
                <p className="text-xs leading-relaxed font-medium mb-4">
                  &quot;O clima em Benguela indica chuva leve para quarta-feira. Ótimo momento para preparar a adubação de cobertura do seu milho.&quot;
                </p>
                <button 
                   onClick={() => setViewMode('chat')}
                   className="w-full py-2 bg-black text-white rounded-xl text-xs font-bold hover:bg-black/80 transition-all"
                >
                  Saber mais no Chat
                </button>
              </motion.div>
            </div>
          </div>

          {/* Detailed Crop Status Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="p-6 bg-white/5 border border-white/10 rounded-3xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-lg">Estado das Plantações</h3>
              <button 
                onClick={() => setShowAddCrop(true)}
                className="text-xs text-[#38bdf8] font-bold flex items-center gap-1 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Filtro
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase font-bold text-white/30 tracking-widest border-b border-white/5">
                    <th className="pb-4">Cultura</th>
                    <th className="pb-4">Fase Atual</th>
                    <th className="pb-4">Progresso</th>
                    <th className="pb-4 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {crops.map((crop) => {
                    const stats = getCropStage(crop.plantedAt, crop.name);
                    return (
                      <tr key={crop.id} className="group hover:bg-white/5 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/5 rounded-xl group-hover:bg-[#38bdf8]/20 transition-colors">
                              <Sprout className="w-5 h-5 text-[#38bdf8]" />
                            </div>
                            <div>
                              <p className="font-bold text-sm">{crop.name}</p>
                              <p className="text-[10px] text-white/40">{crop.location}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4">
                          <span className="px-2 py-1 bg-white/5 rounded-lg text-[10px] font-bold text-white/60">
                            {stats.stage}
                          </span>
                        </td>
                        <td className="py-4 pr-4 min-w-[150px]">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-white/40">{stats.progress}% concluído</span>
                              <span className="text-[#38bdf8]">Estimado</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.progress}%` }}
                                className="h-full bg-gradient-to-r from-[#38bdf8] to-sky-400 rounded-full"
                              ></motion.div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <button 
                            onClick={() => setSelectedCropDetail(crop)}
                            className="bg-white/5 hover:bg-white/10 p-2 rounded-xl text-white/60 hover:text-white transition-all"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {viewMode === 'map' && (
        <div className="flex-1 w-full bg-[#111] overflow-hidden relative rounded-b-3xl sm:rounded-b-none">
          <AgroMapWrapper farmLocation={farmLocation} onSetFarmLocation={setFarmLocation} />
        </div>
      )}

      {viewMode === 'globe' && (
        <div className="flex-1 w-full bg-black/40 overflow-hidden relative rounded-b-3xl sm:rounded-b-none flex items-center justify-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#0a192f_0%,transparent_70%)] opacity-30 pointer-events-none"></div>
            <div className="relative w-full aspect-square max-w-[600px] flex items-center justify-center">
                <Globe 
                    config={{
                        width: 1200,
                        height: 1200,
                        phi: 0,
                        theta: 0.3,
                        dark: 1,
                        diffuse: 1.2,
                        mapSamples: 16000,
                        mapBrightness: 6,
                        baseColor: [0.05, 0.1, 0.2],
                        markerColor: [56/255, 189/255, 248/255],
                        glowColor: [0.1, 0.2, 0.5],
                        markers: globeMarkers,
                        devicePixelRatio: 2,
                    }}
                    className="z-10" 
                />
                
                <div className="absolute top-10 left-10 z-20 pointer-events-none">
                    <h2 className="text-3xl font-serif font-bold text-[#38bdf8]">BOLE-GLOBE MONITOR</h2>
                    <p className="text-white/50 text-sm mt-2 font-medium">Interação Satelital Agro-Visual</p>
                    <div className="flex items-center gap-3 mt-6">
                        <div className="flex items-center gap-1.5 text-xs bg-black/40 border border-white/10 px-3 py-1.5 rounded-full">
                            <div className="w-1.5 h-1.5 bg-[#38bdf8] rounded-full animate-pulse"></div>
                            <span>{crops.length + 3} Pontos Ativos</span>
                        </div>
                    </div>
                </div>
                
                <div className="absolute bottom-10 right-10 z-20 text-right pointer-events-none max-w-[200px]">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-1.5">Região Focada</p>
                    <p className="text-lg font-bold">Angola (Subsaariana)</p>
                    <p className="text-xs text-white/50 mt-1">Dados de topografia e umidade processados</p>
                </div>
            </div>
        </div>
      )}

      {viewMode === 'planning' && (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-xl font-bold font-serif">Planeamento de Safra</h2>
              <p className="text-xs text-white/50">Estratégias personalizadas para a sua terra</p>
            </div>
            {!selectedPlanDetail && (
              <button 
                onClick={() => {
                  setViewMode('chat');
                  setWizardState({ active: true, step: 0, data: {} });
                  setMessages(prev => [
                    ...prev, 
                    { 
                      role: 'model', 
                      parts: [{ text: "Vou fazer algumas perguntas rápidas para gerar um Planejamento de Safra e Rotação completo.\n\n" + WIZARD_QUESTIONS[0].text }] 
                    }
                  ]);
                }}
                className="bg-[#38bdf8] hover:bg-sky-400 text-black px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Novo Plano
              </button>
            )}
          </div>

          {selectedPlanDetail ? (
            <div className="space-y-4">
              <button 
                onClick={() => setSelectedPlanDetail(null)}
                className="text-xs text-blue-400 flex items-center gap-1 hover:underline mb-2"
              >
                ← Voltar aos meus planos
              </button>
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Calendar className="w-32 h-32" />
                </div>
                <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-[#38bdf8]">{selectedPlanDetail.crop}</h3>
                    <p className="text-xs text-white/50">{selectedPlanDetail.timestamp}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Localização</p>
                    <p className="text-sm font-medium">{selectedPlanDetail.data.location}</p>
                  </div>
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-[#38bdf8] prose-strong:text-blue-300">
                  <ReactMarkdown components={markdownComponents}>{selectedPlanDetail.report}</ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedPlans.length > 0 ? (
                savedPlans.map((plan) => (
                  <button 
                    key={plan.id}
                    onClick={() => setSelectedPlanDetail(plan)}
                    className="p-5 bg-white/5 border border-white/10 rounded-2xl text-left hover:bg-white/10 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#38bdf8]/5 rounded-full blur-2xl group-hover:bg-[#38bdf8]/10 transition-all"></div>
                    <div className="flex justify-between items-start mb-3">
                      <div className="p-2 bg-[#38bdf8]/10 rounded-lg">
                        <Calendar className="w-5 h-5 text-[#38bdf8]" />
                      </div>
                      <div className="flex items-center gap-1">
                        <p className="text-[10px] text-white/40 font-bold mr-2">{plan.timestamp}</p>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeletePlan(plan.id);
                          }}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          <X className="w-3 h-3 text-white/40 hover:text-red-400" />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-[#38bdf8] transition-colors">{plan.crop}</h3>
                    <p className="text-xs text-white/60 mb-4 line-clamp-2">{plan.data.location} • {plan.data.area}</p>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-[#38bdf8] uppercase tracking-widest">
                      Ver Plano Completo
                      <Send className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-center space-y-4 bg-white/5 rounded-3xl border border-dashed border-white/10">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                    <Sprout className="w-8 h-8 text-white/20" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white/80">Nenhum plano ainda</p>
                    <p className="text-sm text-white/40 max-w-xs">Use o assistente guiado para criar seu primeiro planejamento de safra e rotação.</p>
                  </div>
                  <button 
                    onClick={() => {
                      setViewMode('chat');
                      setWizardState({ active: true, step: 0, data: {} });
                      setMessages(prev => [
                        ...prev, 
                        { 
                          role: 'model', 
                          parts: [{ text: "Vou fazer algumas perguntas rápidas para gerar um Planejamento de Safra e Rotação completo.\n\n" + WIZARD_QUESTIONS[0].text }] 
                        }
                      ]);
                    }}
                    className="mt-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Começar Agora
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {viewMode === 'chat' && (
        <div className="flex-1 flex flex-col min-h-0 bg-transparent">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="flex justify-center mb-6">
          <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-200/80 text-[10px] sm:text-xs px-4 py-2 rounded-xl text-center max-w-md">
            <span className="font-bold text-yellow-400 mb-1 block">⚠️ AVISO</span>
            As conversas são analisadas por IA. Não substitui um laudo técnico oficial. Em caso de alto risco, consulte um agrônomo presencialmente.
          </div>
        </div>

        {messages.map((message, index) => (
          <div key={index} className="flex flex-col group/msg">
            <div 
              className={cn(
                "flex flex-col max-w-[85%] sm:max-w-[80%]",
                message.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 opacity-0 group-hover/msg:opacity-100 transition-opacity">
                {message.role === 'user' && (
                  <button 
                    onClick={() => deleteMessage(index)}
                    className="p-1 text-white/20 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
                <span className="text-[9px] uppercase font-bold text-white/20 tracking-widest">{message.role === 'user' ? 'Você' : 'Agrongola'}</span>
                {message.role === 'model' && (
                  <button 
                    onClick={() => deleteMessage(index)}
                    className="p-1 text-white/20 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div 
                className={cn(
                  "px-4 py-3 text-[15px] shadow-xl relative",
                  message.role === 'user' 
                    ? "bg-[#1e3a5f]/80 backdrop-blur-sm rounded-2xl rounded-tr-none border border-white/10 text-white" 
                    : "bg-white/10 backdrop-blur-xl rounded-3xl rounded-tl-none border border-white/20 text-white"
                )}
              >
                {message.parts.map((part, i) => {
                  if ('inlineData' in part) {
                    return (
                      <div key={i} className="mb-3 max-w-sm rounded overflow-hidden shadow-sm">
                        <Image 
                          src={`data:${part.inlineData.mimeType};base64,${part.inlineData.data}`} 
                          alt="Imagem enviada" 
                          width={400}
                          height={300}
                          className="w-full h-auto object-cover rounded-lg border border-white/10"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    );
                  } else if ('text' in part && part.text) {
                    return (
                      <div key={i} className={cn("prose prose-sm max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0 pb-1 prose-invert prose-p:text-white/90 prose-strong:text-[#38bdf8] prose-a:text-blue-400", message.role === 'user' ? "prose-p:text-white" : "")}>
                        <ReactMarkdown components={markdownComponents}>{part.text}</ReactMarkdown>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
            
            {/* Show dynamic suggestions after the last model message when not loading */}
            {index === messages.length - 1 && message.role === 'model' && !isLoading && (
              <div className="mt-6 flex flex-wrap gap-2 max-w-[90%] mr-auto items-start">
                {getDynamicSuggestions().map((suggestion, sIdx) => (
                  <button
                    key={sIdx}
                    onClick={() => handleSuggestionClick(suggestion.text)}
                    className="flex items-center gap-2 bg-white/5 hover:bg-[#38bdf8]/20 hover:border-[#38bdf8]/40 border border-white/10 rounded-full px-4 py-2 text-[13px] text-white/80 hover:text-white transition-all text-left shadow-sm"
                  >
                    <span>{suggestion.icon}</span>
                    <span className="font-medium">{suggestion.text}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        {isLoading && messages[messages.length - 1].role === 'user' && (
           <div className="flex max-w-[85%] sm:max-w-[80%] mr-auto items-start">
             <div className="bg-white/10 backdrop-blur-xl px-5 py-4 rounded-3xl rounded-tl-none border border-white/20 shadow-xl flex items-center space-x-2">
               <div className="w-2 h-2 bg-[#38bdf8] rounded-full animate-pulse"></div>
               <div className="w-2 h-2 bg-[#38bdf8] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
               <div className="w-2 h-2 bg-[#38bdf8] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview Overlay */}
      {selectedImages.length > 0 && (
        <div className="absolute bottom-24 left-4 right-4 sm:left-auto sm:w-80 bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 z-20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <p className="text-[10px] uppercase font-bold text-white/40">{selectedImages.length} {selectedImages.length === 1 ? 'Imagem' : 'Imagens'} de {selectedImages.length >= 4 ? 'Limite de 4' : 'Até 4'}</p>
            <button 
              onClick={clearImages}
              className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase transition-colors"
            >
              Limpar tudo
            </button>
          </div>
          
          <div className="grid grid-cols-4 gap-1.5 mb-3">
              {selectedImages.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image src={img} alt={`Preview ${i}`} fill className="object-cover border border-white/10" referrerPolicy="no-referrer" />
                  <button 
                    onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            {selectedImages.length < 4 && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-lg border border-dashed border-white/20 bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <Plus className="w-4 h-4 text-white/40" />
              </button>
            )}
          </div>
          
          <div className="px-1 pb-1">
            <p className="text-[10px] uppercase font-semibold text-white/40 mb-2 tracking-wider">Sintomas Observados:</p>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pr-1">
              {AVAILABLE_SYMPTOMS.map(sym => (
                <button
                  key={sym}
                  onClick={() => toggleSymptom(sym)}
                  className={cn(
                    "text-[9px] px-2.5 py-1.5 rounded-lg border transition-all font-medium uppercase tracking-[0.05em]",
                    selectedSymptoms.includes(sym) 
                      ? "bg-[#38bdf8] border-[#38bdf8] text-black shadow-[0_0_10px_rgba(56,189,248,0.3)]" 
                      : "bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                  )}
                >
                  {sym}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Strip */}
      {selectedImages.length === 0 && !isRecording && (
        <div className="absolute bottom-[80px] sm:bottom-[88px] left-0 w-full px-4 flex gap-2 overflow-x-auto no-scrollbar pointer-events-none z-10">
          <div className="flex gap-2 pointer-events-auto mx-auto bg-black/60 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
            <button 
               onClick={() => {
                 setInput("Analisar Solo: Cor vermelho-claro, textura arenosa, muita poeira. O que falta?");
                 setTimeout(() => {
                   document.querySelector('textarea')?.focus();
                 }, 50);
               }}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#38bdf8]/20 border border-white/10 rounded-xl text-[11px] font-bold text-white transition-all whitespace-nowrap"
            >
              <Sprout className="w-3.5 h-3.5 text-amber-500" />
              Análise de Solo
            </button>
            <button 
               onClick={() => {
                 fileInputRef.current?.click();
               }}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#38bdf8]/20 border border-white/10 rounded-xl text-[11px] font-bold text-white transition-all whitespace-nowrap"
            >
              <Leaf className="w-3.5 h-3.5 text-blue-400" />
              Enviar Foto
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <footer className="relative p-4 bg-white/5 border-t border-white/10 flex gap-3 sm:gap-4 items-end z-20">
        <input 
          type="file" 
          accept="image/*"
          multiple
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="h-12 w-12 flex items-center justify-center text-white/60 hover:text-white bg-white/5 hover:bg-white/10 rounded-2xl transition-all shadow-sm border border-white/10 focus:outline-none shrink-0"
          title="Anexar foto do problema"
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <div className="flex-1 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden relative flex items-center">
          {isRecording ? (
             <div className="flex-1 flex items-center gap-3 px-4 py-3 h-[48px] bg-red-950/20">
               <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
               <span className="text-red-400 text-xs font-bold font-mono tracking-widest uppercase">Gravando Voz... 0:{recordingDuration < 10 ? `0${recordingDuration}` : recordingDuration}</span>
             </div>
          ) : (
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={wizardState.active ? "Responda à pergunta acima..." : "Diga algo ou peça ajuda..."}
              className="w-full max-h-32 min-h-[48px] py-3.5 px-4 resize-none focus:outline-none bg-transparent text-white placeholder:text-white/30 text-sm font-medium"
              rows={1}
              style={{ 
                height: 'auto',
                maxHeight: '120px'
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
              }}
            />
          )}
        </div>

        {(input.trim() || selectedImages.length > 0) && !isRecording ? (
          <button 
            id="btn-send"
            onClick={handleSendMessage}
            disabled={isLoading}
            className={cn(
              "w-12 h-12 text-black rounded-2xl flex items-center justify-center shadow-lg transition-all focus:outline-none shrink-0",
              isLoading ? "bg-white/10 text-white/20 cursor-not-allowed border border-white/5" : "bg-[#38bdf8] hover:bg-sky-400 active:scale-95"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        ) : (
           <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-all focus:outline-none shrink-0 border",
              isRecording 
                ? "bg-red-500/10 border-red-500 hover:bg-red-500/20 text-red-500" 
                : "bg-white/5 border-white/10 text-white/50 hover:bg-white/10"
            )}
            title="Gravar Áudio (Simulado)"
          >
            {isRecording ? <Square className="w-4 h-4 fill-current" /> : <Mic className="w-5 h-5" />}
          </button>
        )}
      </footer>
        </div>
      )}
        </div>
      </main>

      {/* Right Sidebar - Contexto de Campo */}
      <aside className="hidden xl:flex w-64 h-full bg-white/5 backdrop-blur-xl border-l border-white/10 p-6 flex-col z-10 shrink-0">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-semibold mb-4">Contexto de Campo</p>
          <div className="space-y-6">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <p className="text-xs text-white/60 mb-1">Fazenda Boa Vista</p>
              <p className="text-xl font-bold">{weatherData.temp !== null ? `${Math.round(weatherData.temp)}°C` : '--°C'}</p>
              {weatherData.rainTime && <p className="text-xs text-blue-400 mt-1">Chuva prevista: {weatherData.rainTime}</p>}
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/60">Umidade</p>
                <p className="text-xs font-bold">{weatherData.humidity !== null ? `${Math.round(weatherData.humidity)}%` : '--%'}</p>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[72%] h-full bg-[#38bdf8]" style={{ width: weatherData.humidity !== null ? `${weatherData.humidity}%` : '0%' }}></div>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-xs text-white/60">Chuva (Prob.)</p>
                <p className="text-xs font-bold">{weatherData.rainProb !== null ? `${weatherData.rainProb}%` : '--%'}</p>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="w-[60%] h-full bg-[#38bdf8]" style={{ width: weatherData.rainProb !== null ? `${weatherData.rainProb}%` : '0%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <p className="text-[10px] uppercase text-white/40 font-bold mb-3">Alertas Desencadeados (Satélite)</p>
              <div className="space-y-2">
                {crops.filter(c => c.soilAlerts.moisture || c.soilAlerts.nutrients).length === 0 ? (
                   <p className="text-xs text-white/40 italic">Nenhum alerta configurado.</p>
                ) : (
                  crops.filter(c => c.soilAlerts.moisture || c.soilAlerts.nutrients).map(crop => (
                    <div key={`alert-${crop.id}`} className="space-y-2">
                      {crop.soilAlerts.moisture && (weatherData.humidity !== null && weatherData.humidity < crop.soilAlerts.moistureThreshold) && (
                        <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-start gap-2">
                           <div className="mt-0.5 bg-red-500/20 p-1 rounded">
                             <Droplet className="w-3 h-3 text-red-400" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-red-400">Baixa Umidade: {crop.name}</p>
                             <p className="text-[10px] text-white/70">Solo seco no {crop.location}. Irrigação recomendada hoje.</p>
                           </div>
                        </div>
                      )}
                      {crop.soilAlerts.nutrients && (
                        <div className="bg-purple-500/10 border border-purple-500/20 p-2.5 rounded-xl flex items-start gap-2">
                           <div className="mt-0.5 bg-purple-500/20 p-1 rounded">
                             <Zap className="w-3 h-3 text-purple-400" />
                           </div>
                           <div>
                             <p className="text-xs font-bold text-purple-400">Risco em Nutrientes: {crop.name}</p>
                             <p className="text-[10px] text-white/70">Análise espectral indica deficiência de Nitrogênio no {crop.location}.</p>
                           </div>
                        </div>
                      )}
                      
                      {/* Se configurou mas não desencadeou */}
                      {(crop.soilAlerts.moisture && (!weatherData.humidity || weatherData.humidity >= crop.soilAlerts.moistureThreshold)) && !crop.soilAlerts.nutrients && (
                         <div className="flex items-center gap-2 p-2 bg-white/5 rounded-xl border border-white/5">
                           <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                           <p className="text-[10px] text-white/60">Umidade OK para {crop.name}</p>
                         </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Modal Detalhes da Cultura */}
      <AnimatePresence>
        {selectedCropDetail && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-[#0a0f1e] border border-white/10 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden"
            >
              {/* Header com gradiente */}
              <div className="h-32 bg-gradient-to-r from-[#38bdf8]/40 to-sky-600/40 relative">
                 <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/agro/800/400')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
                 <button 
                  onClick={() => setSelectedCropDetail(null)} 
                  className="absolute top-6 right-6 p-2 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 sm:p-8 -mt-12 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="p-5 bg-[#0a0f1e] border border-white/10 rounded-3xl shadow-xl">
                      <Sprout className="w-10 h-10 text-[#38bdf8]" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-serif font-bold text-white">{selectedCropDetail.name}</h2>
                      <p className="text-white/50 font-medium flex items-center gap-1.5 mt-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {selectedCropDetail.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                       onClick={() => {
                         setEditingCrop(selectedCropDetail);
                         setNewCrop({
                           name: selectedCropDetail.name,
                           plantedAt: selectedCropDetail.plantedAt,
                           location: selectedCropDetail.location
                         });
                         setSelectedCropDetail(null);
                         setShowAddCrop(true);
                       }}
                       className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-white transition-all ring-1 ring-white/10"
                    >
                      Editar
                    </button>
                    <button 
                       onClick={() => {
                         setViewMode('chat');
                         setInput(`Conte-me mais sobre como cuidar da minha plantação de ${selectedCropDetail.name} em ${selectedCropDetail.location}. Está plantada desde ${selectedCropDetail.plantedAt}.`);
                         setSelectedCropDetail(null);
                       }}
                       className="px-4 py-2 bg-[#38bdf8] hover:bg-sky-400 rounded-xl text-xs font-bold text-black transition-all"
                    >
                      Consultar IA
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Stats & Status */}
                  <div className="space-y-6">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-4 border-b border-white/5 pb-2">Ciclo de Vida</p>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/50 underline decoration-dotted">Data de Plantio</span>
                          <span className="text-sm font-bold">{new Date(selectedCropDetail.plantedAt).toLocaleDateString('pt-AO')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-white/50 underline decoration-dotted">Idade da Planta</span>
                          <span className="text-sm font-bold">
                            {Math.ceil((new Date().getTime() - new Date(selectedCropDetail.plantedAt).getTime()) / (1000 * 60 * 60 * 24))} dias
                          </span>
                        </div>
                        <div className="space-y-1.5 pt-2">
                           <div className="flex justify-between text-[10px] font-bold">
                             <span className="text-white/40">Progresso do Ciclo</span>
                             <span className="text-[#38bdf8]">{getCropStage(selectedCropDetail.plantedAt, selectedCropDetail.name).progress}%</span>
                           </div>
                           <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                             <div 
                               style={{ width: `${getCropStage(selectedCropDetail.plantedAt, selectedCropDetail.name).progress}%` }}
                               className="h-full bg-gradient-to-r from-[#38bdf8] to-sky-400 rounded-full"
                             ></div>
                           </div>
                           <p className="text-[10px] text-white/30 text-center italic">Próxima fase estimada: {getCropStage(selectedCropDetail.plantedAt, selectedCropDetail.name).stage}</p>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
                      <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-4 border-b border-white/5 pb-2">Configuração de Alertas</p>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplet className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium">Monitor de Umidade</span>
                          </div>
                          <button 
                            onClick={() => updateCropAlerts(selectedCropDetail.id, { ...selectedCropDetail.soilAlerts, moisture: !selectedCropDetail.soilAlerts.moisture })}
                            className={cn("w-10 h-5 rounded-full transition-all relative", selectedCropDetail.soilAlerts.moisture ? "bg-[#38bdf8]" : "bg-white/10")}
                          >
                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", selectedCropDetail.soilAlerts.moisture ? "left-6" : "left-1")}></div>
                          </button>
                        </div>
                        {selectedCropDetail.soilAlerts.moisture && (
                          <div className="space-y-2 pl-6 animate-in slide-in-from-left-2 duration-300">
                            <div className="flex justify-between text-[10px] font-bold text-white/40">
                              <span>Sensibilidade</span>
                              <span>{selectedCropDetail.soilAlerts.moistureThreshold}% HR</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={selectedCropDetail.soilAlerts.moistureThreshold}
                              onChange={(e) => updateCropAlerts(selectedCropDetail.id, { ...selectedCropDetail.soilAlerts, moistureThreshold: parseInt(e.target.value) })}
                              className="w-full accent-[#38bdf8] h-1 bg-white/10 rounded-full"
                            />
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-orange-400" />
                            <span className="text-xs font-medium">Deficiência de Nutrientes</span>
                          </div>
                          <button 
                            onClick={() => updateCropAlerts(selectedCropDetail.id, { ...selectedCropDetail.soilAlerts, nutrients: !selectedCropDetail.soilAlerts.nutrients })}
                            className={cn("w-10 h-5 rounded-full transition-all relative", selectedCropDetail.soilAlerts.nutrients ? "bg-orange-400" : "bg-white/10")}
                          >
                            <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", selectedCropDetail.soilAlerts.nutrients ? "left-6" : "left-1")}></div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div className="space-y-6">
                    <div className="p-5 bg-white/5 border border-white/10 rounded-2xl h-full">
                       <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest mb-4 border-b border-white/5 pb-2">Tarefas Recomendadas</p>
                       <div className="space-y-3">
                         {[
                           { text: 'Verificar manchas nas folhas inferiores', done: false },
                           { text: 'Aplicar adubação de cobertura (semana 8)', done: false },
                           { text: 'Limpar ervas daninhas ao redor do caule', done: true },
                           { text: 'Controle de formigas cortadeiras', done: false },
                         ].map((task, i) => (
                           <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl group transition-all hover:bg-white/10">
                             <div className={cn("w-5 h-5 rounded border flex items-center justify-center mt-0.5", task.done ? "bg-[#38bdf8] border-[#38bdf8]" : "border-white/20")}>
                               {task.done && <Send className="w-3 h-3 text-black" />}
                             </div>
                             <p className={cn("text-xs", task.done ? "text-white/30 line-through" : "text-white/80")}>{task.text}</p>
                           </div>
                         ))}
                       </div>

                       <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                         <div className="flex items-center gap-2 mb-2 text-blue-400">
                           <BellRing className="w-4 h-4" />
                           <p className="text-[10px] font-bold uppercase tracking-widest">Alerta Meteorológico</p>
                         </div>
                         <p className="text-xs text-white/80">
                           Temperaturas acima de 32°C previstas para amanhã. Aumente a frequência da rega manual no período da manhã.
                         </p>
                       </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Nova/Editar Cultura (Centralizado) */}
      {showAddCrop && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-[#0a0f1e] border border-white/10 w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-y-auto max-h-[90vh]">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none"></div>
            
            <button 
              onClick={() => {
                setShowAddCrop(false);
                setEditingCrop(null);
                setNewCrop({ name: '', plantedAt: '', location: '' });
              }} 
              className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex items-center gap-3 mb-8">
               <div className="p-3 bg-[#38bdf8]/20 rounded-2xl">
                 <Leaf className="w-6 h-6 text-[#38bdf8]" />
               </div>
               <h2 className="text-2xl font-serif font-bold text-white">
                 {editingCrop ? 'Editar Plantação' : 'Nova Plantação'}
               </h2>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 tracking-widest">Nome da Cultura</label>
                <input 
                  placeholder="Ex: Milho, Mandioca..."
                  value={newCrop.name}
                  onChange={e => setNewCrop({...newCrop, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#38bdf8]/50 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 tracking-widest">Data de Plantio</label>
                <input 
                  type="date"
                  value={newCrop.plantedAt}
                  onChange={e => setNewCrop({...newCrop, plantedAt: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#38bdf8]/50 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none transition-all color-scheme-dark"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold text-white/40 ml-1 tracking-widest">Localização / Lote</label>
                <input 
                  placeholder="Ex: Fazenda Boa Vista, Lote 4..."
                  value={newCrop.location}
                  onChange={e => setNewCrop({...newCrop, location: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 focus:border-[#38bdf8]/50 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:outline-none transition-all"
                />
              </div>

              <button 
                onClick={handleAddCrop}
                className="w-full bg-[#38bdf8] hover:bg-sky-400 text-black py-5 rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/40 mt-4 active:scale-95"
              >
                {editingCrop ? 'Salvar Alterações' : 'Confirmar Cadastro'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Footer corporativo fixo no fundo - Agora adaptativo */}
      <footer className="fixed bottom-0 left-0 w-full py-1.5 bg-[#0a0a0a]/90 backdrop-blur-md z-[90] text-center border-t border-white/5 lg:bg-transparent lg:border-none lg:text-left lg:px-8 lg:bottom-4 lg:w-auto">
        <p className="text-[8px] sm:text-[9px] text-white/20 uppercase tracking-widest font-medium px-4">
          Todos direitos reservados para empresa Pro Engenharia Angola. <span className="hidden sm:inline">Por: Bernardino Felizardo</span>
        </p>
      </footer>
    </div>
  );
}
