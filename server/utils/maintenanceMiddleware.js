const Settings = require('../models/Settings');

const checkMaintenance = async (req, res, next) => {
    try {
        const settings = await Settings.findOne();
        if (settings && settings.isMaintenanceMode) {
            // Check if user is admin - admins should still be able to use the site? 
            // Actually, keep it simple for now: block everyone from purchasing.
            // But we can check req.user if available.
            
            return res.status(503).json({ 
                message: 'Platform is currently locked for maintenance. Please try again later.',
                isMaintenance: true 
            });
        }
        next();
    } catch (err) {
        next();
    }
};

module.exports = checkMaintenance;
