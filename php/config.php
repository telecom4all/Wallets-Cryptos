<?php
$server = "localhost";
$username = "";
$password = "";
$database = "";

// Connexion à la base de données
$conn = new mysqli($server, $username, $password, $database);

// Vérification de la connexion
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
?>
