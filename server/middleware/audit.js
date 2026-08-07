import AuditLog from '../models/AuditLog.js';
import logger from '../utils/logger.js';

export const audit = (action, resource) => async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;
    
    // Log after response is sent (so we know if it succeeded ideally, but here we just log the attempt)
    if (res.statusCode >= 200 && res.statusCode < 300) {
      AuditLog.create({
        action,
        performedBy: req.user ? req.user.id : null,
        resource,
        details: {
          method: req.method,
          url: req.originalUrl,
          body: req.method !== 'GET' ? req.body : undefined
        },
        ipAddress: req.ip
      }).catch(err => logger.error(`Audit log failed: ${err.message}`));
    }
    
    return res.send(data);
  };
  
  next();
};
