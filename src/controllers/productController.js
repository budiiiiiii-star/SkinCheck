const ProductModel = require('../models/productModel');

const recommendations_get = async (req, res) => {
    try {
        const products = await ProductModel.findAllActive();
        // Here we could filter by the user's latest scan results or profile if we wanted.
        // For now, we display all active catalog products and let the view/AI highlight them.
        res.render('pages/customer_recommendations', { user: req.user, products });
    } catch (err) {
        console.error(err);
        res.status(500).send("Error loading recommendations");
    }
};

module.exports = {
    recommendations_get
};
