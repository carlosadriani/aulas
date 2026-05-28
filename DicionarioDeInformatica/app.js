document.addEventListener('DOMContentLoaded', () => {
    const catalogGrid = document.getElementById('catalogGrid');
    const searchInput = document.getElementById('searchInput');
    const filterCategory = document.getElementById('filterCategory');
    const sortOrder = document.getElementById('sortOrder');

    // 1. Inicializar Select de Categorias dinamicamente
    function popularCategorias() {
        Object.values(categorias).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterCategory.appendChild(option);
        });
    }

    // 2. Renderizar os Cards na Tela
    function renderCards() {
        catalogGrid.innerHTML = '';
        
        let dadosFiltrados = filtrarEOrdenarDados();

        if (dadosFiltrados.length === 0) {
            catalogGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary);">Nenhum vídeo encontrado.</p>`;
            return;
        }

        dadosFiltrados.forEach(video => {
            const card = document.createElement('article');
            card.className = 'card';
            card.draggable = true; // Habilita o Drag nativo
            card.dataset.id = video.id;

            card.innerHTML = `
                <div class="card-controls">
                    <span class="category-badge">${video.categoria}</span>
                    <div class="action-icons">
                        <i class="fa-solid fa-star ${video.favorito ? 'active' : ''}" onclick="toggleFavorito('${video.id}')"></i>
                        <i class="fa-solid fa-grip-lines" title="Arrastar para reposicionar"></i>
                    </div>
                </div>
                <h3 class="card-title">${video.titulo}</h3>
                <p class="card-description">${video.descricao}</p>
                <a href="${video.url}" target="_blank" class="btn-watch">
                    <i class="fa-solid fa-play"></i> Assistir Vídeo
                </a>
            `;

            adicionarEventosDragAndDrop(card);
            catalogGrid.appendChild(card);
        });
    }

    // 3. Filtros, Busca e Ordenação combinados
    function filtrarEOrdenarDados() {
        const termoBusca = searchInput.value.toLowerCase();
        const categoriaSelecionada = filterCategory.value;
        const ordenacao = sortOrder.value;

        // Filtragem
        let resultado = videos.filter(video => {
            const matchesBusca = video.titulo.toLowerCase().includes(termoBusca) || 
                                 video.descricao.toLowerCase().includes(termoBusca);
            const matchesCategoria = categoriaSelecionada === 'todos' || video.categoria === categoriaSelecionada;
            
            return matchesBusca && matchesCategoria;
        });

        // Ordenação
        if (ordenacao === 'titulo-az') {
            resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        } else if (ordenacao === 'titulo-za') {
            resultado.sort((a, b) => b.titulo.localeCompare(a.titulo));
        } else if (ordenacao === 'favoritos') {
            resultado = resultado.filter(v => v.favorito);
        } else {
            // Ordem personalizada criada pelo Drag & Drop
            resultado.sort((a, b) => a.ordem - b.ordem);
        }

        return resultado;
    }

    // 4. Funcionalidade de Favoritar (Global para acesso inline via string)
    window.toggleFavorito = (id) => {
        const video = videos.find(v => v.id === id);
        if (video) {
            video.favorito = !video.favorito;
            renderCards();
        }
    };

    // 5. Implementação do HTML5 Drag and Drop API
    let dragSrcEl = null;

    function adicionarEventosDragAndDrop(card) {
        card.addEventListener('dragstart', (e) => {
            // Só permite arrastar se estiver na ordenação padrão
            if (sortOrder.value !== 'padrao') {
                e.preventDefault();
                alert("Mude para 'Ordem Personalizada' para reorganizar os cards.");
                return;
            }
            card.classList.add('dragging');
            dragSrcEl = card;
            e.dataTransfer.effectAllowed = 'move';
        });

        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
            
            // Atualiza o array de dados baseado na nova ordem visual do DOM
            const cardsVisuais = Array.from(catalogGrid.querySelectorAll('.card'));
            cardsVisuais.forEach((cardId, index) => {
                const id = cardId.dataset.id;
                const v = videos.find(video => video.id === id);
                if (v) v.ordem = index;
            });
        });

        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            return false;
        });

        card.addEventListener('dragenter', (e) => {
            e.preventDefault();
        });

        card.addEventListener('drop', function(e) {
            e.stopPropagation();
            if (dragSrcEl !== this) {
                // Lógica de inserção visual no DOM para feedback imediato
                const allCards = Array.from(catalogGrid.children);
                const fromIndex = allCards.indexOf(dragSrcEl);
                const toIndex = allCards.indexOf(this);

                if (fromIndex < toIndex) {
                    this.after(dragSrcEl);
                } else {
                    this.before(dragSrcEl);
                }
            }
            return false;
        });
    }

    // Listeners de Eventos da Toolbar
    searchInput.addEventListener('input', renderCards);
    filterCategory.addEventListener('change', renderCards);
    sortOrder.addEventListener('change', renderCards);

    // Inicialização da aplicação
    popularCategorias();
    renderCards();
});