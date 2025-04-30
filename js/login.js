// Adicionar evento para o botão de criar conta
document.getElementById('btnCriarConta').addEventListener('click', function() {
    window.location.href = '../operational/registrar.html';
});

// Adicionar evento para o formulário de login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Obter valores dos campos
    const usuario = document.getElementById('usuario').value;
    const senha = document.getElementById('senha').value;
    
    // Validar campos
    if (!usuario || !senha) {
        alert('Por favor, preencha todos os campos!');
        return;
    }
    
    // Buscar usuários cadastrados no localStorage
    const usuariosArmazenados = localStorage.getItem('usuarios');
    
    if (!usuariosArmazenados) {
        alert('Nenhum usuário cadastrado. Crie uma conta primeiro.');
        return;
    }
    
    const usuarios = JSON.parse(usuariosArmazenados);
    
    // Procurar usuário com as credenciais fornecidas
    const usuarioEncontrado = usuarios.find(u => 
        u.login === usuario && u.senha === senha
    );
    
    if (usuarioEncontrado) {
        // Login bem-sucedido
        alert(`Login realizado com sucesso! Bem-vindo(a), ${usuarioEncontrado.nome}!`);
        
        // Armazenar informações do usuário na sessão
        sessionStorage.setItem('usuarioLogado', JSON.stringify({
            id: usuarioEncontrado.id,
            nome: usuarioEncontrado.nome,
            login: usuarioEncontrado.login
        }));
        
        window.location.href = '../index.html';
       
    } else {
        // Verificar se o usuário existe, mas a senha está errada
        const usuarioExiste = usuarios.some(u => u.login === usuario);
        
        if (usuarioExiste) {
            alert('Senha incorreta. Por favor, tente novamente.');
        } else {
            alert('Usuário não encontrado. Verifique o nome de usuário ou crie uma conta.');
        }
    }
}); 