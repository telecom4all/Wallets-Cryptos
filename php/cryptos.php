<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'config.php';

if(!isset($_POST['type'])) {
    echo "Erreur : type d'opération non spécifié.";
    exit();
}

$uuid = $_POST['uuid'];
if (!$uuid) {
    echo "Erreur : UUID non spécifié.";
    exit();
}

$table_name = $uuid . "_cryptos";

switch($_POST['type']) {
    case 'add_cryptos':
        if (!isset($_POST['crypto_id']) || !isset($_POST['crypto_name'])) {
            echo "Erreur : données incomplètes pour ajouter une crypto.";
            exit();
        }

        $crypto_id = $_POST['crypto_id'];
        $crypto_name = $_POST['crypto_name'];

        // Vérifiez si la crypto existe déjà
        $stmt = $conn->prepare("SELECT crypto_id FROM $table_name WHERE crypto_id = ?");
        $stmt->bind_param("s", $crypto_id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo "Erreur : Cette crypto est déjà ajoutée!";
            exit();
        }

        // Insertion de la crypto dans la table
        $stmt = $conn->prepare("INSERT INTO $table_name (crypto_id, crypto_name) VALUES (?, ?)");
        $stmt->bind_param("ss", $crypto_id, $crypto_name);

        if ($stmt->execute()) {
            echo "Ajout de crypto réussi avec succès!";
        } else {
            echo "Erreur lors de l'ajout de la crypto.";
        }
        break;

    case 'load_crypto':
        // Récupération de la liste des cryptos
        $stmt = $conn->prepare("SELECT crypto_id, crypto_name FROM $table_name");
        $stmt->execute();
        $result = $stmt->get_result();

        $cryptos = array();
        while ($row = $result->fetch_assoc()) {
            $cryptos[] = $row;
        }

        echo json_encode($cryptos);
        break;

    default:
        echo "Erreur : type d'opération non valide.";
        break;
}

$stmt->close();
$conn->close();
?>
