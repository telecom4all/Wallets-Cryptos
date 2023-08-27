 // Fonction pour se déconnecter
 function logout() {
    localStorage.removeItem('loggedIn');
    window.location.href = 'index.html';
}


function toggleMenu() {
    const menu = document.getElementById('user-info');
    if (menu.classList.contains('hidden')) {
        menu.classList.remove('hidden');
    } else {
        menu.classList.add('hidden');
    }
}

function displayEmail(){
    const userEmailDisplay = document.getElementById("user-email-display");
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
        userEmailDisplay.textContent = userEmail;
    }
}


function changePassword() {
    const uuid = localStorage.getItem('loggedIn');
    if (!uuid) {
        showMessage('Erreur: UUID non trouvé.', 'error');
        return;
    }
    
    const newPassword = prompt('Veuillez entrer votre nouveau mot de passe:');
    if (newPassword && newPassword.trim() !== '') {
        fetch('php/change_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `uuid=${uuid}&password=${newPassword}`
        })
        .then(response => response.text())
        .then(data => {
            if (data.includes("succès")) {
                showMessage(data, 'success', true);  
            } else {
                showMessage(data, 'error');
            }
        })
        .catch(error => {
            showMessage('Erreur lors du changement du mot de passe.', 'error');
        });
    }
}


function deleteWallet() {
    const uuid = localStorage.getItem('loggedIn');
    if (!uuid) {
        showMessage('Erreur: UUID non trouvé.', 'error');
        return;
    }
    
    const confirmation = confirm('Êtes-vous sûr de vouloir supprimer votre portefeuille? Cette action est irréversible.');
    if (!confirmation) return;

    fetch('php/delete_wallet.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `uuid=${uuid}`
    })
    .then(response => response.text())
    .then(data => {
        if (data.includes("succès")) {
            showMessage(data, 'success', true);  // le paramètre 'true' indique une redirection après le message
        } else {
            showMessage(data, 'error');
        }
    })
    .catch(error => {
        showMessage('Erreur lors de la suppression du portefeuille.', 'error');
    });


}


async function rafraichirData(){
     //charger la liste des crypto depus la db
     listCryptos = await loadListCryptos();
     if (listCryptos && listCryptos != false) {
         //peuplé le select
         populateSelectCryptos(listCryptos);
     } 
 
     
 
     //charger la liste des transaction depus la db
     listTransactionAllCryptos = await loadListTransactions();
 
 
     if (listTransactionAllCryptos && listTransactionAllCryptos != false) {
         //peupler le tableau générale
         generateTable(listTransactionAllCryptos);
 
         //généré le graphique général
         generateTotalPortfolioChart(listTransactionAllCryptos);
     } 
}

