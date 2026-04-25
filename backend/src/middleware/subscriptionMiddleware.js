const verifyAccess = (req, res, next) => {
  const targetClassId = req.params.classId || req.body.classId || req.query.classId;
  const targetSubjectId = req.params.subjectId || req.body.subjectId || req.query.subjectId;

  // Admins & Teachers bypass this check
  if (req.user && ['Admin', 'Teacher'].includes(req.user.role)) {
    return next();
  }

  if (!req.user || !req.user.activeSubscriptions) {
    return res.status(403).json({ message: 'No active subscriptions found' });
  }

  const now = new Date();
  
  const hasAccess = req.user.activeSubscriptions.some(sub => {
    if (new Date(sub.expiryDate) < now) return false;

    if (sub.type === 'bundle' && targetClassId && String(sub.referenceId) === String(targetClassId)) {
      return true;
    }
    
    if (sub.type === 'subject' && targetSubjectId && String(sub.referenceId) === String(targetSubjectId)) {
      return true;
    }

    // Edge case mapping if a subject resolves back to a bundle we might need a db check,
    // but typically front-end ensures classId is passed alongside subjectId if part of bundle.
    return false;
  });

  if (hasAccess) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Subscription required or expired.' });
  }
};

module.exports = { verifyAccess };
