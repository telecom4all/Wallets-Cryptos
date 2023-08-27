//Variable pour les graphique
let totalPortfolioChart;
let cryptoChart;

let uniqueDatesPortefeuille;
let totalValuesPortefeuille;

let totalSuppliesCryptoSeleted;
let uniqueDatesCryptoSeleted;
let totalValuesCryptoSeleted;



// function pour crée le graphique evolution portefeuille
async function generateTotalPortfolioChart(cryptos) {
       const ctx = document.getElementById('total-portfolio-chart').getContext('2d');
       // Si un graphique existe déjà, le détruire
       if (totalPortfolioChart) {
           totalPortfolioChart.destroy();
       }
   
       // Récupérer toutes les dates uniques des transactions
       const allDates = [];
       cryptos.forEach(crypto => {
           crypto.transactions.forEach(transaction => {
                let dateFormated = convertirFormatDateISO8601ToDateEurope(transaction.date);
               if (!allDates.includes(dateFormated)) {
                   allDates.push(dateFormated);
               }
           });
       });
       uniqueDatesPortefeuille = allDates.sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));
       const today = moment().format('DD/MM/YYYY');
       uniqueDatesPortefeuille.push(today);
   
      
       const tokens = cryptos.map(crypto => crypto.tokenId);
       const fromDate = 1609459200//convertToUnixTimestamp(uniqueDatesPortefeuille[0]);
       const toDate = moment(today, "DD/MM/YYYY").unix();
   
       
       
        const historicalPrices = {};
        for (const token of tokens) {
            let isCacheHistoriquePricesToken = await testIfLastHistoricalPrice(token, fromDate, toDate);
            if (isCacheHistoriquePricesToken && isCacheHistoriquePricesToken.prices) {
                historicalPrices[token] = isCacheHistoriquePricesToken.prices.map(priceData => priceData[1]);
            } else {
                historicalPrices[token] = []; // Initialiser avec un tableau vide pour éviter les erreurs
            }
            await delay(10);
        }
      
        totalValuesPortefeuille = uniqueDatesPortefeuille.map(date => {
            let totalValueForDate = 0;
            cryptos.forEach(crypto => {
                let totalSupplyForDate = 0;
                crypto.transactions.forEach(transaction => {
                    if (new Date(transaction.date.split('/').reverse().join('-')) <= new Date(date.split('/').reverse().join('-'))) {
                        if(transaction.transactionType == "achat"){
                            totalSupplyForDate += transaction.supply;
                        }
                        if(transaction.transactionType == "vente"){
                            totalSupplyForDate -= transaction.supply;
                        }
                    }
                });
        
                const priceIndex = Math.floor((moment(date, "DD/MM/YYYY").unix() - fromDate) / (24 * 60 * 60));
                let price = historicalPrices[crypto.tokenId][priceIndex];
                if (typeof price === 'undefined' || isNaN(price)) { 
                    // Utilisez le prix d'achat si le prix est undefined ou NaN
                    price = crypto.transactions.find(t => t.transactionType === "achat").purchasePrice;
                }
                totalValueForDate += totalSupplyForDate * price;
            });
            return totalValueForDate;
        });
   
   
        const canvas = document.getElementById('total-portfolio-chart');
        canvas.removeAttribute('width');
        canvas.removeAttribute('height');
      
        totalPortfolioChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: uniqueDatesPortefeuille, // Utilisez uniquement uniqueDates comme étiquettes
                datasets: [{
                    label: 'Valeur totale du portefeuille',
                    data: totalValuesPortefeuille,
                    borderColor: 'red',
                    fill: false
                }]
            },
            options: {
                maintainAspectRatio: false,
                responsive: true,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'DD/MM/YYYY',
                            unit: 'day',
                            displayFormats: {
                                day: 'DD/MM/YYYY'
                            }
                        }
                    }
                }
            }
        });
       
   }



/* sur le resize du graphique général  */
function generateTotalPortfolioChartResize(){
    const ctx = document.getElementById('total-portfolio-chart').getContext('2d');
    // Si un graphique existe déjà, le détruire
    if (totalPortfolioChart) {
        totalPortfolioChart.destroy();
    }

    const canvas = document.getElementById('total-portfolio-chart');
    canvas.removeAttribute('width');
    canvas.removeAttribute('height');

    totalPortfolioChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: uniqueDatesPortefeuille, // Utilisez uniquement uniqueDates comme étiquettes
            datasets: [{
                label: 'Valeur totale du portefeuille',
                data: totalValuesPortefeuille,
                borderColor: 'red',
                fill: false
            }]
        },
        options: {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'DD/MM/YYYY',
                        unit: 'day',
                        displayFormats: {
                            day: 'DD/MM/YYYY'
                        }
                    }
                }
            }
        }
    });
   }




