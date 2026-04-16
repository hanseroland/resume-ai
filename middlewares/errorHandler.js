const errorHandler = (err, req, res, next) => {
    // On log l'erreur pour le dev
    console.error(err.stack); 

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    res.status(statusCode).json({
        success: false,
        message: err.message || "Erreur Serveur Interne",
        // On n'affiche la stack trace qu'en développement
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = errorHandler;