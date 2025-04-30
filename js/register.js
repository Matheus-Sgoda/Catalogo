// Variáveis globais
let usuarios = [];
let editandoIndex = null;

// Inicialização quando o documento estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    // Carregar usuários do localStorage
    carregarUsuarios();
    
    // Atualizar a tabela com os usuários carregados
    atualizarTabelaUsuarios();
    
    // Adicionar evento para o botão "Voltar"
    document.getElementById('btnVoltar').addEventListener('click', function() {
        window.location.href = '../operational/login.html';
    });
    
    // Adicionar evento para o formulário de registro
    document.getElementById('register-form-complete').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obter valores dos campos
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const telefone = document.getElementById('telefone').value;
        const cpf = document.getElementById('cpf').value;
        const login = document.getElementById('usuario').value;
        const senha = document.getElementById('senha').value;
        
        // Validar campos
        if (!nome || !email || !telefone || !cpf || !login || !senha) {
            alert('Por favor, preencha todos os campos!');
            return;
        }
        
        // Verificar termos
        if (!document.getElementById('termos').checked) {
            alert('Você precisa aceitar os termos de uso para continuar.');
            return;
        }
        
        // Validar email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor, insira um e-mail válido.');
            return;
        }
        
        // Criar objeto do usuário
        const novoUsuario = {
            nome,
            email,
            telefone,
            cpf,
            login,
            senha,
            id: editandoIndex !== null ? usuarios[editandoIndex].id : Date.now()
        };
        
        // Verificar se o login já existe (exceto para o próprio usuário sendo editado)
        const loginExiste = usuarios.some((usuario, index) => 
            usuario.login === novoUsuario.login && index !== editandoIndex
        );
        
        if (loginExiste) {
            alert('Este login já está em uso!');
            return;
        }
        
        // Adicionar ou atualizar usuário
        if (editandoIndex !== null) {
            usuarios[editandoIndex] = novoUsuario;
            alert('Usuário atualizado com sucesso!');
            editandoIndex = null;
        } else {
            usuarios.push(novoUsuario);
            alert('Cadastro concluído com sucesso! 🎉 Seus dados foram registrados.');
        }
        
        // Salvar no localStorage e atualizar tabela
        salvarUsuariosNoStorage();
        atualizarTabelaUsuarios();
        
        // Limpar o formulário
        this.reset();
    });
});

// Função para carregar usuários do localStorage
function carregarUsuarios() {
    const usuariosArmazenados = localStorage.getItem('usuarios');
    if (usuariosArmazenados) {
        usuarios = JSON.parse(usuariosArmazenados);
        console.log(usuarios);
    }
}

// Função para salvar usuários no localStorage
function salvarUsuariosNoStorage() {
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
}

// Função para atualizar a tabela de usuários
function atualizarTabelaUsuarios() {
    const tbody = document.getElementById('usersTableBody');
    
    if (!tbody) {
        console.error('Elemento usersTableBody não encontrado na página');
        return;
    }
    
    tbody.innerHTML = '';
    
    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum usuário cadastrado</td></tr>';
        return;
    }
    
    usuarios.forEach((usuario, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${usuario.nome || '-'}</td>
            <td>${usuario.email || '-'}</td>
            <td>${usuario.telefone || '-'}</td>
            <td>${usuario.login || '-'}</td>
            <td class="action-buttons">
                <button class="edit-btn" onclick="editarUsuario(${index})">Editar</button>
                <button class="delete-btn" onclick="excluirUsuario(${index})">Excluir</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Função para editar usuário
function editarUsuario(index) {
    const usuario = usuarios[index];
    
    if (usuario) {
        document.getElementById('nome').value = usuario.nome || '';
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('telefone').value = usuario.telefone || '';
        document.getElementById('cpf').value = usuario.cpf || '';
        document.getElementById('usuario').value = usuario.login || '';
        document.getElementById('senha').value = usuario.senha || '';
        
        editandoIndex = index;
        
        // Rolar para o topo para mostrar o formulário
        window.scrollTo(0, 0);
    }
}

// Função para excluir usuário
function excluirUsuario(index) {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
        usuarios.splice(index, 1);
        salvarUsuariosNoStorage();
        atualizarTabelaUsuarios();
    }
}

// Tornar funções acessíveis globalmente para os eventos onclick
window.editarUsuario = editarUsuario;
window.excluirUsuario = excluirUsuario; 