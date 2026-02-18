// server/services/emailService.js

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// ✅ Mise à jour de la configuration du transporteur Nodemailer pour LWS
const transporter = nodemailer.createTransport({
    host: process.env.LWS_EMAIL_HOST,
    port: process.env.LWS_EMAIL_PORT,
    secure: process.env.LWS_EMAIL_SECURE === 'true', // `true` pour le port 465 (SSL/TLS)
    auth: {
        user: process.env.LWS_EMAIL_USER,
        pass: process.env.LWS_EMAIL_PASS,
    },
});

// En-tête des e-mails pour la marque
const emailHeader = `<div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
    <h1 style="color: #1b1d9a;">Resume AI</h1>
</div>`;

// Pied de page des e-mails
const emailFooter = `<div style="text-align: center; margin-top: 20px; color: #888;">
    <p>Ce mail a été envoyé automatiquement, veuillez ne pas y répondre.</p>
    <p>© ${new Date().getFullYear()} Resume AI. Tous droits réservés.</p>
</div>`;

// Fonction générique pour envoyer un e-mail
const sendEmail = async (to, subject, htmlContent) => {
    try {
        const mailOptions = {
            from: `"RESUME AI" <${process.env.LWS_EMAIL_USER}>`, // Utilise ton adresse e-mail professionnelle ici
            to,
            subject,
            html: `${emailHeader}${htmlContent}${emailFooter}`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`✅ Email envoyé à ${to} avec succès via LWS.`);
    } catch (error) {
        console.error(`❌ Erreur lors de l'envoi de l'e-mail à ${to} via LWS:`, error);
        // Ajoute ces lignes pour plus de détails sur l'erreur
        if (error.responseCode) {
            console.error(`Code de réponse SMTP: ${error.responseCode}`);
        }
        if (error.response) {
            console.error(`Réponse du serveur SMTP: ${error.response}`);
        }
    }
};

const sendActivationEmail = (to, clientName, activationUrl) => {
    const subject = 'Activez votre compte Resume AI';
    const htmlContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Bonjour ${clientName || ''},</h2> 
            <p>Merci pour votre inscription sur Resume AI.</p>
            <p>Veuillez cliquer sur le bouton ci-dessous pour activer votre compte :</p>
            <p style="text-align: center;">
                <a href="${activationUrl}" 
                   style="display: inline-block; padding: 10px 20px; background-color: #1b439a; color: #ffffff; text-decoration: none; border-radius: 5px;">
                    Activer mon compte
                </a>
            </p>
            <p>Ce lien est valide pendant 24 heures.</p>
        </div>
    `;
    return sendEmail(to, subject, htmlContent);
};


const sendResetPasswordEmail = (to, clientName, resetUrl) => {
    const subject = 'Réinitialisation de votre mot de passe chez Resume AI';
    const htmlContent = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h2>Bonjour ${clientName},</h2>
            <p>Vous avez demandé une réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
            <p style="text-align: center;">
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #1b439a; color: #ffffff; text-decoration: none; border-radius: 5px;">
                    Réinitialiser mon mot de passe
                </a>
            </p>
            <p>Ce lien est valide pour une durée limitée. Si vous n'êtes pas à l'origine de cette demande, veuillez ignorer cet e-mail.</p>
            <p>À bientôt !</p>
        </div>
    `;
    return sendEmail(to, subject, htmlContent);
};

module.exports = {
    sendResetPasswordEmail,
    sendActivationEmail
};