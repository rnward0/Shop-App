exports.getPageNotFound = (req, res, next) => {
    // res.status(404).sendFile(path.join(__dirname, 'views', 'page-not-found.html'));
    res.status(404).render('page-not-found', {pageTitle: 'Page Not Found', path: null});
}