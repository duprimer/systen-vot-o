

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
        updateVoteCount(selectedCandidateId);
        alert('Voto registrado com sucesso!');
        showResults();
    }
});

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
    resultSection.style.display = 'block';
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
            bar.textContent = `${candidate.votos} votos (${percentage.toFixed(2)}%)`;

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
    loadCandidates();
    showResults();
};
