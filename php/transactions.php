<?php

ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'config.php';

$uuid = $_POST['uuid'];

if (!$uuid) {
    echo json_encode(["success" => false, "message" => "Erreur: UUID non fourni."]);
    exit();
}

$table_name = $uuid . "_transactions";
$type = $_POST['type'];

switch ($type) {
    case 'add_transactions':
        $token = $_POST['token'];
        $tokenId = $_POST['tokenId'];
        $date = $_POST['date'];
        $invest = $_POST['invest'];
        $supply = $_POST['supply'];
        $purchasePrice = $_POST['purchasePrice'];
        $transactionType = $_POST['transactionType'];

        $stmt = $conn->prepare("INSERT INTO $table_name (token, tokenId, date, invest, supply, purchasePrice, transactionType) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("sssssss", $token, $tokenId, $date, $invest, $supply, $purchasePrice, $transactionType);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Transaction ajoutée avec succès!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erreur lors de l'ajout de la transaction."]);
        }

        $stmt->close();
        break;

    case 'load_transaction':
        $stmt = $conn->prepare("SELECT * FROM $table_name");
        $stmt->execute();
        $result = $stmt->get_result();

        $transactions = array();
        while ($row = $result->fetch_assoc()) {
            $transactions[] = $row;
        }

        echo json_encode($transactions);
        $stmt->close();
        break;

    case 'delete_transaction':
        $transaction_id = $_POST['transaction_id'];

        if (empty($transaction_id)) {
            echo json_encode(["success" => false, "message" => "Données manquantes."]);
            exit();
        }

        $stmt = $conn->prepare("DELETE FROM $table_name WHERE id = ?");
        $stmt->bind_param("i", $transaction_id);

        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "Transaction supprimée avec succès."]);
        } else {
            echo json_encode(["success" => false, "message" => "Erreur lors de la suppression."]);
        }

        $stmt->close();
        break;

    default:
        echo json_encode(["success" => false, "message" => "Type d'action non reconnu."]);
        break;
}

$conn->close();
?>
