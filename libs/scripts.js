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

window.onload = async function() {
    // affichage de l'email dans le menu profile
    displayEmail()

    //on repli l'accordéon au démarage de la page
    accordeonAction("fermer");

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
