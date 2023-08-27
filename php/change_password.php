<?php
include 'config.php';

$uuid = $_POST['uuid'];
$newPassword = $_POST['password'];

// Hasher le nouveau mot de passe
$hashed_password = password_hash($newPassword, PASSWORD_DEFAULT);

// Utiliser l'UUID pour construire le nom de la table spécifique à l'utilisateur
$table_name = $uuid . "_user_info";

// Mettre à jour le mot de passe de l'utilisateur dans la table spécifique
$stmt = $conn->prepare("UPDATE $table_name SET password = ? WHERE uuid = ?");
$stmt->bind_param("ss", $hashed_password, $uuid);

if ($stmt->execute()) {
    echo "Mot de passe mis à jour avec succès, vous allez etre déconnecté \n veuillez vous reconnecter!";
} else {
    echo "Erreur lors de la mise à jour du mot de passe.";
}

$stmt->close();
$conn->close();
?>
