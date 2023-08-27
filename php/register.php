<?php
include 'config.php';

$email = $_POST['email'];
$password = $_POST['password'];

// Vérification si l'email existe déjà
$stmt = $conn->prepare("SELECT email FROM global WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();


if ($result->num_rows > 0) {
    header("Location: ../index.html?emailExists=true");
    exit();
}

// Génération de l'UUID
$uuid = bin2hex(random_bytes(5)); // Génère un UUID de 10 caractères


// Cryptage du mot de passe
$hashed_password = password_hash($password, PASSWORD_DEFAULT);

// Insertion dans la table global
$stmt = $conn->prepare("INSERT INTO global (uuid, email, code_reset) VALUES (?, ?, ?)");
$code_reset = "";  // définir code_reset comme une chaîne vide
$stmt->bind_param("sss", $uuid, $email, $code_reset); // ajouter le troisième paramètre pour code_reset
$stmt->execute();

// Création des tables pour l'utilisateur
$table_prefix = $uuid;

// Table des informations utilisateur
$sql = "CREATE TABLE ${table_prefix}_user_info (
    email VARCHAR(255) NOT NULL,
    uuid VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    login_attempts VARCHAR(255) NOT NULL,
    last_attempt VARCHAR(255) NOT NULL,
    double_auth BOOLEAN DEFAULT FALSE,
    creation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    stay_connected BOOLEAN DEFAULT FALSE
)";
$conn->query($sql);

// Enregistrement des infos dans la table utilisateur
$stmt = $conn->prepare("INSERT INTO ${table_prefix}_user_info (email, uuid, password, login_attempts, last_attempt) VALUES (?, ?, ?, ?, NOW())");
$stmt->bind_param("sssi", $email, $uuid, $hashed_password, $login_attempts);

$login_attempts = 0;  // Initialiser à 0

$stmt->execute();

// Table des cryptos
$sql = "CREATE TABLE ${table_prefix}_cryptos (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    crypto_id VARCHAR(255) NOT NULL,
    crypto_name VARCHAR(255) NOT NULL
)";
$conn->query($sql);

// Table des transactions
$sql = "CREATE TABLE ${table_prefix}_transactions (
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(255) NOT NULL,
    tokenId VARCHAR(255) NOT NULL,
    date DATETIME NOT NULL,
    invest FLOAT NOT NULL,
    supply FLOAT NOT NULL,
    purchasePrice FLOAT NOT NULL,
    transactionType VARCHAR(255) NOT NULL
)";
$conn->query($sql);

$stmt->close();
$conn->close();

// Redirection vers index.html avec une notification
header("Location: ../index.html?registered=true");
?>
