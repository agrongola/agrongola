export interface PestDisease {
  id: string;
  name: string;
  type: 'praga' | 'doenca';
  description: string;
  symptoms: string[];
  organicControl: string;
  chemicalControl: string;
  epi: string;
  resources: string;
}

export const agriLibrary: PestDisease[] = [
  {
    id: 'lagarta-do-cartucho',
    name: 'Lagarta-do-cartucho (Spodoptera frugiperda)',
    type: 'praga',
    description: 'Principal praga do milho, ataca todas as fases da cultura. As lagartas destroem as folhas e podem atacar a espiga.',
    symptoms: [
      'Folhas raspadas com aspecto telado',
      'Fezes nas folhas e dentro do cartucho',
      'Cartuchos destruídos com perfurações'
    ],
    organicControl: 'Uso de Bacillus thuringiensis (Bt), liberação de parasitoides como Trichogramma pretiosum, uso de extrato de neem.',
    chemicalControl: 'Inseticidas à base de Espinosade, Clorantraniliprole ou Metomil, aplicados no início do ataque (lagartas pequenas).',
    epi: 'Macacão hidro-repelente, luvas de nitrila, bota de borracha, máscara com filtro combinado, óculos de proteção e touca árabe.',
    resources: 'https://www.embrapa.br/agencia-de-informacao-tecnologica/cultivos/milho/producao/pragas/pragas-da-fase-vegetativa/lagarta-do-cartucho'
  },
  {
    id: 'cercosporiose',
    name: 'Cercosporiose (Mancha-de-Cercospora)',
    type: 'doenca',
    description: 'Doença fúngica severa em culturas como o milho, favorecida por alta umidade e temperaturas amenas.',
    symptoms: [
      'Manchas retangulares ou elípticas acinzentadas nas folhas',
      'Secagem prematura das folhas',
      'Lesões que seguem as nervuras das folhas'
    ],
    organicControl: 'Manejo cultural: rotação de culturas (ex: com leguminosas), densidade de plantio adequada, calda bordalesa preventiva.',
    chemicalControl: 'Fungicidas sistêmicos à base de Triazois e Estrobilurinas aplicados ao surgirem os primeiros sintomas.',
    epi: 'Macacão hidro-repelente, avental, luvas espessas, botas, respirador (máscara) apropriado e viseira facial.',
    resources: 'https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/1997/cercosporiose-do-milho'
  },
  {
    id: 'mosca-branca',
    name: 'Mosca-branca (Bemisia tabaci)',
    type: 'praga',
    description: 'Pequeno inseto sugador transmissor de viroses em culturas com tomate, feijão e soja.',
    symptoms: [
      'Presença de pequenos insetos brancos na face inferior das folhas',
      'Folhas amareladas e enrugadas',
      'Presença de fumagina (fungo preto) crescendo sobre a secreção açucarada'
    ],
    organicControl: 'Armadilhas adesivas amarelas, óleo de neem, sabão potássico, e extrato de alho. \n\n**Receita Calda de Neem:** \n**Ingredientes:** 100g de folhas secas de neem ou 50ml de óleo de neem comercial, 10L de água, 20g de sabão neutro. \n**Modo de preparo:** Diluir o óleo e o sabão na água. \n**Frequência:** Pulverizar a cada 7-10 dias no final da tarde.',
    chemicalControl: 'Uso de inseticidas do grupo Neonicotinóides e Reguladores de Crescimento. Atenção à rotação de princípios ativos para evitar resistência.',
    epi: 'Luvas, roupas de proteção completas, proteção ocular e respiratória reforçada.',
    resources: 'https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/2026/manejo-da-mosca-branca'
  },
  {
    id: 'pulgao',
    name: 'Pulgões (Aphidoidea)',
    type: 'praga',
    description: 'Insetos sugadores de seiva que atacam diversas culturas, causando definhamento das plantas e transmitindo vírus.',
    symptoms: [
      'Colônias de pequenos insetos (verdes, pretos ou amarelos) nos brotos e folhas novas',
      'Folhas enroladas ou deformadas',
      'Presença de formigas e fumagina'
    ],
    organicControl: 'Joaninhas e crisopídeos são predadores naturais. \n\n**Receita Calda de Sabão com Alho:**\n**Ingredientes:** 1 cabeça de alho picada, 50g de sabão neutro ralado, 10L de água.\n**Modo de preparo:** Ferva o sabão até dissolver, deixe esfriar. Bata o alho no liquidificador com 1L da água e coe. Depois misture tudo.\n**Frequência:** Aplicar a cada 5 dias até o controle da infestação.',
    chemicalControl: 'Inseticidas sistêmicos (Neonicotinóides) se a infestação for severa, respeitando o período de carência.',
    epi: 'Macacão de algodão hidro-repelente, botas, luvas e máscara.' ,
    resources: 'https://archive.org/details/pulgao'
  },
  {
    id: 'gorgulho',
    name: 'Gorgulho-do-milho ou Feijão (Sitophilus spp. / Acanthoscelides obtectus)',
    type: 'praga',
    description: 'Praga de pós-colheita que destrói grãos armazenados, como milho e feijão.',
    symptoms: [
      'Grãos perfurados e esburacados',
      'Presença de besouros com "bico" alongado no meio dos grãos',
      'Pó fino no fundo dos sacos ou silos'
    ],
    organicControl: 'Uso de terra de diatomáceas, cinza de madeira misturada aos grãos, ou pimenta seca na sacaria. Armazenar em garrafas pet ou tambores hermeticamente fechados para bloquear o oxigênio.',
    chemicalControl: 'Expurgo com fosfeto de alumínio (Gastoxin). O produto libera gás tóxico e exige extrema segurança.',
    epi: 'EXIGÊNCIA MÁXIMA PARA EXPURGO: Máscara com filtro específico para gases (fosfina), luvas, roupas fechadas e treinamento adequado.',
    resources: 'https://www.embrapa.br/busca-de-solucoes-tecnologicas/-/produto-servico/1996/gorgulho'
  },
  {
    id: 'mosaico-mandioca',
    name: 'Vírus do Mosaico da Mandioca (CacMV)',
    type: 'doenca',
    description: 'Doença viral severa que atinge plantações de mandioca, transmitida pela mosca-branca ou por manivas infectadas.',
    symptoms: [
      'Folhas com manchas amareladas e verdes pálidas (mosaico)',
      'Folhas retorcidas e deformadas',
      'Redução severa do tamanho da raiz (mandioca)'
    ],
    organicControl: 'Ação principal é preventiva: Usar manivas sadias e variedades resistentes. Eliminar plantas doentes (roguing) e combater a mosca-branca com armadilhas ou óleo de neem.',
    chemicalControl: 'Não existe controle químico curativo para viroses. Deve-se focar no controle do inseto vetor (mosca-branca).',
    epi: 'N/A (Para manejo manual. Se usar inseticidas para mosca-branca, usar EPI completo).',
    resources: 'https://www.embrapa.br/mandioca-e-fruticultura'
  },
  {
    id: 'ferrugem-feijoeiro',
    name: 'Ferrugem do Feijoeiro (Uromyces appendiculatus)',
    type: 'doenca',
    description: 'Fungo que ataca o feijão, causando grande perda de produtividade. Muito comum em regiões de clima úmido.',
    symptoms: [
      'Pequenas pústulas cor de ferrugem (pó marrom-avermelhado) nas folhas',
      'Secagem e queda prematura das folhas',
      'Vagens manchadas e deformadas'
    ],
    organicControl: 'Uso de variedades resistentes, rotação de cultura, espaçamento adequado para ventilar a área, remoção de restos culturais da safra anterior. Calda sulfocálcica protetora.',
    chemicalControl: 'Fungicidas sistêmicos (ex: Misturas de Triazol + Estrobilurina) de forma preventiva ou logo no inicio dos sintomas.',
    epi: 'Macacão hidro-repelente, luvas de nitrila, bota de borracha, máscara e viseira.',
    resources: 'https://www.embrapa.br/busca-de-publicacoes/-/publicacao/1090333/ferrugem-do-feijoeiro-sintomas-epidemiologia-e-manejo'
  }
];

export function searchPestDisease(query: string): PestDisease[] {
  const normQuery = query.toLowerCase();
  return agriLibrary.filter(item => 
    item.name.toLowerCase().includes(normQuery) || 
    item.symptoms.some(s => s.toLowerCase().includes(normQuery)) ||
    item.description.toLowerCase().includes(normQuery)
  );
}
