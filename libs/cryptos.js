async function loadListCryptos(){
    const uuid = localStorage.getItem('loggedIn');
    if (!uuid) {
        showMessage('Erreur: UUID non trouvé.', 'error');
        return;
    }

    const data = new FormData();
    data.append('uuid', uuid);
    data.append('type', 'load_crypto');  // Ajout du type

    const response = await fetch('php/cryptos.php', {
        method: 'POST',
        body: data
    });

    const cryptos = await response.json();
    
    if (cryptos && cryptos.length > 0) {
        return cryptos;
    } else {
        return false;
    }
}

async function addCrypto(){
    // 1. Récupérez les valeurs des champs d'entrée
    const cryptoId = document.getElementById('crypto-id-add').value;
    const cryptoName = document.getElementById('crypto-name-add').value;

    // Vérifiez si les champs ne sont pas vides
    if (!cryptoId || !cryptoName) {
        showMessage('Veuillez remplir tous les champs.', 'error');
        return;
    }

    const uuid = localStorage.getItem('loggedIn');

    const data = new FormData();
    data.append('uuid', uuid);
    data.append('crypto_id', cryptoId.toLowerCase());
    data.append('crypto_name', cryptoName.toUpperCase());
    data.append('type', 'add_cryptos');  // Ajout du type

    const response = await fetch('php/cryptos.php', {
        method: 'POST',
        body: data
    });

    const result = await response.text();
    
    if (result.includes("succès")) {
        //reload le select
        let newListCryptos = await loadListCryptos();
        populateSelectCryptos(newListCryptos);
        showMessage('Crypto ajoutée avec succès!', 'success');
        // Réinitialiser les champs du formulaire
        document.getElementById('crypto-id-add').value = '';
        document.getElementById('crypto-name-add').value = '';
    } else {
        showMessage(result, 'error');
    }
}
