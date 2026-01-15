/* =========================================
   LÓGICA DO INSTRUBOT (CHATBOT)
   ========================================= */

// Variáveis de Controle
let chatStep = 0; // Controla em qual pergunta estamos
let selectedClass = "";
let studentNames = [];
let approvedStudents = [];
let comments = "";

// Elementos DOM
const mainContainer = document.getElementById('mainContainer');
const startScreen = document.getElementById('startScreen');
const splitScreen = document.getElementById('splitScreen');
const chatMessages = document.getElementById('chatMessages');
const inputArea = document.getElementById('inputArea');
const scriptPanel = document.getElementById('scriptPanel');
const scriptTitleDisplay = document.getElementById('scriptTitleDisplay');

// 1. Função Inicial: Transforma Menu em Chat
function iniciarInstrubot() {
    // Esconde Menu
    startScreen.classList.remove('active');
    setTimeout(() => {
        startScreen.classList.add('hidden');
        splitScreen.classList.remove('hidden');
        setTimeout(() => splitScreen.classList.add('active'), 50);
        
        // Inicia fluxo do bot
        startChatFlow();
    }, 500);
}

// 2. Fluxo Principal da Conversa
function startChatFlow() {
    addBotMessage("Olá, instrutor! Seja bem-vindo ao Instrubot, a inteligência artificial dos INSTRUTORES.");
    
    setTimeout(() => {
        addBotMessage("Para entender sua solicitação, me diga qual aula pretende aplicar agora, segundo as opções abaixo:");
        showClassSelection();
    }, 1000);
}

// Renderiza os Cards de Aula
function showClassSelection() {
    const options = [
        { id: 'cfsd', label: 'CFSd (Soldados)' },
        { id: 'cfsd2', label: 'CFSd 2.0 (Completa)' },
        { id: 'cfc1', label: 'CFC I (Cabos 1)' },
        { id: 'cfc2', label: 'CFC II (Cabos 2)' }
    ];

    inputArea.innerHTML = ''; // Limpa input
    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'btn-card';
        btn.innerText = opt.label;
        btn.onclick = () => selectClass(opt);
        inputArea.appendChild(btn);
    });
}

// 3. Seleção da Aula e Expansão da Tela
function selectClass(option) {
    selectedClass = option.label;
    addUserMessage(option.label);
    inputArea.innerHTML = ''; // Limpa botões

    // ANIMAÇÃO: Expandir para tela dividida
    mainContainer.classList.add('expanded');
    scriptTitleDisplay.innerText = "Carregando script para: " + selectedClass;

    setTimeout(() => {
        addBotMessage(`O script ao lado refere-se a aula ${selectedClass}`);
        addBotMessage("Seu nickname foi detectado: INSTRUTOR_PADRAO"); // Placeholder
        
        // Data e Hora
        const now = new Date();
        const dataFormatada = now.toLocaleDateString('pt-BR');
        const horaFormatada = now.toLocaleTimeString('pt-BR');
        addBotMessage(`A data e horário de início foram detectadas: Data ${dataFormatada} e Hora ${horaFormatada}`);
        
        setTimeout(() => askStudentNames(), 1000);
    }, 1000);
}

// 4. Pergunta Nomes
function askStudentNames() {
    addBotMessage("Digite abaixo o nome dos alunos (separados por barra '/' se for coletivo):");
    
    inputArea.innerHTML = `
        <input type="text" id="nameInput" class="chat-field" placeholder="Ex: Nick1 / Nick2" autocomplete="off">
        <div class="btn-card" style="margin-top:10px" onclick="processNames()">Confirmar</div>
    `;
    
    // Permitir Enter
    document.getElementById('nameInput').addEventListener("keypress", function(event) {
        if (event.key === "Enter") processNames();
    });
}

function processNames() {
    const input = document.getElementById('nameInput');
    const text = input.value.trim();
    if(!text) return;

    // Processa os nomes separando por /
    studentNames = text.split('/').map(n => n.trim()).filter(n => n !== "");
    
    addUserMessage(text);
    inputArea.innerHTML = '';
    
    askApprovals();
}