/* Génération du graphique pour la crypto selectionné */
async function generateCryptoChart(crypto){
    const ctx = document.getElementById('crypto-chart').getContext('2d');
    // Si un graphique existe déjà, le détruire
    if (cryptoChart) {
        cryptoChart.destroy();
    }

    const allDates = [];
    
    crypto.transactions.forEach(transaction => {
        let dateFormated = convertirFormatDateISO8601ToDateEurope(transaction.date);
        if (!allDates.includes(dateFormated)) {
            allDates.push(dateFormated);
        }
    });
    const uniqueDates = allDates.sort((a, b) => new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-')));
    const today = moment().format('DD/MM/YYYY');
    uniqueDates.push(today);

    const fromDate = 1609459200;
    const toDate = moment(today, "DD/MM/YYYY").unix();

    const historicalPrices = {};
    let isCacheHistoriquePricesToken = await testIfLastHistoricalPrice(crypto.tokenId, fromDate, toDate);
    if (isCacheHistoriquePricesToken && isCacheHistoriquePricesToken.prices) {
        historicalPrices[crypto.tokenId] = isCacheHistoriquePricesToken.prices.map(priceData => priceData[1]);
    } else {
        historicalPrices[crypto.tokenId] = []; // Initialiser avec un tableau vide pour éviter les erreurs
    }

    let totalSupplyForDate = 0;
    const totalSupplies = [];
    let totalValues = [];

    crypto.transactions.forEach((transaction, index) => {
        if (transaction.transactionType === "achat") {
            totalSupplyForDate += transaction.supply;
        } else if (transaction.transactionType === "vente") {
            totalSupplyForDate -= transaction.supply;
        }
        
        totalSupplies.push(totalSupplyForDate);
        
        const priceIndex = Math.floor((moment(convertirFormatDateISO8601ToDateEurope(transaction.date), "DD/MM/YYYY").unix() - fromDate) / (24 * 60 * 60));
        const price = historicalPrices[crypto.tokenId][priceIndex];
        totalValues.push(totalSupplyForDate * price);
        
    });

    totalSupplies.push(totalSupplyForDate);
    let actualPrice = await testIfLastPrice(crypto);
   // let actualPrice = await getCurrentPrice(crypto.id)
    totalValues.push(totalSupplyForDate * actualPrice);


    totalSuppliesCryptoSeleted = totalSupplies;
    uniqueDatesCryptoSeleted = uniqueDates;
    totalValuesCryptoSeleted = totalValues;

    // Créer le graphique
    cryptoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: uniqueDatesCryptoSeleted,
            datasets: [{
                label: 'Quantité de crypto',
                data: totalSuppliesCryptoSeleted,
                borderColor: 'blue',
                fill: false,
                yAxisID: 'y-axis-1'
            }, {
                label: 'Valeur de l\'actif',
                data: totalValuesCryptoSeleted,
                borderColor: 'red',
                fill: false,
                yAxisID: 'y-axis-2'
            }]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'DD/MM/YYYY',
                        unit: 'day',
                        displayFormats: {
                            day: 'DD/MM/YYYY'
                        }
                    }
                },
                y: {
                    'y-axis-1': {
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Quantité de crypto',
                            fontColor: 'blue'
                        }
                    },
                    'y-axis-2': {
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Valeur de l\'actif',
                            fontColor: 'red'
                        }
                    }
                }
            }
        }
    });
}


/* sur le resize du graphique cryto selectionné  */
function generateCryptoChartSelected(){
    const ctx = document.getElementById('crypto-chart').getContext('2d');
    // Si un graphique existe déjà, le détruire
    if (cryptoChart) {
        cryptoChart.destroy();
    }

    // Créer le graphique
    cryptoChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: uniqueDatesCryptoSeleted,
            datasets: [{
                label: 'Quantité de crypto',
                data: totalSuppliesCryptoSeleted,
                borderColor: 'blue',
                fill: false,
                yAxisID: 'y-axis-1'
            }, {
                label: 'Valeur de l\'actif',
                data: totalValuesCryptoSeleted,
                borderColor: 'red',
                fill: false,
                yAxisID: 'y-axis-2'
            }]
        },
        options: {
            maintainAspectRatio: true,
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'DD/MM/YYYY',
                        unit: 'day',
                        displayFormats: {
                            day: 'DD/MM/YYYY'
                        }
                    }
                },
                y: {
                    'y-axis-1': {
                        type: 'linear',
                        position: 'left',
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Quantité de crypto',
                            fontColor: 'blue'
                        }
                    },
                    'y-axis-2': {
                        type: 'linear',
                        position: 'right',
                        ticks: {
                            beginAtZero: true
                        },
                        scaleLabel: {
                            display: true,
                            labelString: 'Valeur de l\'actif',
                            fontColor: 'red'
                        }
                    }
                }
            }
        }
    });
}