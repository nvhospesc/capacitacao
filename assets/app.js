/* Site de capacitação – NEP/NSP/CCIH HOSPESC */
(function () {
  'use strict';
  var C = window.CONFIG || {};
  var D = { trilhas: [], treinamentos: [], categorias: [] };
  var main = document.getElementById('conteudo');

  /* ---------- utilitários ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function url(u) { u = String(u || '').trim(); return /^https?:\/\//i.test(u) ? u : ''; }
  function ico(n) { return '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#i-' + esc(n) + '"/></svg>'; }
  function lista(v) {
    if (Array.isArray(v)) return v.filter(Boolean);
    return String(v || '').split(/\r?\n|\|/).map(function (s) { return s.trim(); }).filter(Boolean);
  }
  function pares(v) {
    if (Array.isArray(v)) return v.map(function (p) { return Array.isArray(p) ? p : String(p).split('::'); })
      .map(function (p) { return [String(p[0] || '').trim(), String(p[1] || '').trim()]; }).filter(function (p) { return p[0]; });
    return lista(v).map(function (l) { var i = l.indexOf('::'); return i < 0 ? [l, ''] : [l.slice(0, i).trim(), l.slice(i + 2).trim()]; });
  }
  function semAcento(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  var mem = {};
  function ler(k, padrao) { try { var v = localStorage.getItem('nep-' + k); return v ? JSON.parse(v) : padrao; } catch (e) { return k in mem ? mem[k] : padrao; } }
  function gravar(k, v) { mem[k] = v; try { localStorage.setItem('nep-' + k, JSON.stringify(v)); } catch (e) { /* sem armazenamento */ } }
  function toast(t) {
    var el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = t;
    document.body.appendChild(el); setTimeout(function () { el.remove(); }, 2400);
  }

  /* ---------- dados ---------- */
  function csv(texto) {
    var linhas = [], campo = '', linha = [], q = false;
    for (var i = 0; i < texto.length; i++) {
      var c = texto[i];
      if (q) {
        if (c === '"') { if (texto[i + 1] === '"') { campo += '"'; i++; } else q = false; }
        else campo += c;
      } else if (c === '"') q = true;
      else if (c === ',') { linha.push(campo); campo = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && texto[i + 1] === '\n') i++;
        linha.push(campo); linhas.push(linha); linha = []; campo = '';
      } else campo += c;
    }
    if (campo || linha.length) { linha.push(campo); linhas.push(linha); }
    var cab = (linhas.shift() || []).map(function (h) { return h.trim(); });
    return linhas.filter(function (l) { return l.some(function (x) { return x.trim(); }); }).map(function (l) {
      var o = {}; cab.forEach(function (h, j) { o[h] = (l[j] || '').trim(); }); return o;
    });
  }
  function buscar(u) { return fetch(u, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }); }

  function carregar() {
    var p = C.planilha || {};
    var usarPlanilha = p.trilhas && p.treinamentos;
    var local = fetch('dados/conteudo.json', { cache: 'no-store' }).then(function (r) { return r.json(); });
    if (!usarPlanilha) return local;
    return Promise.all([buscar(p.trilhas), buscar(p.treinamentos), p.categorias ? buscar(p.categorias) : Promise.resolve('')])
      .then(function (r) {
        var cats = r[2] ? csv(r[2]).map(function (x) { return x.categoria; }).filter(Boolean) : [];
        return { trilhas: csv(r[0]), treinamentos: csv(r[1]), categorias: cats };
      })
      .catch(function () { return local; });
  }

  function normalizar(d) {
    D.trilhas = (d.trilhas || []).filter(function (t) { return t.id; })
      .map(function (t) { return { id: String(t.id).trim(), titulo: t.titulo, descricao: t.descricao, icone: t.icone || 'book', cor: /^#[0-9a-f]{3,8}$/i.test(t.cor) ? t.cor : '#0B5FC4', ordem: Number(t.ordem) || 99 }; })
      .sort(function (a, b) { return a.ordem - b.ordem; });
    D.treinamentos = (d.treinamentos || []).filter(function (t) { return t.codigo; }).map(function (t) {
      return {
        codigo: String(t.codigo).trim(), trilha: String(t.trilha || '').trim(), titulo: t.titulo, resumo: t.resumo, pop: t.pop,
        versao: t.versao, publico: String(t.publico || '').split(';').map(function (s) { return s.trim(); }).filter(Boolean),
        tempo: Number(t.tempo) || 0, ativo: String(t.status || '').trim().toLowerCase() === 'ativo', atualizado: t.atualizado,
        porque: t.porque, pontos: lista(t.pontos), faca: lista(t.faca), naofaca: lista(t.naofaca),
        consulta: pares(t.consulta), cards: pares(t.cards), quiz: url(t.quiz_url), popUrl: url(t.pop_url)
      };
    });
    D.categorias = (d.categorias && d.categorias.length) ? d.categorias : [];
  }

  /* ---------- progresso (só neste aparelho) ---------- */
  function feitos() { return ler('feitos', {}); }
  function feito(cod) { return !!feitos()[cod]; }
  function marcar(cod, v) { var f = feitos(); if (v) f[cod] = new Date().toISOString().slice(0, 10); else delete f[cod]; gravar('feitos', f); }
  function categoria() { return ler('categoria', ''); }
  function obrigatorio(t, cat) { return !cat || t.publico.indexOf('TODAS') >= 0 || t.publico.indexOf(cat) >= 0; }
  function trilha(id) { return D.trilhas.filter(function (t) { return t.id === id; })[0]; }
  function daTrilha(id) { return D.treinamentos.filter(function (t) { return t.trilha === id; }); }
  function progresso(lst) {
    var at = lst.filter(function (t) { return t.ativo; });
    var ok = at.filter(function (t) { return feito(t.codigo); }).length;
    return { ok: ok, total: at.length, pct: at.length ? Math.round(ok * 100 / at.length) : 0 };
  }

  /* ---------- componentes ---------- */
  function cardTrilha(tr, cat) {
    var lst = daTrilha(tr.id).filter(function (t) { return obrigatorio(t, cat); });
    var pr = progresso(lst);
    var min = lst.reduce(function (s, t) { return s + (t.ativo ? t.tempo : 0); }, 0);
    return '<a class="card trilha" style="--cor:' + esc(tr.cor) + '" href="#/trilha/' + encodeURIComponent(tr.id) + '">' +
      '<div class="ico">' + ico(tr.icone) + '</div>' +
      '<h3>' + esc(tr.titulo) + '</h3><p>' + esc(tr.descricao) + '</p>' +
      '<div class="meta"><span>' + ico('file') + lst.length + ' treinamento' + (lst.length === 1 ? '' : 's') + '</span>' +
      (min ? '<span>' + ico('clock') + min + ' min</span>' : '') +
      '<span>' + (pr.total ? pr.ok + '/' + pr.total + ' concluídos' : 'Em preparação') + '</span></div>' +
      '<div class="prog" role="progressbar" aria-label="Progresso" aria-valuenow="' + pr.pct + '" aria-valuemin="0" aria-valuemax="100"><i style="width:' + pr.pct + '%"></i></div></a>';
  }
  function itemTreino(t, cor) {
    var est = !t.ativo ? '<span class="estado breve">Em breve</span>' : feito(t.codigo) ? '<span class="estado feito">' + ico('check') + ' Concluído</span>' : '<span class="estado novo">Disponível</span>';
    return '<a class="card item' + (t.ativo ? '' : ' inativo') + '" style="--cor:' + esc(cor || '#0B5FC4') + '" href="#/t/' + encodeURIComponent(t.codigo) + '">' +
      '<span class="cod">' + esc(t.codigo) + '</span><span class="tx"><strong>' + esc(t.titulo) + '</strong><small>' + esc(t.pop) + (t.tempo && t.ativo ? ' · ' + t.tempo + ' min' : '') + '</small></span>' + est + '</a>';
  }
  function chipsCategoria(atual, destino) {
    return '<div class="chips" role="group" aria-label="Categoria profissional">' + D.categorias.map(function (c) {
      return '<button class="chip' + (c === atual ? ' sel' : '') + '" data-cat="' + esc(c) + '" data-destino="' + esc(destino) + '" aria-pressed="' + (c === atual) + '">' + esc(c) + '</button>';
    }).join('') + '</div>';
  }

  /* ---------- páginas ---------- */
  function pInicio() {
    var cat = categoria();
    var ativos = D.treinamentos.filter(function (t) { return t.ativo; });
    var novos = ativos.slice().sort(function (a, b) { return String(b.atualizado).localeCompare(String(a.atualizado)); }).slice(0, 3);
    return '<section class="hero"><span class="eyebrow">NSP · CCIH · NEP</span>' +
      '<h1>Capacitação nos protocolos do Hospital dos Pescadores</h1>' +
      '<p>Resumos práticos dos POPs, consulta rápida e quiz de cada treinamento. Faça pelo celular, no seu tempo.</p>' +
      '<button class="hero-busca" data-acao="busca">' + ico('search') + '<span>Buscar um tema, POP ou procedimento…</span></button></section>' +
      '<section class="secao"><div class="secao-cab"><div><h2>Qual é a sua categoria?</h2><p class="sub">Mostramos primeiro os treinamentos obrigatórios para você.</p></div></div>' +
      chipsCategoria(cat, 'minha') + '</section>' +
      (novos.length ? '<section class="secao"><div class="secao-cab"><h2>Novidades</h2></div><div class="lista">' +
        novos.map(function (t) { var tr = trilha(t.trilha); return itemTreino(t, tr && tr.cor); }).join('') + '</div></section>' : '') +
      '<section class="secao"><div class="secao-cab"><h2>Trilhas</h2><a href="#/trilhas">Ver todas ' + ico('arrow') + '</a></div><div class="grade">' +
      D.trilhas.map(function (t) { return cardTrilha(t, ''); }).join('') + '</div></section>';
  }
  function pTrilhas() {
    return '<h1>Trilhas de capacitação</h1><p class="sub">Cada trilha reúne os treinamentos de um tema. Os treinamentos "em breve" ainda estão em preparação pelo NEP.</p>' +
      '<div class="grade" style="margin-top:20px">' + D.trilhas.map(function (t) { return cardTrilha(t, ''); }).join('') + '</div>';
  }
  function pTrilha(id) {
    var tr = trilha(id); if (!tr) return pNaoEncontrado();
    var lst = daTrilha(id), pr = progresso(lst);
    return '<a class="voltar" href="#/trilhas">' + ico('back') + ' Trilhas</a>' +
      '<div class="card pag-cab" style="--cor:' + esc(tr.cor) + '"><div class="linha"><div class="ico" style="--cor:' + esc(tr.cor) + '">' + ico(tr.icone) + '</div><div style="flex:1">' +
      '<h1>' + esc(tr.titulo) + '</h1><p class="sub">' + esc(tr.descricao) + '</p>' +
      '<div class="prog" style="--cor:' + esc(tr.cor) + '"><i style="width:' + pr.pct + '%"></i></div>' +
      '<p class="sub" style="margin-top:6px;font-size:.85rem">' + pr.ok + ' de ' + pr.total + ' treinamentos disponíveis concluídos neste aparelho</p></div></div></div>' +
      '<div class="lista">' + lst.map(function (t) { return itemTreino(t, tr.cor); }).join('') + '</div>';
  }
  function pMinha() {
    var cat = categoria();
    var corpo = '';
    if (cat) {
      var obr = D.treinamentos.filter(function (t) { return obrigatorio(t, cat); });
      var pr = progresso(obr);
      corpo = '<div class="card bloco"><h2>' + esc(cat) + '</h2><p class="sub">' + pr.ok + ' de ' + pr.total + ' treinamentos disponíveis concluídos · ' + obr.length + ' no total para a sua categoria</p>' +
        '<div class="prog"><i style="width:' + pr.pct + '%"></i></div></div>' +
        D.trilhas.map(function (tr) {
          var l = obr.filter(function (t) { return t.trilha === tr.id; });
          if (!l.length) return '';
          return '<section class="secao"><div class="secao-cab"><h2 style="display:flex;gap:10px;align-items:center"><span class="ico" style="--cor:' + esc(tr.cor) + ';width:34px;height:34px;font-size:1.1rem">' + ico(tr.icone) + '</span>' + esc(tr.titulo) + '</h2></div><div class="lista">' +
            l.map(function (t) { return itemTreino(t, tr.cor); }).join('') + '</div></section>';
        }).join('');
    } else {
      corpo = '<div class="card vazio"><div class="ico" style="--cor:#0B5FC4">' + ico('users') + '</div><p>Escolha sua categoria acima para ver seus treinamentos obrigatórios.</p></div>';
    }
    return '<h1>Minha categoria</h1><p class="sub">Escolha sua categoria profissional. A escolha fica salva neste aparelho.</p>' +
      '<div class="secao" style="margin-top:16px">' + chipsCategoria(cat, 'minha') + '</div>' + corpo;
  }
  function pTreino(cod) {
    var t = D.treinamentos.filter(function (x) { return x.codigo === cod; })[0];
    if (!t) return pNaoEncontrado();
    var tr = trilha(t.trilha) || { cor: '#0B5FC4', titulo: 'Trilhas', id: '' };
    var cab = '<a class="voltar" href="#/trilha/' + encodeURIComponent(tr.id) + '">' + ico('back') + ' ' + esc(tr.titulo) + '</a>' +
      '<div class="card pag-cab" style="--cor:' + esc(tr.cor) + '"><span class="badge" style="background:color-mix(in srgb,' + esc(tr.cor) + ' 14%,transparent);color:' + esc(tr.cor) + '">' + esc(t.codigo) + '</span>' +
      '<h1 style="margin-top:10px">' + esc(t.titulo) + '</h1>' + (t.resumo ? '<p class="sub">' + esc(t.resumo) + '</p>' : '') +
      '<div class="badges"><span class="badge">' + ico('file') + esc(t.pop) + (t.versao ? ' · v' + esc(t.versao) : '') + '</span>' +
      (t.tempo ? '<span class="badge">' + ico('clock') + t.tempo + ' min</span>' : '') +
      '<span class="badge">' + ico('users') + esc(t.publico.indexOf('TODAS') >= 0 ? 'Todos os profissionais' : t.publico.join(', ')) + '</span></div></div>';
    var popBtn = '<a class="btn btn-sec" target="_blank" rel="noopener" href="' + esc(t.popUrl || '#/biblioteca') + '">' + ico('file') + ' Abrir o documento completo</a>';
    if (!t.ativo) {
      return cab + '<div class="card vazio"><div class="ico" style="--cor:' + esc(tr.cor) + '">' + ico('clock') + '</div><h2>Treinamento em preparação</h2>' +
        '<p>O NEP está preparando este conteúdo. Enquanto isso, consulte o documento na Biblioteca.</p><div style="max-width:320px;margin:auto">' + popBtn + '</div></div>';
    }
    var blocos = '';
    if (t.porque) blocos += '<section class="card bloco"><h2>Por que importa</h2><div class="callout">' + esc(t.porque) + '</div></section>';
    if (t.pontos.length) blocos += '<section class="card bloco"><h2>Pontos-chave</h2><ol class="pontos">' + t.pontos.map(function (p) { return '<li><span>' + esc(p) + '</span></li>'; }).join('') + '</ol></section>';
    if (t.faca.length || t.naofaca.length) blocos += '<section class="card bloco"><h2>Na prática</h2><div class="duas">' +
      '<div class="col-faca"><h3>Faça</h3><ul>' + t.faca.map(function (p) { return '<li>' + ico('check') + '<span>' + esc(p) + '</span></li>'; }).join('') + '</ul></div>' +
      '<div class="col-nao"><h3>Não faça</h3><ul>' + t.naofaca.map(function (p) { return '<li>' + ico('x') + '<span>' + esc(p) + '</span></li>'; }).join('') + '</ul></div></div></section>';
    if (t.consulta.length) blocos += '<section class="card bloco"><h2>Consulta rápida</h2><div style="overflow-x:auto"><table class="tabela"><thead><tr><th>Item</th><th>Conduta</th></tr></thead><tbody>' +
      t.consulta.map(function (p) { return '<tr><td>' + esc(p[0]) + '</td><td>' + esc(p[1]) + '</td></tr>'; }).join('') + '</tbody></table></div></section>';
    if (t.cards.length) blocos += '<section class="card bloco"><h2>Revisão rápida</h2><p class="sub">Toque no cartão para ver a resposta.</p><div class="flips">' +
      t.cards.map(function (p) { return '<button class="flip" aria-pressed="false"><div class="flip-in"><div class="flip-f"><small>Pergunta</small><span>' + esc(p[0]) + '</span><small>Toque para virar</small></div><div class="flip-v"><small>Resposta</small><span>' + esc(p[1]) + '</span><small></small></div></div></button>'; }).join('') + '</div></section>';
    blocos += '<section class="card bloco" id="quiz-area" hidden></section>';
    var ok = feito(t.codigo);
    var lateral = '<aside class="lateral"><div class="card acao"><h3>Quiz do treinamento</h3>' +
      (t.quiz ? '<a class="btn btn-pri" href="' + esc(t.quiz) + '" target="_blank" rel="noopener">' + ico('play') + ' Fazer o quiz</a>' +
        '<button class="btn btn-sec" style="margin-top:8px" data-acao="quiz-aqui" data-url="' + esc(t.quiz) + '">Responder nesta página</button>'
        : '<span class="btn btn-pri" aria-disabled="true">' + ico('play') + ' Quiz em configuração</span>') +
      '<p>Use seu nome e matrícula como estão no cadastro do hospital. Nota mínima: ' + esc(C.notaMinima || 70) + '%. É o quiz que conta como registro oficial.</p></div>' +
      '<div class="card acao">' + popBtn + '</div>' +
      '<div class="card acao"><button class="btn ' + (ok ? 'btn-ok' : 'btn-sec') + '" data-acao="concluir" data-cod="' + esc(t.codigo) + '" aria-pressed="' + ok + '">' + ico('check') + (ok ? ' Concluído neste aparelho' : ' Marcar como concluído') + '</button>' +
      '<p>Serve só para acompanhar seu progresso aqui no site.</p></div></aside>';
    return cab + '<div class="treino"><div>' + blocos + '</div>' + lateral + '</div>';
  }
  function pBiblioteca() {
    var id = encodeURIComponent(C.pastaBiblioteca || '');
    return '<h1>Biblioteca de documentos</h1><p class="sub">POPs, protocolos, rotinas e impressos em vigor no HOSPESC, sempre na versão mais recente.</p>' +
      '<div class="card bloco"><iframe class="drive" title="Documentos publicados" src="https://drive.google.com/embeddedfolderview?id=' + id + '#list" loading="lazy"></iframe>' +
      '<p style="margin-top:12px"><a class="btn btn-sec" style="width:auto" target="_blank" rel="noopener" href="https://drive.google.com/drive/folders/' + id + '">' + ico('book') + ' Abrir a pasta no Google Drive</a></p>' +
      '<div class="aviso">Se a lista não aparecer, a pasta precisa estar compartilhada como "Qualquer pessoa com o link pode ver". Use sempre a versão da biblioteca; cópias impressas antigas podem estar desatualizadas.</div></div>';
  }
  function pNaoEncontrado() { return '<div class="card vazio"><h2>Página não encontrada</h2><p><a href="#/">Voltar ao início</a></p></div>'; }

  /* ---------- roteador ---------- */
  function rota() {
    var h = decodeURIComponent((location.hash || '#/').slice(1));
    var p = h.split('/').filter(Boolean);
    var html, ativo = 'inicio';
    if (!p.length) html = pInicio();
    else if (p[0] === 'trilhas') { html = pTrilhas(); ativo = 'trilhas'; }
    else if (p[0] === 'trilha') { html = pTrilha(p[1]); ativo = 'trilhas'; }
    else if (p[0] === 't') { html = pTreino(p[1]); ativo = 'trilhas'; }
    else if (p[0] === 'minha') { if (p[1]) gravar('categoria', p[1]); html = pMinha(); ativo = 'minha'; }
    else if (p[0] === 'biblioteca') { html = pBiblioteca(); ativo = 'biblioteca'; }
    else html = pNaoEncontrado();
    main.innerHTML = html;
    document.querySelectorAll('[data-rota]').forEach(function (a) { a.classList.toggle('ativo', a.getAttribute('data-rota') === ativo); });
    window.scrollTo(0, 0);
    var h1 = main.querySelector('h1'); document.title = (h1 ? h1.textContent + ' – ' : '') + 'Educação Permanente HOSPESC';
  }

  /* ---------- busca ---------- */
  var dlg = document.getElementById('dlgBusca'), campo = document.getElementById('campoBusca'), res = document.getElementById('resultadosBusca');
  function abrirBusca() { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); campo.value = ''; mostrarBusca(''); campo.focus(); }
  function destacar(txt, termos) {
    var s = esc(txt);
    termos.forEach(function (t) {
      if (t.length < 2) return;
      var base = semAcento(txt), out = '', i = 0, j;
      // destaca respeitando acentos: mapeia posições no texto sem acento
      j = base.indexOf(t);
      if (j < 0) return;
      out = esc(txt.slice(0, j)) + '<mark>' + esc(txt.slice(j, j + t.length)) + '</mark>' + esc(txt.slice(j + t.length));
      s = out; i++;
    });
    return s;
  }
  function mostrarBusca(q) {
    var termos = semAcento(q).split(/\s+/).filter(function (x) { return x.length > 1; });
    if (!termos.length) { res.innerHTML = '<div class="nada">Digite um tema, código ou número de POP.</div>'; return; }
    var achados = D.treinamentos.map(function (t) {
      var tr = trilha(t.trilha);
      var alvo = semAcento([t.codigo, t.titulo, t.resumo, t.pop, tr && tr.titulo, t.pontos.join(' '), t.faca.join(' '), t.naofaca.join(' '), t.consulta.map(function (p) { return p.join(' '); }).join(' ')].join(' '));
      var nota = termos.every(function (x) { return alvo.indexOf(x) >= 0; }) ? (semAcento(t.titulo).indexOf(termos[0]) >= 0 ? 2 : 1) + (t.ativo ? 1 : 0) : 0;
      return { t: t, tr: tr, nota: nota };
    }).filter(function (x) { return x.nota; }).sort(function (a, b) { return b.nota - a.nota; }).slice(0, 12);
    res.innerHTML = achados.length ? achados.map(function (x) {
      return '<a href="#/t/' + encodeURIComponent(x.t.codigo) + '"><strong>' + destacar(x.t.titulo, termos) + '</strong><small>' + esc(x.t.codigo) + ' · ' + esc(x.t.pop) + (x.tr ? ' · ' + esc(x.tr.titulo) : '') + (x.t.ativo ? '' : ' · em breve') + '</small></a>';
    }).join('') : '<div class="nada">Nada encontrado. Tente outra palavra ou veja a Biblioteca.</div>';
  }

  /* ---------- eventos ---------- */
  document.addEventListener('click', function (e) {
    var el = e.target.closest('[data-acao],[data-cat],.flip,#abrirBusca,#fecharBusca,.busca-res a');
    if (!el) return;
    if (el.id === 'abrirBusca' || el.getAttribute('data-acao') === 'busca') { abrirBusca(); return; }
    if (el.id === 'fecharBusca') { dlg.close(); return; }
    if (el.closest('.busca-res')) { dlg.close(); return; }
    if (el.hasAttribute('data-cat')) {
      var c = el.getAttribute('data-cat'); gravar('categoria', c);
      if (location.hash === '#/minha') rota(); else location.hash = '#/minha';
      return;
    }
    if (el.classList.contains('flip')) { el.classList.toggle('virado'); el.setAttribute('aria-pressed', el.classList.contains('virado')); return; }
    var a = el.getAttribute('data-acao');
    if (a === 'concluir') {
      var cod = el.getAttribute('data-cod'), v = !feito(cod); marcar(cod, v);
      toast(v ? 'Marcado como concluído neste aparelho' : 'Marcação removida'); rota();
    } else if (a === 'quiz-aqui') {
      var area = document.getElementById('quiz-area'), u = url(el.getAttribute('data-url'));
      if (!u) return;
      var emb = u + (u.indexOf('?') >= 0 ? '&' : '?') + 'embedded=true';
      area.hidden = false;
      area.innerHTML = '<h2>Quiz</h2><iframe class="quiz-frame" title="Quiz do treinamento" src="' + esc(emb) + '"></iframe>';
      area.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  campo.addEventListener('input', function () { mostrarBusca(campo.value); });
  document.addEventListener('keydown', function (e) {
    if ((e.key === '/' || (e.key === 'k' && (e.ctrlKey || e.metaKey))) && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); abrirBusca(); }
  });
  window.addEventListener('hashchange', rota);

  /* ---------- início ---------- */
  document.getElementById('tit').textContent = C.titulo || 'Educação Permanente';
  document.getElementById('sub').textContent = C.subtitulo || '';
  document.getElementById('contato').textContent = C.contato || '';
  main.innerHTML = '<div class="carregando">Carregando…</div>';
  carregar().then(function (d) { normalizar(d); rota(); })
    .catch(function () { main.innerHTML = '<div class="card vazio"><h2>Não foi possível carregar o conteúdo</h2><p>Verifique a conexão e tente novamente.</p></div>'; });
})();
