/**
 * Fonction utilitaire pour effectuer des requêtes fetch et gérer les erreurs courantes.
 * @param {string} url - L'URL à récupérer.
 * @param {Object} options - Options pour la requête fetch.
 * @returns {Object} - La réponse JSON analysée.
 */
async function fetchData(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errorText = `Erreur lors de la requête vers ${url} : ${response.statusText}`;
            showMessage(errorText, 'error');
            
            throw new Error(errorText);
        }
        return await response.json();
    } catch (error) {
        showMessage('Erreur lors de fetchData : ' + error + '.' , 'error');
    }
    
}