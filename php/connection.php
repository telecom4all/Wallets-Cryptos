<?php

include 'config.php';

$email = $_POST['email'];
$password = $_POST['password'];


// Récupérer l'UUID de l'utilisateur
$stmt = $conn->prepare("SELECT uuid FROM global WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$uuid_result = $stmt->get_result();

if ($uuid_result->num_rows == 0) {
    header("Location: ../index.html?invalidEmail=false");
    exit();
}

$uuid_data = $uuid_result->fetch_assoc();
$uuid = $uuid_data['uuid'];

// Utiliser l'UUID pour construire le nom de la table spécifique à l'utilisateur
$table_name = $uuid . "_user_info";


// Récupérer les informations de l'utilisateur depuis la table spécifique
$stmt = $conn->prepare("SELECT password, login_attempts, last_attempt FROM $table_name WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    header("Location: ../index.html?emailOrPass=false");
    exit();
}

$user_data = $result->fetch_assoc();
$hashed_password = $user_data['password'];
$login_attempts = $user_data['login_attempts'];
$last_attempt = strtotime($user_data['last_attempt']);
$one_hour_ago = strtotime("-1 hour");

if ($login_attempts >= 5 && $last_attempt > $one_hour_ago) {
    header("Location: ../index.html?toManyTime=false");
    exit();
}

if (password_verify($password, $hashed_password)) {
    
    // Réinitialiser les tentatives de connexion
    $stmt = $conn->prepare("UPDATE $table_name SET login_attempts = 0 WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();

    header("Location: ../main.html?uuid=" . $uuid."&email=" . $email);

} else {
    // Augmenter le compteur de tentatives
    $new_attempts = $login_attempts + 1;
    $stmt = $conn->prepare("UPDATE $table_name SET login_attempts = ?, last_attempt = NOW() WHERE email = ?");
    $stmt->bind_param("is", $new_attempts, $email);
    $stmt->execute();
    header("Location: ../index.html?emailOrPass=false");
}

$stmt->close();
$conn->close();
?>
