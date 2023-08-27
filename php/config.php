<?php
$server = "localhost";
$username = "wallets";
$password = "6G9nf09f18BHO1IB";
$database = "Wallets";

// Connexion à la base de données
$conn = new mysqli($server, $username, $password, $database);

// Vérification de la connexion
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
