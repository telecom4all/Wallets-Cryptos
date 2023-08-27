function convertirFormatDateISO8601ToDateEurope(dateStr) {
    const date = new Date(dateStr);
    const jour = String(date.getDate()).padStart(2, '0');
    const mois = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés à partir de 0
    const annee = date.getFullYear();

    return `${jour}/${mois}/${annee}`;
}


/* convertir une date au format "DD/MM/AAAA" en un timestamp correspondant à 1 heure du matin */
function convertDateToCurrentTime(dateStr) {
    // Extraire le jour, le mois et l'année de la date
    const [day, month, year] = dateStr.split('/');

    // Obtenir l'heure, les minutes et les secondes actuelles
    const currentHour = moment().hour();
    const currentMinute = moment().minute();
    const currentSecond = moment().second();

    // Construire une nouvelle date avec l'heure actuelle
    const newDate = moment({ year: +year, month: +month - 1, day: +day, hour: currentHour, minute: currentMinute, second: currentSecond });

    // Convertir en timestamp
    return newDate.valueOf();
}

//fonction qui vérifie si le timestamp actuel est soit égal à la valeur de old_data[0] soit supérieur d'une heure 
function isTimestampWithinOneHour(old_data) {
    const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
    
    let actualTimestamp = convertDateToCurrentTime(moment().format("DD/MM/YYYY"));

    if (actualTimestamp === old_data[0] || (actualTimestamp - old_data[0]) <= HOUR_IN_MILLISECONDS) {
        return true;
    }
    return false;
}

//fonction qui vérifie si le timestamp actuel est soit égal à la derniere valeur de old_data soit supérieur d'une heure 
function isActualTimestampWithinOneHourInHistorical(old_data) {
    const HOUR_IN_MILLISECONDS = 60 * 60 * 1000;
    
    let actualTimestamp = convertDateToCurrentTime(moment().format("DD/MM/YYYY"));
    // Récupération du dernier timestamp de old_data
    let lastTimestamp = old_data.prices[old_data.prices.length - 1][0];
    if (actualTimestamp === lastTimestamp || (lastTimestamp - actualTimestamp) <= HOUR_IN_MILLISECONDS) {
        return true;
    }
    
    return false;
}

function convertToUnixTimestamp(dateString) {
    return moment(dateString, "YYYY-MM-DD HH:mm:ss").unix();
}

/* function delay */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}