<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
include 'config.php';

// Vérification de la méthode POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['message' => 'Méthode non autorisée.', 'status' => 'error']);
    exit();
}

$uuid = $_POST['uuid'];


// Vérification de l'UUID
if (!preg_match("/^[a-f0-9]{10}$/", $uuid)) {
    echo json_encode(['message' => 'UUID invalide.', 'status' => 'error']);
    exit();
}

// TODO: Contrôle d'accès - Assurez-vous que l'utilisateur est authentifié et autorisé à accéder à cette ressource.

$table_prefix = $uuid;

// Vérification si les tables sont vides
// Vérification si la table _cryptos est vide
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM ${table_prefix}_cryptos");
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$count_cryptos = $row['count'];

// Vérification si la table _transactions est vide
$stmt = $conn->prepare("SELECT COUNT(*) as count FROM ${table_prefix}_transactions");
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$count_transactions = $row['count'];


if ($count_cryptos > 0 || $count_transactions > 0) {
    echo json_encode(['message' => 'Les tables ne sont pas vides. Veuillez suppprimer votre portefeuille et vous reinscrire avant d\'importer.', 'status' => 'error']);
    exit();
}

// Récupération du fichier
if (!isset($_FILES['importFile']) || $_FILES['importFile']['error'] != UPLOAD_ERR_OK) {
    echo json_encode(['message' => 'Erreur lors de l\'upload du fichier.', 'status' => 'error']);
    exit();
}

$fileContent = file_get_contents($_FILES['importFile']['tmp_name']);

// Extraire l'ancien UUID
if (preg_match("/\b([a-f0-9]{10})_(cryptos|transactions)\b/", $fileContent, $matches)) {
    $previousUUID = $matches[1];
} else {
    echo json_encode(['message' => 'Format de fichier invalide. UUID non trouvé.', 'status' => 'error']);
    exit();
}

// Remplacer l'ancien UUID par le nouveau
$fileContent = str_replace($previousUUID, $uuid, $fileContent);

// Exécution des requêtes SQL
$queries = explode(";", $fileContent);
foreach ($queries as $query) {
    if (trim($query)) {
        if (!$conn->query($query)) {
            echo json_encode(['message' => 'Erreur lors de l\'exécution de la requête SQL.', 'status' => 'error', 'details' => $conn->error ]);
            exit();
        }
    }
}

echo json_encode(['message' => 'Importation réussie!', 'status' => 'success']);
?>
