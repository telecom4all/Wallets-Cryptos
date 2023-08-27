/* évenements généraux */
document.querySelector('.toggle-accordion').addEventListener('click', function() {
    const container = document.querySelector('.container_encodage');
    if (container.style.height === 'auto' || container.style.height === '') {
        accordeonAction("fermer");
    } else {
        accordeonAction("ouvert");
    }
});

// reactualisé les donnée au resize de la page
window.addEventListener('resize', async function() {
    
    generateTotalPortfolioChartResize();
    generateCryptoChartSelected();
});


/* Fermeture du popup */
// Fermer le popup
document.querySelector('.close-popup').addEventListener('click', () => {
    document.getElementById('transaction-popup').style.display = 'none';
});

// Fermer le popup lorsque l'utilisateur clique en dehors du contenu du modal
const popupSelect = document.getElementById('transaction-popup');
window.onclick = function(event) {
    if (event.target == popupSelect) {
        popupSelect.style.display = "none";
        
    }
}