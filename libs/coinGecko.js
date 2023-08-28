/**
 * Fonction générique pour récupérer des données depuis l'API CoinGecko.
 * Elle vérifie d'abord le cache puis effectue un appel API si nécessaire.
 * @param {function} cacheKeyBuilder - Fonction pour construire la clé de cache.
 * @param {function} urlBuilder - Fonction pour construire l'URL de l'API.
 * @param {function} [processData] - Fonction pour traiter les données avant la mise en cache et le retour (optionnel).
 * @returns {Object} - Les données récupérées ou mises en cache.
 */
/*
    Pour récupérer les prix de plusieurs tokens :

    fetchCoinGeckoData(
        () => `coingeckoPrices-${tokens.join(',')}`,
        () => `${COINGECKO_BASE_URL}/simple/price?ids=${tokens.join(',')}&vs_currencies=usd`
    );

    --------------------------------------------------------------------------------------
    Pour récupérer les données du graphique de marché :
    
    fetchCoinGeckoData(
        () => `coingeckoMarketChart-${token}-${fromDate}-${toDate}`,
        () => `${COINGECKO_BASE_URL}/coins/${token}/market_chart/range?vs_currency=usd&from=${fromDate}&to=${toDate}`
    );

    --------------------------------------------------------------------------------------
    Pour récupérer le prix d'un seul token :

    fetchCoinGeckoData(
        () => `coingeckoSingleTokenPrice-${token}`,
        () => `${COINGECKO_BASE_URL}/simple/price?ids=${token}&vs_currencies=usd`,
        data => data[token].usd
    );

*/
async function fetchCoinGeckoData(urlBuilder, processData = data => data) {
    const url = urlBuilder();
    //console.log("URL:", url); // Cette ligne affiche l'URL dans la console.
    
    const fetchedData = await fetchData(url);
  
    const processedData = processData(fetchedData);
    
    return processedData;
}


/* récupéré les infos de tout les tokens */
async function getAllCoins() {
    try {
        let isCacheListToken = getCache("ListToken");
        if (isCacheListToken !== null && isCacheListToken.length > 0) {
            return isCacheListToken; 
            
        }
        else{
            const response = await fetch('https://api.coingecko.com/api/v3/coins/list');
            const data = await response.json();
            setCache("ListToken", data);
            return data;
        }
    } catch (error) {
        showMessage(error, 'error');
        return false;
    }
    
}


async function getCoinIdByName(coinName) {
    try {
        let coins = getCache("ListToken");
        if (coins !== null && coins.length > 0) {
            const coin = coins.find(c => c.name.toLowerCase() === coinName.toLowerCase() || c.id.toLowerCase() === coinName.toLowerCase());
            return coin ? coin.id : null; 
        } else {
            showMessage("Token non trouvé", 'error');
            return false; 
        }
        
    } catch (error) {
        showMessage(error, 'error');
        return false;
    }
}


function triggerSearchIdByName() {
    const searchTerm = document.getElementById('crypto-name-add').value.trim();

    if (!searchTerm) {  // Si le champ est vide
        showMessage('Veuillez entrer une valeur Nom de Crypto avant de chercher.', 'error');
       
        return;  // Sortir de la fonction
    }

    getCoinIdByName(searchTerm).then(id => {
        if (id) {
            const idField = document.getElementById('crypto-id-add');
            idField.value = id;
        } else {
            showMessage("Crypto-monnaie non trouvée. essayé une autre orthographe", 'error');
        }
    });
    
}