// Fonction pour obtenir les paramètres GET de l'URL
function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

// Vérification de l'état de connexion
window.addEventListener('DOMContentLoaded', (event) => {
    // Vérifiez si l'URL contient le paramètre "uuid"
    if (location.search.includes('uuid')) {
        // Récupérer le UUID de l'URL
        const uuid = getURLParameter('uuid');
        const email = getURLParameter('email');
        
        // Si l'UUID existe, stockez-le dans localStorage
        if (uuid) {
            localStorage.setItem('loggedIn', uuid);
        }
        
        if (email) {
            localStorage.setItem('email', email);
        }

        // Supprimez les paramètres GET de l'URL sans recharger la page
        history.replaceState(null, null, location.pathname);
        
       
    }

    // Vérifiez l'état de connexion
    if(!localStorage.getItem('loggedIn') && !localStorage.getItem('email')) {
        window.location.href = 'index.html';
    }
});