const cart = {
    items: [],
    total: 0,

    // Inicializar o carrinho
    init: function () {
        console.log('Inicializando o carrinho...');
        // Carregar itens do localStorage se existirem
        this.loadCart();

        // Atualizar contador do carrinho
        this.updateCartCount();

        // Adicionar evento para abrir/fechar o modal do carrinho
        const cartIcon = document.querySelector('.carrinho');
        if (cartIcon) {
            console.log('Ícone do carrinho encontrado, adicionando evento de clique');
            cartIcon.addEventListener('click', this.toggleCartModal.bind(this));
        } else {
            console.error('Elemento .carrinho não encontrado!');
        }

        // Adicionar eventos para os botões "Adicionar ao Carrinho"
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', this.handleAddToCartClick.bind(this));
        });
    },

    // Carregar itens do carrinho do localStorage
    loadCart: function () {
        const savedCart = localStorage.getItem('bneCart');
        if (savedCart) {
            try {
                const cartData = JSON.parse(savedCart);
                this.items = cartData.items || [];
                this.total = cartData.total || 0;
                console.log('Carrinho carregado com sucesso:', this.items.length, 'itens');
            } catch (e) {
                console.error('Erro ao carregar o carrinho:', e);
                this.items = [];
                this.total = 0;
                localStorage.removeItem('bneCart');
            }
        }
    },

    // Salvar carrinho no localStorage
    saveCart: function () {
        localStorage.setItem('bneCart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    },

    // Adicionar item ao carrinho
    addItem: function (item) {
        console.log('Adicionando item ao carrinho:', item);
        if (!item || !item.id) {
            console.error('Tentativa de adicionar item inválido ao carrinho');
            return;
        }

        // Verificar se o item já existe no carrinho
        const existingItemIndex = this.items.findIndex(i => i && i.id === item.id);

        if (existingItemIndex !== -1) {
            // Se o item já existe, aumentar a quantidade
            this.items[existingItemIndex].quantity += item.quantity;
        } else {
            // Caso contrário, adicionar o novo item
            this.items.push(item);
        }

        // Recalcular o total
        this.calculateTotal();

        // Salvar e atualizar UI
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();

        // Mostrar notificação
        this.showNotification('Produto adicionado ao carrinho!');
    },

    // Remover item do carrinho
    removeItem: function (id) {
        if (!id) return;

        this.items = this.items.filter(item => item && item.id !== id);
        this.calculateTotal();
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
    },

    // Atualizar quantidade de um item
    updateQuantity: function (id, quantity) {
        if (!id) return;

        const itemIndex = this.items.findIndex(item => item && item.id === id);
        if (itemIndex !== -1) {
            if (quantity <= 0) {
                // Se a quantidade for zero ou negativa, remover o item
                this.removeItem(id);
            } else {
                // Caso contrário, atualizar a quantidade
                this.items[itemIndex].quantity = quantity;
                this.calculateTotal();
                this.saveCart();
                this.updateCartModal();
            }
        }
    },

    // Calcular total do carrinho
    calculateTotal: function () {
        this.total = this.items.reduce((total, item) => {
            if (!item) return total;
            // Verificar se price é um número válido
            const itemPrice = parseFloat(item.price) || 0;
            const quantity = item.quantity || 0;
            return total + (itemPrice * quantity);
        }, 0);
    },

    // Atualizar contador de itens no ícone do carrinho
    updateCartCount: function () {
        // Criar ou atualizar o contador
        let counter = document.querySelector('.cart-counter');
        const totalItems = this.items.reduce((count, item) => {
            if (!item) return count;
            return count + (item.quantity || 0);
        }, 0);

        if (!counter) {
            counter = document.createElement('span');
            counter.className = 'cart-counter';
            const cartIcon = document.querySelector('.carrinho');
            if (cartIcon) {
                cartIcon.appendChild(counter);
            }
        }

        counter.textContent = totalItems;
        // Ocultar contador se não houver itens
        counter.style.display = totalItems > 0 ? 'block' : 'none';
    },

    // Lidar com clique no botão "Adicionar ao Carrinho"
    handleAddToCartClick: function (event) {
        const button = event.currentTarget;
        console.log('Clique em adicionar ao carrinho', button);

        // Obter dados do produto dos atributos data-*
        const id = button.getAttribute('data-id');
        const name = button.getAttribute('data-name');
        const priceStr = button.getAttribute('data-price');
        const imgSrc = button.getAttribute('data-img');

        // Verificar se todos os atributos necessários estão presentes
        if (!id || !name || !priceStr || !imgSrc) {
            console.error('Erro: Botão de adicionar ao carrinho não tem todos os atributos necessários.');
            console.error('Atributos encontrados:', { id, name, price: priceStr, img: imgSrc });
            alert('Erro ao adicionar produto ao carrinho: dados incompletos.');
            return;
        }

        // Garantir que o preço seja um número válido
        let price;
        try {
            price = parseFloat(priceStr.replace(',', '.'));
            if (isNaN(price)) throw new Error('Preço inválido');
        } catch (e) {
            console.error('Erro ao converter preço:', priceStr);
            alert('Erro ao adicionar produto ao carrinho: preço inválido.');
            return;
        }

        const item = {
            id: id,
            name: name,
            price: price,
            imgSrc: imgSrc,
            quantity: 1
        };

        this.addItem(item);
    },

    // Alternar visibilidade do modal do carrinho
    toggleCartModal: function () {
        console.log('Alternando visibilidade do modal do carrinho');
        let cartModal = document.getElementById('cart-modal');

        if (!cartModal) {
            // Criar o modal se não existir
            cartModal = document.createElement('div');
            cartModal.id = 'cart-modal';
            document.body.appendChild(cartModal);
        }

        // Atualizar o conteúdo ANTES de mostrar/esconder
        this.updateCartModal();

        if (cartModal.classList.contains('show')) {
            // Fechar o modal
            cartModal.classList.remove('show');
            setTimeout(() => {
                cartModal.style.display = 'none';
            }, 300);
        } else {
            // Abrir o modal
            cartModal.style.display = 'block';
            // Pequeno atraso para garantir que o display: block seja aplicado antes da animação
            setTimeout(() => {
                cartModal.classList.add('show');
            }, 10);
        }
    },

    // Atualizar conteúdo do modal do carrinho
    updateCartModal: function () {
        const cartModal = document.getElementById('cart-modal');
        if (!cartModal) return;

        // Gerar o HTML para o modal
        let content = `
            <div class="cart-modal-content">
                <div class="cart-header">
                    <h2>Carrinho de Compras</h2>
                    <button class="close-cart-btn">&times;</button>
                </div>
                <div class="cart-items">
        `;

        if (!this.items || this.items.length === 0) {
            content += `<p class="empty-cart-message">Seu carrinho está vazio</p>`;
        } else {
            this.items.forEach(item => {
                // Verificar se o item tem todas as propriedades necessárias
                if (!item) return;

                const price = parseFloat(item.price) || 0;
                const formattedPrice = price.toFixed(2).replace('.', ',');
                const name = item.name || 'Produto sem nome';
                const imgSrc = item.imgSrc || 'img/placeholder.jpg';
                const quantity = item.quantity || 1;
                const id = item.id || 'unknown';

                content += `
                    <div class="cart-item" data-id="${id}">
                        <div class="cart-item-img">
                            <img src="${imgSrc}" alt="${name}">
                        </div>
                        <div class="cart-item-details">
                            <h4>${name}</h4>
                            <div class="cart-item-price">R$ ${formattedPrice}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease">-</button>
                                <span>${quantity}</span>
                                <button class="quantity-btn increase">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" data-id="${id}">🗑️</button>
                    </div>
                `;
            });
        }

        content += `
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span>R$ ${(parseFloat(this.total) || 0).toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button class="checkout-btn" ${(!this.items || this.items.length === 0) ? 'disabled' : ''}>Finalizar Compra</button>
                    <button class="continue-shopping-btn">Continuar Comprando</button>
                </div>
            </div>
        `;

        cartModal.innerHTML = content;

        // Adicionar eventos para os botões do modal
        const closeBtn = cartModal.querySelector('.close-cart-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', this.toggleCartModal.bind(this));
        }

        const continueBtn = cartModal.querySelector('.continue-shopping-btn');
        if (continueBtn) {
            continueBtn.addEventListener('click', this.toggleCartModal.bind(this));
        }

        // Eventos para os botões de remover item
        cartModal.querySelectorAll('.remove-item-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                this.removeItem(id);
            });
        });

        // Eventos para os botões de aumentar/diminuir quantidade
        cartModal.querySelectorAll('.quantity-btn.increase').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.currentTarget.closest('.cart-item');
                if (!cartItem) return;

                const id = cartItem.getAttribute('data-id');
                const item = this.items.find(item => item && item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });

        cartModal.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.currentTarget.closest('.cart-item');
                if (!cartItem) return;

                const id = cartItem.getAttribute('data-id');
                const item = this.items.find(item => item && item.id === id);
                if (item && item.quantity > 1) {
                    this.updateQuantity(id, item.quantity - 1);
                } else if (item) {
                    this.removeItem(id);
                }
            });
        });

        // Evento para finalizar compra
        const checkoutBtn = cartModal.querySelector('.checkout-btn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items && this.items.length > 0) {
                    alert('Redirecionando para página de checkout...');
                    // Aqui você pode redirecionar para a página de checkout
                    // window.location.href = 'checkout.html';
                }
            });
        }
    },

    // Exibir notificação
    showNotification: function (message) {
        let notification = document.querySelector('.cart-notification');

        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'cart-notification';
            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.classList.add('show');

        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    },

    // Limpar o carrinho
    clearCart: function () {
        this.items = [];
        this.total = 0;
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
    }
};

// Inicializar o carrinho quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM carregado, iniciando carrinho...');
    cart.init();
}); 