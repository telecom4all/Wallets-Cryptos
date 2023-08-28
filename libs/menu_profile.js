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

function displayPersonnalInfos(){
    const userEmailDisplay = document.getElementById("user-email-display");
    const userEmail = localStorage.getItem("email");
    if (userEmail) {
        userEmailDisplay.textContent = userEmail;
    }

    const userUuidDisplay = document.getElementById("user-uuid-display");
    const userUuid = localStorage.getItem("loggedIn");
    if (userUuid) {
        userUuidDisplay.textContent = userUuid;
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



async function exportData() {
    const uuid = localStorage.getItem('loggedIn');

    // Envoi des données à la base de données via un fichier PHP
    const data = new FormData();
    data.append('uuid', uuid);

    const response = await fetch('php/export.php', {
        method: 'POST',
        body: data
    });

    let result = await response.json();
    if (result.status === 'success' && result.filename) {
        // Affichez le message de succès
        showMessage(result.message, 'success');
        
        // Créer un élément <a> pour déclencher le téléchargement
        let downloadLink = document.createElement('a');
        downloadLink.href = result.filename;
        downloadLink.download = result.filename.split('/').pop(); // Assurez-vous d'obtenir le nom du fichier sans chemin
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    } else {
        // Affichez le message d'erreur
        showMessage(result.message || 'Une erreur est survenue', 'error');
    }
}





function importData() {
    const modal = document.getElementById('confirmationModal');
    const modalContent = modal.querySelector('.modal-content');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = modal.querySelector(".close");
    
    modal.style.display = "block";
    const uuid = localStorage.getItem('loggedIn')
    const email = localStorage.getItem('email')

    let message = "";
    // Supprimer les classes précédentes
    ['success', 'error', 'default'].forEach((cls) => {
        modalContent.classList.remove(cls);
    });

    modalContent.classList.add('default');

    // Ajout du message, du label, du champ de saisie de fichier et du bouton d'envoi
    modalMessage.innerHTML = `
        ${message}
        <label for="importFile">Veuillez sélectionner le fichier à importer :</label>
        <input type="file" id="importFile" accept=".sql">
        <button onclick="handleFileSubmit()">Envoyer</button>
    `;

    // Afficher le modal
    modalContent.classList.add('active');

    // Fermer le modal lorsque l'utilisateur clique sur le bouton "x"
    closeButton.onclick = function() {
        modal.style.display = "none";
    }

    // Fermer le modal lorsque l'utilisateur clique en dehors du contenu du modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

async function handleFileSubmit() {
    const uuid = localStorage.getItem('loggedIn');
    const fileInput = document.getElementById('importFile');
    if (fileInput.files.length > 0) {
        // Récupération du fichier sélectionné
        const file = fileInput.files[0];

        // Envoi des données à la base de données via un fichier PHP
        const data = new FormData();
        data.append('uuid', uuid);
        data.append('importFile', file);  // Ajout du fichier à l'objet FormData

        try {
            const response = await fetch('php/import.php', {
                method: 'POST',
                body: data
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            let result = await response.json();

            if (result.status === 'success') {
                // Affichez le message de succès
                showMessage(result.message, 'success');
                //on repli l'accordéon au démarage de la page
                accordeonAction("fermer");

                //charger la liste des crypto depus la db
                listCryptos = await loadListCryptos();
                console.log(listCryptos)
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
            } else {
                // Affichez le message d'erreur
                showMessage(result.message || 'Une erreur est survenue', 'error');
            }
        } catch (error) {
            showMessage('Une erreur réseau est survenue. Veuillez réessayer.', 'error');
        }

    } else {
        alert('Veuillez sélectionner un fichier avant de continuer.');
    }
}



