/**
 * Affiche les messages sous forme de notification sur la page.
 * @param {string} message - Le message à afficher.
 * @param {string} type - Le type de message ("success", "error" ou "" pour par défaut).
 */
function showMessage(message, type = "", redirect = false) {
    const modal = document.getElementById('confirmationModal');
    const modalContent = modal.querySelector('.modal-content');
    const modalMessage = document.getElementById('modalMessage');
    const closeButton = modal.querySelector(".close");
    
    modal.style.display = "block";

    // Supprimer les classes précédentes
    ['success', 'error', 'default'].forEach((cls) => {
        modalContent.classList.remove(cls);
    });

    // Ajouter la classe appropriée en fonction du type
    if (type === "success" || type === "error") {
        modalContent.classList.add(type);
    } else {
        modalContent.classList.add('default');
    }

    // Afficher le message dans le modal
    modalMessage.textContent = message;

    // Afficher le modal
    modalContent.classList.add('active');

    // Fermer le modal lorsque l'utilisateur clique sur le bouton "x"
    closeButton.onclick = function() {
        modal.style.display = "none";
        if (redirect) {
            logout();
        }
    }

    // Fermer le modal lorsque l'utilisateur clique en dehors du contenu du modal
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            if (redirect) {
                logout();
            }
        }
    }

    // Cacher le modal après quelques secondes (par exemple 4 secondes)
    setTimeout(() => {
        modalContent.classList.remove('active');
        modal.style.display = "none";
        if (redirect) {
            logout();
        }
    }, 4000);
}

/**
 * Gère l'accordéon pour l'encodage
 * @param {string} action - type d'action sur l'accordéon "ouvert" - "fermer"
 */
function accordeonAction(action){
    // Sélectionnez les éléments nécessaires
    const container = document.querySelector('.container_encodage');
    const container_add_crypto = document.querySelector('#crypto-management-section');
    const container_add_trans = document.querySelector('#transaction-section');

    if(action == "ouvert"){
        container.style.height = 'auto';
        container_add_crypto.style.display = 'block';
        container_add_trans.style.display = 'block';
    }
    else if(action == "fermer"){
        // Définissez les styles pour que l'accordéon soit replié au chargement de la page
        container.style.height = '30px'; // ou la hauteur de votre choix pour montrer seulement l'icône
        container_add_crypto.style.display = 'none';
        container_add_trans.style.display = 'none';
    }
    else{
        showMessage("Erreur au niveau de l'accordéon aucune action n'a été donnée", "error")
    }
 
}

/**
 * remplir le select pour la liste des cryptos dispo
 */
function populateSelectCryptos(cryptos){
    
    const cryptoListElement = document.getElementById('crypto-list');
    if (!cryptos) {
        const errorText = `Erreur lors de la récupération de la liste des crypto disponible`;
        showMessage(errorText, 'error');
        throw new Error(errorText);
    }
   
    // Vider la liste des options
    cryptoListElement.innerHTML = '';

    cryptos.forEach(crypto => {
        const option = document.createElement('option');
        
        option.value = crypto.crypto_id;
        option.textContent = crypto.crypto_name;
        cryptoListElement.appendChild(option);
    });
}


/**
 * Génére le tableau des cryptos possédées
 * @param {Array} cryptos - Liste de toute les transaction cryptos.
 */
