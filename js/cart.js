// Objeto para gerenciar o carrinho de compras
const cart = {
    items: [],
    total: 0,
    
    // Inicializar o carrinho
    init: function() {
        // Carregar itens do localStorage se existirem
        this.loadCart();
        
        // Atualizar contador do carrinho
        this.updateCartCount();
        
        // Adicionar evento para abrir/fechar o modal do carrinho
        document.querySelector('.carrinho').addEventListener('click', this.toggleCartModal.bind(this));
        
        // Adicionar eventos para os botões "Adicionar ao Carrinho"
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', this.handleAddToCartClick.bind(this));
        });
    },
    
    // Carregar itens do carrinho do localStorage
    loadCart: function() {
        const savedCart = localStorage.getItem('bneCart');
        if (savedCart) {
            const cartData = JSON.parse(savedCart);
            this.items = cartData.items || [];
            this.total = cartData.total || 0;
        }
    },
    
    // Salvar carrinho no localStorage
    saveCart: function() {
        localStorage.setItem('bneCart', JSON.stringify({
            items: this.items,
            total: this.total
        }));
    },
    
    // Adicionar item ao carrinho
    addItem: function(item) {
        // Verificar se o item já existe no carrinho
        const existingItemIndex = this.items.findIndex(i => i.id === item.id);
        
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
    removeItem: function(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.calculateTotal();
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
    },
    
    // Atualizar quantidade de um item
    updateQuantity: function(id, quantity) {
        const itemIndex = this.items.findIndex(item => item.id === id);
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
    calculateTotal: function() {
        this.total = this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },
    
    // Atualizar contador de itens no ícone do carrinho
    updateCartCount: function() {
        // Criar ou atualizar o contador
        let counter = document.querySelector('.cart-counter');
        const totalItems = this.items.reduce((count, item) => count + item.quantity, 0);
        
        if (!counter) {
            counter = document.createElement('span');
            counter.className = 'cart-counter';
            document.querySelector('.carrinho').appendChild(counter);
        }
        
        counter.textContent = totalItems;
        
        // Ocultar contador se não houver itens
        counter.style.display = totalItems > 0 ? 'block' : 'none';
    },
    
    // Lidar com clique no botão "Adicionar ao Carrinho"
    handleAddToCartClick: function(event) {
        const button = event.currentTarget;
        const productCard = button.closest('.products-cards');
        
        if (productCard) {
            const id = button.getAttribute('data-id');
            const name = productCard.querySelector('.title-product h3').textContent;
            const priceText = productCard.querySelector('.price-card').textContent;
            const price = parseFloat(priceText.replace('R$', '').replace('.', '').replace(',', '.').trim());
            const imgSrc = productCard.querySelector('img').src;
            
            const item = {
                id: id,
                name: name,
                price: price,
                imgSrc: imgSrc,
                quantity: 1
            };
            
            this.addItem(item);
        }
    },
    
    // Alternar visibilidade do modal do carrinho
    toggleCartModal: function() {
        let cartModal = document.getElementById('cart-modal');
        
        if (!cartModal) {
            // Criar o modal se não existir
            cartModal = document.createElement('div');
            cartModal.id = 'cart-modal';
            document.body.appendChild(cartModal);
        }
        
        if (cartModal.classList.contains('show')) {
            cartModal.classList.remove('show');
            setTimeout(() => {
                cartModal.style.display = 'none';
            }, 300);
        } else {
            cartModal.style.display = 'block';
            this.updateCartModal();
            setTimeout(() => {
                cartModal.classList.add('show');
            }, 10);
        }
    },
    
    // Atualizar conteúdo do modal do carrinho
    updateCartModal: function() {
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
        
        if (this.items.length === 0) {
            content += `<p class="empty-cart-message">Seu carrinho está vazio</p>`;
        } else {
            this.items.forEach(item => {
                content += `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-img">
                            <img src="${item.imgSrc}" alt="${item.name}">
                        </div>
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <div class="cart-item-price">R$ ${item.price.toFixed(2).replace('.', ',')}</div>
                            <div class="cart-item-quantity">
                                <button class="quantity-btn decrease">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn increase">+</button>
                            </div>
                        </div>
                        <button class="remove-item-btn" data-id="${item.id}">🗑️</button>
                    </div>
                `;
            });
        }
        
        content += `
                </div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Total:</span>
                        <span>R$ ${this.total.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <button class="checkout-btn" ${this.items.length === 0 ? 'disabled' : ''}>Finalizar Compra</button>
                    <button class="continue-shopping-btn">Continuar Comprando</button>
                </div>
            </div>
        `;
        
        cartModal.innerHTML = content;
        
        // Adicionar eventos para os botões do modal
        cartModal.querySelector('.close-cart-btn').addEventListener('click', this.toggleCartModal.bind(this));
        cartModal.querySelector('.continue-shopping-btn').addEventListener('click', this.toggleCartModal.bind(this));
        
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
                const id = cartItem.getAttribute('data-id');
                const item = this.items.find(item => item.id === id);
                if (item) {
                    this.updateQuantity(id, item.quantity + 1);
                }
            });
        });
        
        cartModal.querySelectorAll('.quantity-btn.decrease').forEach(button => {
            button.addEventListener('click', (e) => {
                const cartItem = e.currentTarget.closest('.cart-item');
                const id = cartItem.getAttribute('data-id');
                const item = this.items.find(item => item.id === id);
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
                if (this.items.length > 0) {
                    alert('Redirecionando para página de checkout...');
                    // Aqui você pode redirecionar para a página de checkout
                    // window.location.href = 'checkout.html';
                }
            });
        }
    },
    
    // Exibir notificação
    showNotification: function(message) {
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
    clearCart: function() {
        this.items = [];
        this.total = 0;
        this.saveCart();
        this.updateCartCount();
        this.updateCartModal();
    }
};

// Inicializar o carrinho quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    cart.init();
}); 