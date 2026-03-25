/**
 * Pricing Utility for Negotiations
 */

function calculateAISuggestedPrice(product, quantity) {
    // Base requirement:
    // if quantity >= 100 -> 12% discount
    // if quantity >= 50  -> 8% discount
    // if quantity >= 20  -> 5% discount
    // else -> no negotiation

    const originalUnitPrice = product.sellingPrice;
    const originalTotalPrice = originalUnitPrice * quantity;

    let discountPercentage = 0;
    if (quantity >= 100) {
        discountPercentage = 0.12;
    } else if (quantity >= 50) {
        discountPercentage = 0.08;
    } else if (quantity >= 20) {
        discountPercentage = 0.05;
    }

    const calculatedDiscount = originalTotalPrice * discountPercentage;
    let aiSuggestedPrice = originalTotalPrice - calculatedDiscount;

    // Rules:
    // 1. Never go below merchant minimum margin. 
    // We use costPrice as baseline. E.g., at least 5% margin above cost.
    const totalCostPrice = product.costPrice * quantity;
    const floorPrice = totalCostPrice * 1.05; // 5% above cost price

    if (aiSuggestedPrice < floorPrice) {
        aiSuggestedPrice = floorPrice;
    }

    // 2. Must always be >= product.minimumAllowedPrice * quantity (if defined by merchant in future)
    if (product.minimumAllowedPrice) {
        const absoluteMin = product.minimumAllowedPrice * quantity;
        if (aiSuggestedPrice < absoluteMin) {
            aiSuggestedPrice = absoluteMin;
        }
    }

    return {
        originalUnitPrice,
        originalTotalPrice,
        aiSuggestedPrice,
        discountPercentage,
        quantity
    };
}

module.exports = {
    calculateAISuggestedPrice
};
