// Configuração do Firebase
var firebaseConfig = {
    apiKey: "AIzaSyDJ1Z55NuuY7ml0JFmTXBCurLORZY5twCM",
    authDomain: "pesquisa-f37e5.firebaseapp.com",
    projectId: "pesquisa-f37e5",
    storageBucket: "pesquisa-f37e5.appspot.com",
    messagingSenderId: "464850560269",
    appId: "1:464850560269:web:8df7b28267cda823cc3c44"
};
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const votingSection = document.getElementById('voting-section');
const candidateList = document.getElementById('candidate-list');
const voteBtn = document.getElementById('vote-btn');
const resultSection = document.getElementById('result-section');
const resultList = document.getElementById('result-list');

let selectedCandidateId = null;
let userIp = null;

// Esconder a seção de resultados no início
resultSection.style.display = 'none';

// Função para obter o IP do usuário
async function getIp() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        userIp = data.ip;
    } catch (error) {
        console.error("Erro ao obter IP do usuário: ", error);
    }
}

function loadCandidates() {
    db.collection('candidatos').get().then(snapshot => {
        snapshot.forEach(doc => {
            const candidate = doc.data();
            const li = document.createElement('li');
            const img = document.createElement('img');
            img.src = candidate.fotoUrl;
            const text = document.createElement('span');
            text.textContent = `${candidate.nome} (${candidate.partido})`;
            
            li.appendChild(img);
            li.appendChild(text);
            
            li.addEventListener('click', () => {
                selectedCandidateId = doc.id;
                Array.from(candidateList.children).forEach(child => child.classList.remove('selected'));
                li.classList.add('selected');
                voteBtn.style.display = 'block';
            });
            candidateList.appendChild(li);
        });
    }).catch(error => {
        console.error("Erro ao carregar candidatos: ", error);
    });
}

voteBtn.addEventListener('click', () => {
    if (selectedCandidateId) {
        checkIpAndVote(); // Verificar se o IP já votou antes de registrar o voto
    }
});

async function checkIpAndVote() {
    if (userIp) {
        const ipDoc = await db.collection('voters').doc(userIp).get();
        if (ipDoc.exists) {
            alert('Você já votou!');
            showResults(); // Exibir resultados se o usuário já tiver votado
        } else {
            await db.collection('voters').doc(userIp).set({ voted: true });
            updateVoteCount(selectedCandidateId);
            alert('Voto registrado com sucesso!');
            showResults(); // Mostrar resultados após o voto
        }
    } else {
        alert('Não foi possível verificar o seu IP.');
    }
}

function updateVoteCount(candidateId) {
    const candidateRef = db.collection('candidatos').doc(candidateId);
    candidateRef.update({
        votos: firebase.firestore.FieldValue.increment(1)
    }).then(() => {
        console.log("Contagem de votos atualizada com sucesso");
    }).catch(error => {
        console.error("Erro ao atualizar contagem de votos: ", error);
    });
}

function showResults() {
    resultSection.style.display = 'block'; // Exibir a seção de resultados
    resultList.innerHTML = '';
    db.collection('candidatos').orderBy('votos', 'desc').get().then(snapshot => {
        let totalVotes = 0;
        snapshot.forEach(doc => {
            totalVotes += doc.data().votos;
        });
        
        snapshot.forEach(doc => {
            const candidate = doc.data();
            const li = document.createElement('li');
            li.textContent = `${candidate.nome} (${candidate.partido})`;

            const barContainer = document.createElement('div');
            barContainer.className = 'bar-container';
            const bar = document.createElement('div');
            bar.className = 'bar';
            const percentage = totalVotes ? (candidate.votos / totalVotes * 100) : 0;
            bar.style.width = `${percentage}%`;
            bar.textContent = `${percentage.toFixed(2)}%`; // Exibir apenas a porcentagem

                // Altera a cor do texto da porcentagem
                bar.style.color = 'black'; // Troque 'red' pela cor desejada


            barContainer.appendChild(bar);
            li.appendChild(barContainer);
            resultList.appendChild(li);
        });
    }).catch(error => {
        console.error("Erro ao carregar resultados: ", error);
    });
}

// Carregar os candidatos ao carregar a página
window.onload = function() {
    getIp().then(() => {
        loadCandidates();
    });
};
