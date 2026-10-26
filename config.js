/*
 * Configuração do site de capacitação – NEP/NSP/CCIH HOSPESC
 * Edite este arquivo direto no GitHub (ícone de lápis) quando precisar.
 */
window.CONFIG = {
  // Nome que aparece no topo
  titulo: 'Educação Permanente',
  subtitulo: 'NSP · CCIH · NEP – Hospital dos Pescadores',

  // Links "Publicar na web" (formato CSV) de cada aba da planilha "Conteúdo do site – NEP".
  // Enquanto estiverem vazios, o site usa o arquivo dados/conteudo.json.
  planilha: {
    trilhas: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOl4YQ7_xujM4w9RlOikh-s2u6qxAlrF60LOpEuVWZXQEpzmfucqOz57U73SfngJZsS8xWH-dgBYWp/pub?gid=1036192118&single=true&output=csv',
    treinamentos: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOl4YQ7_xujM4w9RlOikh-s2u6qxAlrF60LOpEuVWZXQEpzmfucqOz57U73SfngJZsS8xWH-dgBYWp/pub?gid=1693862934&single=true&output=csv',
    categorias: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSOl4YQ7_xujM4w9RlOikh-s2u6qxAlrF60LOpEuVWZXQEpzmfucqOz57U73SfngJZsS8xWH-dgBYWp/pub?gid=1381429638&single=true&output=csv'
  },

  // Pasta do Drive com os documentos publicados (página Biblioteca)
  pastaBiblioteca: '1TxIK02KeiDPWtfO3-sIuIjm7xoLtAzXw',

  // Nota mínima exibida no site
  notaMinima: 70,

  // Contato exibido no rodapé
  contato: 'Dúvidas: procure o NEP ou o NSP do HOSPESC.'
};
