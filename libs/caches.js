/**
 * Récupère les données en cache depuis le localStorage.
 * @param {string} key - La clé sous laquelle les données sont stockées.
 * @returns {any|null} - Les données mises en cache ou null si non trouvées.
 */
function getCache(key) {
    const cachedData = localStorage.getItem(key);
    return cachedData ? JSON.parse(cachedData) : null;
}

/**
 * Stocke des données dans le localStorage pour la mise en cache.
 * @param {string} key - La clé sous laquelle les données doivent être stockées.
 * @param {any} data - Les données à mettre en cache.
 */
function setCache(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Échec de la mise en cache:', e);
    }
}


/**
 * Vérifie si une clé existe dans le localStorage et l'initialise avec une valeur par défaut si elle n'existe pas.
 * @param {string} key - La clé à vérifier.
 * @param {any} defaultValue - La valeur par défaut à utiliser pour initialiser la clé si elle n'existe pas.
 * 
 * use : ensureCacheKeyExists('maCleCache', []);
 */
function ensureCacheKeyExists(key, defaultValue = null) {
    if (!localStorage.getItem(key)) {
        setCache(key, defaultValue);
    }
}


/**
 * Réinitialise (vide) le localStorage, supprimant toutes les données mises en cache.
 */
function resetCache() {
    localStorage.clear();
}



// on vérifie et met a jour si besoin le cache pour le prix actuel du token 
async function testIfLastPrice(crypto){
    const today = moment().format('DD/MM/YYYY');
    let actualTimestamp = convertDateToCurrentTime(today);

    //on vérifie si le prix est en cache
    let isCachePricesToken = getCache(crypto.token + "_Price");

    if (isCachePricesToken !== null && isCachePricesToken.length > 0) {
        // isCachePricesToken n'est ni null ni une chaîne vide
        if(isTimestampWithinOneHour(isCachePricesToken) == true){
            currentPrice = isCachePricesToken[1];
        } 
        else{
            currentPrice = await fetchCoinGeckoData(
                () => `${COINGECKO_BASE_URL}/simple/price?ids=${crypto.tokenId}&vs_currencies=usd`,
                data => data[crypto.tokenId].usd
            );
            setCache(crypto.token + "_Price", [actualTimestamp, currentPrice])
        }
    } else {
        currentPrice = await fetchCoinGeckoData(
            () => `${COINGECKO_BASE_URL}/simple/price?ids=${crypto.tokenId}&vs_currencies=usd`,
            data => data[crypto.tokenId].usd
        );
        setCache(crypto.token + "_Price", [actualTimestamp, currentPrice])
    }

    return currentPrice;
}

// on vérifie et met a jour si besoin le cache pour l'historique des prix  du token 
async function testIfLastHistoricalPrice(crypto, fromDate, toDate){
    const today = moment().format('DD/MM/YYYY');
    let actualTimestamp = convertDateToCurrentTime(today);

    
    //on vérifie si le prix est en cache
    let isCachehistoricalToken = getCache(crypto + "_Historical");
    let historical;

    if (isCachehistoricalToken !== null && Object.keys(isCachehistoricalToken).length > 0) {
        // isCachePricesToken n'est ni null ni une chaîne vide
        if(isActualTimestampWithinOneHourInHistorical(isCachehistoricalToken) == true){
            historical = isCachehistoricalToken;
        } 
        else{
            historical = await fetchCoinGeckoData(
                () => `${COINGECKO_BASE_URL}/coins/${crypto}/market_chart/range?vs_currency=usd&from=${fromDate}&to=${toDate}`
            );
            setCache(crypto + "_Historical", historical)
        }
    } else {
       historical = await fetchCoinGeckoData(
            () => `${COINGECKO_BASE_URL}/coins/${crypto}/market_chart/range?vs_currency=usd&from=${fromDate}&to=${toDate}`
        );
        setCache(crypto + "_Historical", historical)
    }

    return historical;
}