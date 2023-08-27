<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

include 'config.php';

$email = $_POST['email'];

$stmt = $conn->prepare("SELECT email FROM global WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode(["success" => false, "message" => "Email non trouvé. Veuillez vous inscrire."]);
    exit();
}

$reset_code = bin2hex(random_bytes(5)); // Génère un code de 10 caractères

// Sauvegarder le code dans la base de données
$stmt = $conn->prepare("UPDATE global SET code_reset = ? WHERE email = ?");
if (!$stmt) {
    die("Erreur de préparation : " . $conn->error);
}

$stmt->bind_param("ss", $reset_code, $email);
$stmt->execute();


$mail = new PHPMailer(true);

try {
    // Paramètres du serveur
    $mail->SMTPDebug = 0; // Activer le mode debug (0 = off (en production), 1 = messages du client, 2 = client et serveur)
    $mail->isSMTP();
    $mail->Host = 'mail.telecom4all.be';
    $mail->SMTPAuth = true;
    $mail->Username = 'infos@telecom4all.be';
    $mail->Password = 'tyvek$S0';
    $mail->SMTPSecure = 'tls';
    $mail->Port = 587;

    // Destinataires
    $mail->setFrom('infos@telecom4all.be', 'Telecom4All');
    $mail->addAddress($email); // Adresse de l'utilisateur

    // Contenu
    $mail->isHTML(true);
    $mail->Subject = 'Code de réinitialisation';
    $mail->Body = "Votre code de réinitialisation est: <b>$reset_code</b>";

    $mail->send();
    echo json_encode(["success" => true, "message" => "Le code de réinitialisation a été envoyé à votre email avec succés. \n une fois récupéré utilisez le ci dessous."]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Erreur lors de l'envoi de l'email: {$mail->ErrorInfo}"]);
}

?>
