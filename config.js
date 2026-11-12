/* ============================================================
   TERCEIRÃO · 3º INFORMÁTICA 1  —  tudo que você edita fica aqui
   ============================================================ */
window.CONFIG = {
  turma: "3º Informática 1",
  escola: "Nome da Escola",            // TROCAR
  ano: 2026,

  // Data e hora da formatura (horário de Brasília). Ajuste só o horário, se precisar.
  formatura: "2026-12-19T19:00:00-03:00",

  // Música de fundo (deixe arquivo: "" para desligar). volume vai de 0 a 1.
  musica: { arquivo: "assets/musica/musica.mp3", titulo: "Tempo Perdido", volume: 0.35 },

  // Supabase: Project Settings > API.  A chave "anon public" pode ficar no site.
  supabaseUrl: "https://dmjpvpekyctmjvbdlwtf.supabase.co",
  supabaseKey: "sb_publishable_I9YTi1-xczDin0wAQP_0Qg_A6eeB117",

  // Alunos da árvore. "foto" e "info" são opcionais (ex.: foto: "assets/alunos/ana.jpg", info: "Apelido: Aninha").
  // A árvore mostra em loop só quem tem foto (quem não tem fica de fora até você mandar a foto). Para trocar ou acrescentar alguém, é só editar esta lista.
  alunos: [
    { nome: "Alexandre de Pádua Maglia", foto: "assets/alunos/alexandre.webp" },
    { nome: "Alícia Silva de Oliveira" },
    { nome: "Ana Luísa Miranda de Pádua", foto: "assets/alunos/ana-luisa.webp" },
    { nome: "Eduardo Rodrigues da Silva", foto: "assets/alunos/eduardo-rodrigues.webp" },
    { nome: "Eduardo Freire Pádua", foto: "assets/alunos/eduardo-freire.webp" },
    { nome: "Emily Vitória Silva de Lima" },
    { nome: "Emilyn Amorim Barcelos", foto: "assets/alunos/emilyn.webp" },
    { nome: "Gustavo de Pádua Brazão", foto: "assets/alunos/gustavo.webp" },
    { nome: "Igor Xiol Morais Alves", foto: "assets/alunos/igor.webp" },
    { nome: "Isabelly Victoria Alves Amorim" },
    { nome: "João Pedro Bueno Silva", foto: "assets/alunos/joao-pedro.webp" },
    { nome: "João Vitor da Silva Santos", foto: "assets/alunos/joao-vitor.webp" },
    { nome: "Julia Hadassa Moraes Silva", foto: "assets/alunos/julia.webp" },
    { nome: "Kaua Silva Brandão", foto: "assets/alunos/kaua.webp" },
    { nome: "Lavínia dos Reis Benute", foto: "assets/alunos/lavinia.webp" },
    { nome: "Liniker Silva Amaral", foto: "assets/alunos/liniker.webp" },
    { nome: "Lucas Gabriel Alves Moreira", foto: "assets/alunos/lucas-gabriel.webp" },
    { nome: "Luiz Henrique Amorim Ferreira", foto: "assets/alunos/luiz-henrique.webp" },
    { nome: "Marcela Aparecida Nogueira Faustino", foto: "assets/alunos/marcela.webp" },
    { nome: "Maria Eduarda Maciel Oliveira", foto: "assets/alunos/maria-eduarda.webp" },
    { nome: "Maria Paula Costa Oliveira", foto: "assets/alunos/maria-paula.webp" },
    { nome: "Maria Rita Sobral Viana" },
    { nome: "Mateus Martins Silva", foto: "assets/alunos/mateus.webp" },
    { nome: "Vitor Hugo Batista", foto: "assets/alunos/vitor-hugo.webp" },
    { nome: "Wanderson Marcos da Silva Santos", foto: "assets/alunos/wanderson.webp" },
  ],

  // Nossa madrinha. "mensagem": separe os parágrafos com uma linha em branco (\n\n).
  madrinha: {
    nome: "Denise",
    foto: "assets/img/denise-bandeira.webp",      // foto grande do topo
    fotoFofa: "assets/img/denise.webp",           // figurinha fofa ao lado da mensagem
    frase: "Você foi colo, conselho e coragem. A gente vai embora, mas o que você plantou em nós fica.",
    // parágrafos separados por uma linha em branco
    mensagem: "Denise, a gente agradece por ter caminhado ao nosso lado até aqui. Por cada abraço, cada puxão de orelha e cada risada no meio da bagunça.\n\nVocê fez parte da nossa história, e um pedacinho seu vai com a gente em cada lembrança do Terceirão.\n\nCom todo o carinho, 3º Informática 1.",
    fotos: [{ src: "assets/fotos/madrinha-01.webp", legenda: "Terceirão + Denise ♥" },
      { src: "assets/fotos/madrinha-02.webp", legenda: "Nossa Denise ♥" }],   // mesmo formato de "fotos" abaixo
    videos: [{ titulo: "A torta na cara", arquivo: "assets/videos/video-07.mp4" }],   // mesmo formato de "videos" abaixo
  },

  // Fotos: coloque os arquivos em assets/fotos/ e liste aqui.
  // { src: "assets/fotos/festa-junina.jpg", legenda: "Festa junina 2026" }
  fotos: [
    { src: "assets/fotos/foto-01.webp", legenda: "" },
    { src: "assets/fotos/foto-02.webp", legenda: "" },
    { src: "assets/fotos/foto-03.webp", legenda: "" },
    { src: "assets/fotos/foto-04.webp", legenda: "" },
    { src: "assets/fotos/foto-05.webp", legenda: "" },
    { src: "assets/fotos/foto-06.webp", legenda: "" },
    { src: "assets/fotos/foto-07.webp", legenda: "" },
    { src: "assets/fotos/foto-08.webp", legenda: "O convite ao paraninfo" },
    { src: "assets/fotos/foto-09.webp", legenda: "" },
    { src: "assets/fotos/foto-10.webp", legenda: "" },
    { src: "assets/fotos/foto-11.webp", legenda: "" },
    { src: "assets/fotos/foto-12.webp", legenda: "" },
    { src: "assets/fotos/foto-13.webp", legenda: "" },
    { src: "assets/fotos/foto-14.webp", legenda: "" },
    { src: "assets/fotos/foto-15.webp", legenda: "Brinde com as canecas" },
    { src: "assets/fotos/foto-16.webp", legenda: "" },
    { src: "assets/fotos/foto-17.webp", legenda: "" },
    { src: "assets/fotos/foto-18.webp", legenda: "" },
    { src: "assets/fotos/foto-19.webp", legenda: "" },
    { src: "assets/fotos/foto-20.webp", legenda: "" },
    { src: "assets/fotos/foto-21.webp", legenda: "" },
  ],

  // Vídeo especial: aparece em destaque no topo da aba Vídeos (deixe arquivo: "" para esconder).
  // Camisas da arara: frente e costas de cada uma (mande mais e é só acrescentar uma linha)
  camisas: [
    { nome: "Polo", frente: "assets/kit/camisa-polo.webp", costas: "assets/kit/polo-costas.webp" },
    { nome: "Camiseta", frente: "assets/kit/camiseta-frente.webp", costas: "assets/kit/camisa-costas.webp" },
  ],
  videoEspecial: { titulo: "Terceirão em movimento", texto: "Esse a gente guarda com carinho.", arquivo: "assets/videos/especial.mp4" },

  // Vídeos: arquivo em assets/videos/ OU link do YouTube (só o ID).
  // { titulo: "Zoeira no lab", arquivo: "assets/videos/zoeira.mp4" }
  // { titulo: "Apresentação do TCC", youtube: "dQw4w9WgXcQ" }
  videos: [
    { titulo: "", arquivo: "assets/videos/video-01.mp4" },
    { titulo: "", arquivo: "assets/videos/video-02.mp4" },
    { titulo: "", arquivo: "assets/videos/video-03.mp4" },
    { titulo: "", arquivo: "assets/videos/video-04.mp4" },
    { titulo: "", arquivo: "assets/videos/video-05.mp4" },
    { titulo: "", arquivo: "assets/videos/video-06.mp4" },
    { titulo: "", arquivo: "assets/videos/video-07.mp4" },
    { titulo: "", arquivo: "assets/videos/video-08.mp4" },
    { titulo: "", arquivo: "assets/videos/video-09.mp4" },
  ],

  // Linha do tempo de coisas que aconteceram.
  // Linha do tempo (da mais antiga para a mais nova). "video" e "foto" são opcionais.
  // Deixe a lista vazia e a aba Momentos some do site.
  momentos: [
    { data: "4 de fevereiro de 2026", titulo: "As camisetas chegaram",
      texto: "O dia em que as camisetas do Terceirão chegaram e a sala virou festa. Cada um pegou a sua, vestiu a pantera e deu o primeiro passo de uma turma que agora tem uniforme e história.",
      video: "assets/videos/momento-camisetas.mp4" },
    { data: "5 de março de 2026", titulo: "O pedido para a Denise ser nossa madrinha",
      texto: "A gente tinha uma pergunta e um coração cheio: Denise, você quer ser a nossa madrinha? Ela aceitou, e desde então a sala nunca mais foi a mesma.",
      video: "assets/videos/momento-madrinha.mp4" },
  ],
};