async function generateTable(cryptos) {
    const tableBody = document.getElementById('crypto-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Vider le tableau
    let totalInvest = 0;
    let totalPl = 0;
    let totalPlPercent = 0;

    
    cryptos.forEach(crypto => {
        
        const row = tableBody.insertRow();
        row.insertCell().textContent = crypto.token; 
        row.insertCell().textContent = crypto.totalSupply;
        row.insertCell().textContent = crypto.totalInvest + " $";
        row.insertCell().textContent = crypto.costPrice + " $";
        row.insertCell().textContent = crypto.lastPrice + " $";
        row.insertCell().textContent = crypto.plDollar + " $";
        row.insertCell().textContent = crypto.plPercent + " %";

        // Ajout du bouton "Détails"
        const detailsCell = row.insertCell();
        const detailsButton = document.createElement('button');
        detailsButton.textContent = 'Détails';
        detailsButton.addEventListener('click', () => showTransactionPopup(crypto));
        detailsCell.appendChild(detailsButton);
        if (crypto.plDollar > 0) {
            row.classList.add('positive');
        } else if (crypto.plDollar < 0) {
            row.classList.add('negative');
        } else {
            row.classList.add('neutral');
        }

        totalInvest = totalInvest + crypto.totalInvest;
        totalPl = totalPl + crypto.plDollar;
        totalPlPercent = totalPlPercent + crypto.plPercent;
        

    });  
    
    const tableBodyResume = document.getElementById('crypto-table-resume').querySelector('tbody');
    tableBodyResume.innerHTML = ''; // Vider le tableau
    const rowResume = tableBodyResume.insertRow();
    rowResume.insertCell().textContent = totalInvest + " $";
    rowResume.insertCell().textContent = totalPl + " $";
    rowResume.insertCell().textContent = totalPlPercent + " %";
    if (totalPl > 0) {
        rowResume.classList.add('positive');
    } else if (totalPl < 0) {
        rowResume.classList.add('negative');
    } else {
        rowResume.classList.add('neutral');
    }

}



/* Affichage du popup details */
async function showTransactionPopup(crypto){
    const popup = document.getElementById('transaction-popup');
    const popupCryptoName = document.getElementById('popup-crypto-name');
    const tableBody = document.getElementById('transaction-history-table').querySelector('tbody');

    popupCryptoName.textContent = crypto.token;
    tableBody.innerHTML = ''; // Vider le tableau


    const popupCryptoNameResume = document.getElementById('popup-crypto-name-resume');
    const tableBodyResume = document.getElementById('popup-crypto-table-resume').querySelector('tbody');
    popupCryptoNameResume.textContent = crypto.token;    

    let totalInvest = 0;
    let totalSupply = 0;
    let totalPl = 0;
    let totalPlPercent = 0;

    const today = moment().format('DD/MM/YYYY');
    const fromDate = 1609459200;
    const toDate = moment(today, "DD/MM/YYYY").unix();

    const historicalPrices = {};
    let isCacheHistoriquePricesToken = await testIfLastHistoricalPrice(crypto.tokenId, fromDate, toDate);
    if (isCacheHistoriquePricesToken && isCacheHistoriquePricesToken.prices) {
        historicalPrices[crypto.tokenId] = isCacheHistoriquePricesToken.prices.map(priceData => priceData[1]);
    } else {
        historicalPrices[crypto.tokenId] = []; // Initialiser avec un tableau vide pour éviter les erreurs
    }

    if (crypto.transactions && crypto.transactions.length > 0) {
        crypto.transactions.forEach(transaction => {
            
            const row = tableBody.insertRow();
            row.insertCell().textContent = transaction.date;
            row.insertCell().textContent = transaction.Invest;
            row.insertCell().textContent = transaction.supply;
            row.insertCell().textContent = transaction.purchasePrice;
            row.insertCell().textContent = transaction.transactionType;
            
            const actionCell = row.insertCell();

            // Créer un conteneur pour les boutons
            const buttonContainer = document.createElement('div');
            buttonContainer.style.display = 'flex';
            buttonContainer.style.justifyContent = 'space-between'; // Pour espacer les boutons, si nécessaire
            buttonContainer.className = 'buttonContainer'; // Ajoutez cette ligne

            // Créer le bouton "Modifier"
            
            // Créer le bouton "Effacer"
            const deleteIcon = document.createElement('i');
            deleteIcon.className = 'fas fa-trash-alt';
            deleteIcon.title = 'Effacer';
            const deleteButton = document.createElement('button');
            deleteButton.setAttribute('data-id', transaction.id);
            deleteButton.appendChild(deleteIcon);
            buttonContainer.appendChild(deleteButton); // Ajoutez le bouton au conteneur
           
            deleteButton.className = 'del_red'; // Ajoutez cette ligne

            deleteButton.addEventListener('click', async (event) => {
                const idTransaction = event.currentTarget.getAttribute('data-id');
                const confirmation = confirm("Êtes-vous sûr de vouloir supprimer cette transaction?");
                if (confirmation) {
                    const uuid = localStorage.getItem('loggedIn');
            
                    // Préparation des données à envoyer
                    const data = new FormData();
                    data.append('uuid', uuid);
                    data.append('transaction_id', idTransaction);
                    data.append('type', 'delete_transaction');
            
                    try {
                        const response = await fetch('php/transactions.php', {
                            method: 'POST',
                            body: data
                        });
            
                        const result = await response.json();
            
                        if (result.success) {
                            // Si le message contient le mot "succès"
                            if (result.message.includes("succès")) {
                                
                                
                                // Supprimer la ligne du tableau et actualisé le graphique
                                delay(200);
                                //charger la liste des transaction depus la db
                                listTransactionAllCryptos = await loadListTransactions();

                                generateTable(listTransactionAllCryptos);

                                //généré le graphique général
                                generateTotalPortfolioChart(listTransactionAllCryptos);


                                let newData = await getTransactionByTokenId(crypto.tokenId, listTransactionAllCryptos)
                                if (newData) {
                                    showTransactionPopup(newData);

                                } else {
                                     // Afficher le popup
                                    popup.style.display = 'none';
                                }
                                
                               
                                
                                showMessage('Transaction supprimée avec succès!', 'success');
                            } else {
                                showMessage(result.message, 'error');
                            }
                        } else {
                            showMessage(result.message, 'error');
                            
                        }
                    } catch (error) {
                        alert("Erreur lors de la communication avec le serveur.");
                    }
                }
            });
            


            // Ajoutez le conteneur à la cellule
            actionCell.appendChild(buttonContainer);

            
            if (transaction.transactionType == "achat" ) {
                row.classList.add('positive');
                totalInvest = totalInvest + transaction.Invest;
                totalSupply = totalSupply + transaction.supply;
            } else if (transaction.transactionType == "vente") {
                row.classList.add('negative');
                totalInvest = totalInvest - transaction.Invest;
                totalSupply = totalSupply - transaction.supply;
            } else {
                row.classList.add('neutral');
            }

            

        });

        
        let actualPrice = await testIfLastPrice(crypto);
        totalPl = (actualPrice * totalSupply) - totalInvest;
        totalPlPercent = (totalPl / totalInvest) * 100;
       
        tableBodyResume.innerHTML = ''; // Vider le tableau

        const rowResume = tableBodyResume.insertRow();
        rowResume.insertCell().textContent = totalInvest + " $";
        rowResume.insertCell().textContent = totalSupply;
        rowResume.insertCell().textContent = totalPl + " $";
        rowResume.insertCell().textContent = totalPlPercent +  " %";
        if (totalPl > 0) {
            rowResume.classList.add('positive');
        } else if (totalPl < 0) {
            rowResume.classList.add('negative');
        } else {
            rowResume.classList.add('neutral');
        }
        
    } else {
        const row = tableBody.insertRow();
        row.insertCell().textContent = "Aucune transaction trouvée pour cette crypto.";
        row.setAttribute('colspan', '5');
    }



    // Afficher le popup
    popup.style.display = 'block';

    generateCryptoChart(crypto);
}