// ==========================
// === CONSTANTES GLOBALES ===
// ==========================
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const TRANSACTIONS_URL = 'transactions.php';
const DELETE_TRANSACTION_URL = 'delete_transaction.php';

// ==========================
// === VARIABLES GLOBALES ===
// ==========================
let listCryptos;
let listTransactionsdb;
let listTransactionAllCryptos;

let listAllCoinDispo;

window.onload = async function() {
    // affichage de les infos perso dans le menu profile
    displayPersonnalInfos();

    //on repli l'accordéon au démarage de la page
    accordeonAction("fermer");

    //on va chercher la liste des infos de tout les token sur coingueco s'il ne sont pas en cache
    listAllCoinDispo = await getAllCoins();
    console.log(listAllCoinDispo)
    
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
    
};
