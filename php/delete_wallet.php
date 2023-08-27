<?php
include 'config.php';

$uuid = $_POST['uuid'];

if (!$uuid) {
    echo "Erreur: UUID non fourni.";
    exit();
}

// Suppression de l'utilisateur dans la table 'global'
$stmt = $conn->prepare("DELETE FROM global WHERE uuid = ?");
$stmt->bind_param("s", $uuid);
$stmt->execute();

// Suppression des tables associées à l'utilisateur
$table_prefix = $uuid;

$tables_to_delete = [
    "${table_prefix}_transactions",
    "${table_prefix}_cryptos",
    "${table_prefix}_user_info"
];

foreach ($tables_to_delete as $table) {
    $sql = "DROP TABLE IF EXISTS $table";
    $conn->query($sql);
}

echo "Le portefeuille a été supprimé avec succès. vous aller etre déconnecté. :( ";

$stmt->close();
$conn->close();
?>
