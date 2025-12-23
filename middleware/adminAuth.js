module.exports = (req, res, next) => {
    if (req.session.user && req.session.user.is_admin) {
        return next();
    }
    req.flash('error', 'Unauthorized access. Admins only.');
    res.redirect('/dashboard');
};
