import userModel from "../models/userModel.js";
import extraModel from "../models/extraModel.js";

// 🟢 Add item to cart (Modify to store as separate items)
const addToCart = async (req, res) => {
    const { itemId, extras, comment, quantity, mandatoryOptions } = req.body;
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (!user.cartData || typeof user.cartData !== "object") {
            user.cartData = {};
        }

        // 🔑 Generate Unique Key using itemId + sorted extras + comment + mandatory options
        const extrasKey = (extras && extras.length > 0)
            ? extras.map(extra => `${extra._id}-${extra.quantity}`).sort().join("_")
            : "no-extras";

        const mandatoryKey = (mandatoryOptions && Object.keys(mandatoryOptions).length > 0)
            ? Object.entries(mandatoryOptions)
                .map(([key, val]) => `${key}-${val._id}`) // include key & selected option _id
                .sort()
                .join("_")
            : "no-mandatory";

        const uniqueKey = `${itemId}_${extrasKey}_${mandatoryKey}_${comment || "no-comment"}`;

        if (user.cartData[uniqueKey]) {
            user.cartData[uniqueKey].quantity += quantity || 1;
        } else {
            user.cartData[uniqueKey] = {
                itemId,
                quantity: quantity || 1,
                extras,
                comment: comment || "",
                mandatoryOptions: mandatoryOptions || {}
            };
        }

        await userModel.findByIdAndUpdate(userId, { cartData: user.cartData });

        res.json({ success: true, message: "Item added to cart", cartData: user.cartData });
    } catch (error) {
        console.error("❌ Error adding to cart:", error);
        res.json({ success: false, message: "Error adding to cart" });
    }
};




// 🟢 Remove item from cart (Updated for unique cart keys)
const removeFromCart = async (req, res) => {
    const { cartKey } = req.body; // Use the new unique key format
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.cartData[cartKey]) {  
            if (user.cartData[cartKey].quantity > 1) {
                user.cartData[cartKey].quantity -= 1; // Reduce quantity
            } else {
                delete user.cartData[cartKey]; // Remove item completely
            }
        } else {
            return res.json({ success: false, message: "Item not found in cart" });
        }

        // ✅ Save changes
        user.markModified('cartData');
        await user.save();

        res.json({ success: true, message: "Item removed from cart", cartData: user.cartData });

    } catch (error) {
        console.error("❌ Error removing item:", error);
        res.json({ success: false, message: "Error removing item from cart" });
    }
};



// 🟢 Get user cart
const getCart = async (req, res) => {
    const userId = req.userId;

    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }
        res.json({ success: true, cartData: user.cartData || {} });
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
        res.json({ success: false, message: "Error fetching cart" });
    }
};


export { addToCart, removeFromCart, getCart };