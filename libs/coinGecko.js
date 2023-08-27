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
