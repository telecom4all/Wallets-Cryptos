async function loadListTransactions(){
    const uuid = localStorage.getItem('loggedIn');
    if (!uuid) {
        showMessage('Erreur: UUID non trouvé.', 'error');
        return;
    }

    const data = new FormData();
    data.append('uuid', uuid);
    data.append('type', 'load_transaction');  

    const response = await fetch('php/transactions.php', {
        method: 'POST',
        body: data
    });

    const transactions = await response.json();

    if (transactions && transactions.length > 0) {
        
        let transactionsTransformees = transformerLesTransactions(transactions);
        return transactionsTransformees;
    } else {
        return false;
    }
}

async function addTransaction(){
    // Récupérer les valeurs des champs
    const selectedCrypto = document.getElementById('crypto-list');
    const quantity = document.getElementById('crypto-quantity').value;
    const amount = document.getElementById('amount').value;
    
    const selectedCryptoId = selectedCrypto.value; // Récupère le crypto_id (valeur de l'option sélectionnée)
    
    const selectedCryptoName = selectedCrypto.options[selectedCrypto.selectedIndex].textContent; // Récupère le crypto_name (texte de l'option sélectionnée)
    const transactionType = document.getElementById('transaction-type').value;
    let transactionDate = document.getElementById('transaction-date').value;
    
    
    if (isNaN(quantity) || quantity <= 0) {
        showMessage("Quantité invalide.", 'error');
        return;
    }
    
    if (isNaN(amount) || amount <= 0) {
        showMessage("Montant invalide.", 'error');
        return;
    }

    if (!transactionDate) {
        showMessage("Veuillez sélectionner une date.", 'error');
        return;
    }

    const purchasePrice = amount / quantity;
    const uuid = localStorage.getItem('loggedIn');

    // Envoi des données à la base de données via un fichier PHP
    const data = new FormData();
    data.append('uuid', uuid);
    data.append('token', selectedCryptoName);
    data.append('tokenId', selectedCryptoId);
    data.append('date', transactionDate);
    data.append('invest', amount);
    data.append('supply', quantity);
    data.append('purchasePrice', purchasePrice);
    data.append('transactionType', transactionType);
    data.append('type', 'add_transactions');  

     
    const response = await fetch('php/transactions.php', {
        method: 'POST',
        body: data
    });

    let result = await response.json();
    if (result.message && result.message.includes("succès")) {
        // Réinitialiser les champs du formulaire
        document.getElementById('crypto-list').selectedIndex = 0;
        document.getElementById('crypto-quantity').value = '';
        document.getElementById('amount').value = '';
        document.getElementById('transaction-type').selectedIndex = 0;
        document.getElementById('transaction-date').value = '';

        //charger la liste des transaction depus la db
        listTransactionAllCryptos = await loadListTransactions();
        //peupler le tableau générale
        generateTable(listTransactionAllCryptos);
        //généré le graphique général
        generateTotalPortfolioChart(listTransactionAllCryptos);

        showMessage('Transaction ajoutée avec succès!', 'success');
        

    } else {
        showMessage(result, 'error');
    }


}




async function transformerLesTransactions(transactions) {
    const resultat = {};

    for (const transaction of transactions) {
        const tokenId = transaction['tokenId'];

        if (!resultat[tokenId]) {
            resultat[tokenId] = {
                token: transaction.token,
                tokenId: tokenId,
                transactions: []
            };
        }

        const detailsTransaction = {
            id: transaction.id,
            token: transaction.token,
            tokenId: transaction.tokenId,
            date: transaction.date,
            Invest: transaction.invest,
            supply: transaction.supply,
            purchasePrice: transaction.purchasePrice,
            transactionType: transaction.transactionType
        };
        resultat[tokenId].transactions.push(detailsTransaction);
    }

    for (const tokenId in resultat) {
        let totalSupply = 0;
        let totalInvest = 0;

        resultat[tokenId].transactions.forEach(transaction => {
            if (transaction.transactionType == "achat") {
                totalSupply += transaction.supply;
                totalInvest += transaction.Invest;
            }
            if (transaction.transactionType == "vente") {
                totalSupply -= transaction.supply;
                totalInvest -= transaction.Invest;
            }
        });

        let currentPrice = await testIfLastPrice(resultat[tokenId]);

        const plDollar = (currentPrice * totalSupply) - totalInvest;
        const plPercent = (plDollar / totalInvest) * 100;

        resultat[tokenId].totalSupply = totalSupply;
        resultat[tokenId].totalInvest = totalInvest;
        resultat[tokenId].plDollar = plDollar;
        resultat[tokenId].plPercent = plPercent;
        resultat[tokenId].lastPrice = currentPrice;
        resultat[tokenId].costPrice = totalInvest / totalSupply;
    }

    return Object.values(resultat);
}



/* retourn les data du token associé */
function getTransactionByTokenId(tokenId, data) {
    return data.find(item => item.tokenId === tokenId);
}