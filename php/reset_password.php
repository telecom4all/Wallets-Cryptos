<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
include 'config.php';

$reset_code = $_POST['reset_code'];
$new_password = $_POST['new_password'];
$email = $_POST['email'];

// Récupérer l'UUID associé à l'email
$stmt = $conn->prepare("SELECT uuid FROM global WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$uuid = $result->fetch_assoc()['uuid'];

// Vérifier le code de réinitialisation pour l'email spécifié
$stmt2 = $conn->prepare("SELECT code_reset FROM global WHERE email = ?");
$stmt2->bind_param("s", $email);
$stmt2->execute();
$result2 = $stmt2->get_result();
$row = $result2->fetch_assoc();

if ($row['code_reset'] !== $reset_code) {
    echo json_encode(["success" => false, "message" => "Code de réinitialisation invalide."]);
    exit();
}

$table_name = $uuid . "_user_info";

// Mise à jour du mot de passe dans la table de l'utilisateur
$hashed_password = password_hash($new_password, PASSWORD_DEFAULT);
$stmt = $conn->prepare("UPDATE $table_name SET password = ? WHERE email = ?");
$stmt->bind_param("ss", $hashed_password, $email);
$stmt->execute();

// Mettre à jour le champ code_reset dans la table global
$stmt = $conn->prepare("UPDATE global SET code_reset = '' WHERE uuid = ?");
$stmt->bind_param("s", $uuid);
$stmt->execute();

if ($stmt->affected_rows > 0) {
    echo json_encode(["success" => true, "message" => "Mot de passe réinitialisé avec succès.\nvous allez être redirigé vers la page de connexion"]);
} else {
    // pas de mise à jour ou une erreur s'est produite
    echo json_encode(["success" => false, "message" => "Erreur lors de la mise à jour du code de réinitialisation.\n recommencez la procédure du début"]);
    exit();
}



?>
