# Educação Permanente – HOSPESC

Site de capacitação nos protocolos do Hospital dos Pescadores (NSP · CCIH · NEP).

## Publicar no GitHub Pages (uma vez)

1. Crie uma conta em github.com com o e-mail do NEP (não use conta pessoal).
2. Crie um repositório **público** chamado `capacitacao`.
3. Em "Add file > Upload files", arraste **todo o conteúdo desta pasta** (index.html, config.js, README.md e as pastas assets e dados) e clique em "Commit changes".
4. Em Settings > Pages, escolha "Deploy from a branch", branch `main`, pasta `/ (root)` e salve.
5. Em 1 a 2 minutos o site fica em `https://<usuario>.github.io/capacitacao/`.

## Atualizar o conteúdo (sem programar)

O conteúdo vem da planilha **Conteúdo do site – NEP** (Google Planilhas):

1. Na planilha: Arquivo > Compartilhar > Publicar na web. Publique as abas **Trilhas**, **Treinamentos** e **Categorias**, cada uma no formato **CSV**.
2. Copie os três links e cole em `config.js`, nos campos `trilhas`, `treinamentos` e `categorias` (no GitHub, abra o arquivo e clique no lápis para editar).
3. Daí em diante, basta editar a planilha. O site mostra as mudanças em até 5 minutos.

Enquanto os links estiverem vazios, o site usa o arquivo `dados/conteudo.json`.

**Nunca coloque dados de profissionais nessa planilha:** ela é pública. O registro de quem fez cada treinamento fica na planilha privada **Controle de Capacitação – NEP**, alimentada pelos quizzes do Google Forms.

## Biblioteca

A página Biblioteca mostra a pasta do Drive **PROTOCOLOS E ROTINAS** (ID em `config.js`). Para a lista aparecer para todos, a pasta precisa estar como "Qualquer pessoa com o link pode ver".

## Links diretos (para QR codes)

- Início: `.../capacitacao/`
- Uma trilha: `.../capacitacao/#/trilha/iras`
- Um treinamento: `.../capacitacao/#/t/IRAS-01`
- Trilha de uma categoria: `.../capacitacao/#/minha/Técnico(a) de enfermagem`
- Biblioteca: `.../capacitacao/#/biblioteca`