// 5. Pergunta Aprovações (Checkboxes)
function askApprovals() {
    addBotMessage("Selecione quais foram aprovados ou se nenhum deles foi aprovado:");

    let html = '<div class="checkbox-group">';
    
    // Opção Nenhum
    html += `
        <label class="check-item" style="border:1px solid #ff4444">
            <input type="checkbox" id="checkNone" onchange="toggleNone(this)">
            Nenhum aluno aprovado
        </label>
    `;

    // Opções Alunos
    studentNames.forEach((name, index) => {
        html += `
            <label class="check-item">
                <input type="checkbox" class="student-check" value="${name}" onchange="uncheckNone()">
                ${name}
            </label>
        `;
    });
    html += '</div>';
    html += '<div class="btn-card" style="margin-top:10px" onclick="processApprovals()">Confirmar Seleção</div>';

    inputArea.innerHTML = html;
}

function toggleNone(checkbox) {
    if(checkbox.checked) {
        // Se marcou "Nenhum", desmarca os alunos
        document.querySelectorAll('.student-check').forEach(el => el.checked = false);
    }
}

function uncheckNone() {
    // Se marcou um aluno, desmarca "Nenhum"
    const noneCheck = document.getElementById('checkNone');
    if(noneCheck) noneCheck.checked = false;
}

function processApprovals() {
    const noneCheck = document.getElementById('checkNone');
    const studentChecks = document.querySelectorAll('.student-check');
    approvedStudents = [];

    if (noneCheck.checked) {
        addUserMessage("Nenhum aluno aprovado");
    } else {
        studentChecks.forEach(chk => {
            if(chk.checked) approvedStudents.push(chk.value);
        });
        
        if(approvedStudents.length === 0) {
            alert("Selecione pelo menos um aluno ou marque 'Nenhum'.");
            return;
        }
        addUserMessage("Aprovados: " + approvedStudents.join(", "));
    }
    
    inputArea.innerHTML = '';
    askComments();
}

// 6. Comentários
function askComments() {
    addBotMessage("Deseja inserir algum comentário?");
    
    inputArea.innerHTML = `
        <textarea id="commentInput" class="chat-area" rows="2" placeholder="Escreva aqui..."></textarea>
        <div style="display:flex; gap:10px; margin-top:5px;">
            <div class="btn-card" style="flex:1" onclick="submitComment(true)">Enviar Comentário</div>
            <div class="btn-card" style="flex:1; background:rgba(255,100,100,0.2)" onclick="submitComment(false)">NÃO</div>
        </div>
    `;
}

function submitComment(hasComment) {
    if(hasComment) {
        const text = document.getElementById('commentInput').value;
        comments = text ? text : "Sem comentários adicionais.";
        addUserMessage(comments);
    } else {
        comments = "Sem comentários.";
        addUserMessage("NÃO");
    }
    inputArea.innerHTML = '';
    finalizeChat();
}

// 7. Finalização
function finalizeChat() {
    // Link Copiar Nomes
    const nomesParaCopiar = approvedStudents.length > 0 ? approvedStudents.join(" / ") : "Nenhum";
    
    // Adiciona botões finais como mensagens do bot
    addBotMessageHTML(`<span style="cursor:pointer; text-decoration:underline" onclick="navigator.clipboard.writeText('${nomesParaCopiar}'); alert('Copiado!')">Clique AQUI para copiar o(s) nome(s) dos alunos</span>`);
    
    addBotMessageHTML(`<a href="#" style="color:white" onclick="alert('Redirecionando para planilha...')">Clique AQUI para ser redirecionado à planilha de postagens</a>`);
    
    addBotMessage("Obrigado por usar o INSTRUBOT!");
}


// --- UTILITÁRIOS ---

function addBotMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg msg-bot';
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addBotMessageHTML(html) {
    const div = document.createElement('div');
    div.className = 'msg msg-bot';
    div.innerHTML = html;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addUserMessage(text) {
    const div = document.createElement('div');
    div.className = 'msg msg-user';
    div.innerText = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Controles do Header
function toggleTheme() {
    document.body.classList.toggle('light-mode');
}

function resetChat() {
    // Reseta variáveis
    selectedClass = "";
    studentNames = [];
    approvedStudents = [];
    comments = "";
    
    // Limpa chat
    chatMessages.innerHTML = '';
    
    // Volta tela para quadrado
    mainContainer.classList.remove('expanded');
    
    // Reinicia fluxo
    setTimeout(() => {
        startChatFlow();
    }, 800); // Espera a animação de encolher
}