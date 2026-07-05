// Ajuste para a porta onde sua API Node.js está rodando localmente (pelo repositório, porta 3000)
const API_URL = 'http://localhost:3000';

// Inicia o carregamento assim que a página é construída pelo navegador
document.addEventListener('DOMContentLoaded', () => {
    carregarJogos();
});

// Função para buscar a lista de jogos da API
async function carregarJogos() {
    const container = document.getElementById('jogos-container');
    
    try {
        const response = await fetch(`${API_URL}/jogos`);
        
        if (!response.ok) {
            throw new Error('Falha ao conectar com a API');
        }

        const jogos = await response.json();
        
        // Limpa o estado de "Carregando..."
        container.innerHTML = '';

        if (jogos.length === 0) {
            container.innerHTML = '<p class="loading">Nenhum jogo disponível no momento.</p>';
            return;
        }

        // Renderiza os cartões dinamicamente
        jogos.forEach(jogo => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <h3>${jogo.time_mandante} vs ${jogo.time_visitante}</h3>
                <p><strong>Data:</strong> ${new Date(jogo.data_hora).toLocaleString('pt-BR')}</p>
                <p><strong>Estádio:</strong> ${jogo.estadio_nome || 'A definir'}</p>
                <button class="btn" onclick="comprarIngresso(${jogo.id})">Comprar Ingresso</button>
            `;
            container.appendChild(card);
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = `
            <p class="loading" style="color: #e74c3c;">
                Erro ao carregar os jogos. Verifique se a API está rodando em ${API_URL}.
            </p>
        `;
    }
}

// Função para simular a compra batendo na rota POST /ingressos
async function comprarIngresso(jogoId) {
    // Para simplificar, estamos chumbando o ID do usuário 1 e setor 1 (conforme o seed.sql)
    const payload = {
        jogo_id: jogoId,
        usuario_id: 1, 
        setor_id: 1    
    };

    try {
        const response = await fetch(`${API_URL}/ingressos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            alert('Ingresso comprado com sucesso!');
            // Opcional: Recarregar a lista de jogos para atualizar capacidades, se desejar
            // carregarJogos(); 
        } else {
            const errorData = await response.json();
            alert(`Erro ao comprar: ${errorData.message || 'Tente novamente.'}`);
        }
    } catch (error) {
        console.error('Erro na requisição de compra:', error);
        alert('Erro de conexão ao tentar finalizar a compra.');
    }
}