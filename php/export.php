<?php
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

include 'config.php';

// Vérifier si la requête est de type POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['message' => 'Méthode non autorisée.', 'status' => 'error']);
    exit();
}

// TODO: Contrôle d'accès - Assurez-vous que l'utilisateur est authentifié et autorisé à accéder à cette ressource.

// Récupération de l'UUID depuis le formulaire
$uuid = $_POST['uuid'];

// Validation de l'UUID (vous pouvez ajouter des contrôles supplémentaires selon vos besoins)
if (!preg_match("/^[a-f0-9]{10}$/", $uuid)) {
    echo json_encode(['message' => 'UUID invalide.', 'status' => 'error']);
    exit();
}

// Préfixe des tables pour cet utilisateur
$table_prefix = $uuid;

try {
    // Exportation des données de la table _cryptos
    $stmt = $conn->prepare("SELECT * FROM ${table_prefix}_cryptos");
    $stmt->execute();
    $cryptos_result = $stmt->get_result();

    $dataToExport = "-- Export des données de la table ${table_prefix}_cryptos\n";
    while ($row = $cryptos_result->fetch_assoc()) {
        $dataToExport .= "INSERT INTO ${table_prefix}_cryptos (id, crypto_id, crypto_name) VALUES ('{$row['id']}', '{$row['crypto_id']}', '{$row['crypto_name']}');\n";
    }

    // Exportation des données de la table _transactions
    $stmt = $conn->prepare("SELECT * FROM ${table_prefix}_transactions");
    $stmt->execute();
    $transactions_result = $stmt->get_result();

    $dataToExport .= "\n-- Export des données de la table ${table_prefix}_transactions\n";
    while ($row = $transactions_result->fetch_assoc()) {
        $dataToExport .= "INSERT INTO ${table_prefix}_transactions (id, token, tokenId, date, invest, supply, purchasePrice, transactionType) VALUES ('{$row['id']}', '{$row['token']}', '{$row['tokenId']}', '{$row['date']}', '{$row['invest']}', '{$row['supply']}', '{$row['purchasePrice']}', '{$row['transactionType']}');\n";
    }

    // Création du nom du fichier avec l'UUID et la date d'exportation pour garantir l'unicité
    $filename = "../uploads/backup_{$uuid}_" . date("Ymd_His") . ".sql";



    if (!is_dir('../uploads')) {
        echo json_encode(['message' => 'Le dossier "uploads" n\'existe pas.', 'status' => 'error']);
        exit();
    }

    // Enregistrement des données dans un fichier SQL
    file_put_contents($filename, $dataToExport);

    if (!file_exists($filename)) {
        echo json_encode(['message' => 'Erreur lors de la création du fichier.', 'status' => 'error']);
        exit();
    }

    // Retourner le chemin du fichier pour le téléchargement
    echo json_encode(['message' => 'Exportation réalisée avec succès! il a été télécharger dans votre dossier téléchargements', 'filename' => $filename, 'status' => 'success']);

} catch (Exception $e) {
    echo json_encode(['message' => 'Une erreur est survenue lors de l\'exportation.', 'errorDetails' => $e->getMessage(), 'status' => 'error']);
}

?>
