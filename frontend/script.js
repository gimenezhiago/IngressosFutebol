const API_URL = 'http://localhost:3000';
// Simula o usuário logado (baseado no seed.sql que inseriu o Carlos Silva com ID 1)
const USUARIO_LOGADO_ID = 1; 

document.addEventListener('DOMContentLoaded', () => {
    carregarJogos();
});

// Formata data e dinheiro
const formatarData = (dataString) => new Date(dataString).toLocaleString('pt-BR');
const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

// 1. CARREGAR JOGOS NA TELA PRINCIPAL
async function carregarJogos() {
    const container = document.getElementById('jogos-container');
    
    try {
        const response = await fetch(`${API_URL}/jogos`);
        if (!response.ok) throw new Error('Falha ao buscar jogos');
        const jogos = await response.json();
        
        container.innerHTML = '';
        if (jogos.length === 0) {
            container.innerHTML = '<p class="loading">Nenhum jogo disponível.</p>';
            return;
        }

        jogos.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${jogo.time_mandante} vs ${jogo.time_visitante}</h3>
                <p class="text-muted">${jogo.campeonato}</p>
                <div class="spacer"></div>
                <p><strong>🗓️ Data:</strong> ${formatarData(jogo.data_hora)}</p>
                <p><strong>🏟️ Estádio:</strong> ${jogo.estadio_nome} (${jogo.cidade})</p>
                <button class="btn" onclick="abrirDetalhesJogo(${jogo.id})">Ver Ingressos</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="loading" style="color: red;">Erro ao carregar a API. O servidor está rodando?</p>';
    }
}

// 2. BUSCAR DETALHES DO JOGO E SETORES (AGORA COM FILTRO DE DUPLICATAS)
async function abrirDetalhesJogo(jogoId) {
    const modal = document.getElementById('modal-compra');
    const titulo = document.getElementById('modal-jogo-titulo');
    const info = document.getElementById('modal-jogo-info');
    const setoresContainer = document.getElementById('modal-setores-container');

    // Abre o modal
    modal.style.display = 'block';
    document.body.classList.add('travado'); 

    titulo.innerText = 'Carregando detalhes...';
    info.innerText = '';
    setoresContainer.innerHTML = '<p class="text-muted">Buscando setores...</p>';

    try {
        const response = await fetch(`${API_URL}/jogos/${jogoId}/detalhes`);
        if (!response.ok) throw new Error('Falha ao buscar detalhes');
        const jogo = await response.json();

        titulo.innerText = `${jogo.time_mandante} vs ${jogo.time_visitante}`;
        info.innerText = `${jogo.campeonato} | ${formatarData(jogo.data_hora)} | ${jogo.estadio_nome}`;
        
        setoresContainer.innerHTML = '';

        if (!jogo.setores || jogo.setores.length === 0) {
            setoresContainer.innerHTML = '<p>Nenhum setor cadastrado para este estádio.</p>';
            return;
        }

        // 👇 A MÁGICA ACONTECE AQUI: Filtramos a lista para remover os repetidos
        const setoresUnicos = [];
        const idsProcessados = new Set();

        jogo.setores.forEach(setor => {
            // Se o ID do setor ainda não foi visto, nós o adicionamos na lista limpa
            if (!idsProcessados.has(setor.id)) {
                idsProcessados.add(setor.id);
                setoresUnicos.push(setor);
            }
        });
        // 👆 FIM DO FILTRO

        // Agora usamos a nossa lista limpa (setoresUnicos) para criar os botões na tela
        setoresUnicos.forEach(setor => {
            const esgotado = setor.quantidade_vagas <= 0;
            const setorItem = document.createElement('div');
            setorItem.className = 'setor-item';
            
            setorItem.innerHTML = `
                <div class="setor-info">
                    <h4>${setor.nome}</h4>
                    <p class="text-muted">Preço: ${formatarMoeda(setor.preco_base)}</p>
                    <p class="text-muted">${esgotado ? 'Esgotado' : `Vagas: ${setor.quantidade_vagas}`}</p>
                </div>
                <div class="setor-acao">
                    <button class="btn" 
                        ${esgotado ? 'disabled' : ''} 
                        onclick="comprar(${jogo.id}, ${setor.id}, '${setor.nome}')">
                        ${esgotado ? 'Esgotado' : 'Comprar'}
                    </button>
                </div>
            `;
            setoresContainer.appendChild(setorItem);
        });

    } catch (error) {
        console.error(error);
        setoresContainer.innerHTML = '<p style="color:red;">Erro ao carregar setores.</p>';
    }
}

// 3. EFETUAR A COMPRA (TRANSAÇÃO ATÔMICA DA SUA API)
async function comprar(jogoId, setorId, nomeSetor) {
    // Confirmação para o usuário
    if (!confirm(`Deseja confirmar a compra no setor ${nomeSetor}?`)) return;

    const payload = {
        usuario_id: USUARIO_LOGADO_ID,
        jogo_id: jogoId,
        setor_id: setorId
    };

    try {
        const response = await fetch(`${API_URL}/ingressos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const ingressoCriado = await response.json();
            alert(`✅ Compra realizada com sucesso!\nIngresso #${ingressoCriado.id} garantido!`);
            
            // Recarrega os dados do modal para atualizar a contagem de vagas
            abrirDetalhesJogo(jogoId); 
            // Recarrega a tela principal em segundo plano
            carregarJogos(); 
        } else {
            const errorData = await response.json();
            // Pega o erro de conflito (ex: usuário já comprou neste setor) ou outros erros que sua API envia
            alert(`❌ Não foi possível comprar:\n${errorData.message}`);
        }
    } catch (error) {
        console.error('Erro na compra:', error);
        alert('Erro de conexão ao tentar finalizar a compra.');
    }
}

// 4. FECHAR O MODAL
function fecharModal() {
    const modal = document.getElementById('modal-compra');
    
    // 1. Esconde a janela do modal
    modal.style.display = 'none';
    
    // 2. Remove a trava da página principal (destrava o scroll)
    document.body.classList.remove('travado');
}

// Fecha o modal se clicar fora da caixa branca (no fundo escuro)
window.addEventListener('click', function(event) {
    const modal = document.getElementById('modal-compra');
    if (event.target === modal) {
        fecharModal();
    }
});

// BÔNUS: Fecha o modal se o usuário apertar a tecla "ESC" no teclado
window.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        fecharModal();
    }
});