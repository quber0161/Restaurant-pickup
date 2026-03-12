import categoryModel from "../models/categoryModel.js";
import birdiebiteRestaurantModel from "../models/birdiebiteRestaurantModel.js";
import fs from 'fs'

// add category
const addCategory = async (req, res) => {
    let image_file = `${req.file.filename}`;

    let restaurantId = req.adminRestaurantId || null;
    if (req.body.restaurantSlug) {
        const restaurant = await birdiebiteRestaurantModel.findOne({ slug: req.body.restaurantSlug });
        if (restaurant) restaurantId = restaurant._id;
    }

    const category = new categoryModel({
        restaurantId,
        name: req.body.name,
        image: image_file
    })

    try {
        await category.save();
        res.json({ success: true, message: "Category Added", id: category._id, image: image_file })
    } catch (error) {
        console.log(error)
        res.json({ success: false, message: "Error" })
    }
}


// all category list (filter by slug for menu, or admin's restaurantId from token)
const listCategory = async (req, res) => {
    try {
        let filter = {};
        const slug = req.query.slug;
        const adminRestaurantId = req.adminRestaurantId;
        if (slug) {
            const restaurant = await birdiebiteRestaurantModel.findOne({ slug: slug.trim().toLowerCase() });
            if (restaurant) filter.restaurantId = restaurant._id;
            else filter.$or = [{ restaurantId: null }, { restaurantId: { $exists: false } }];
        } else if (adminRestaurantId) {
            filter.restaurantId = adminRestaurantId;
        } else if (req.headers.token) {
            filter._id = { $in: [] }; // Admin with no restaurantId = return empty (never leak other restaurant data)
        } else {
            filter.$or = [{ restaurantId: null }, { restaurantId: { $exists: false } }];
        }
        const categories = await categoryModel.find(filter);
        res.json({ success: true, categories })
    } catch (error) {
        console.log(error);
        res.json({ seccess: false, message: "Error fetching" })
    }
}

// remove food item
const removeCategory = async (req, res) => {
    try {
        const category = await categoryModel.findById(req.body.id);
        fs.unlink(`uploads/categories/${category.image}`, () => { })

        await categoryModel.findByIdAndDelete(req.body.id);
        res.json({ success: true, message: "Category Removed" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error })
    }
}


export { addCategory, listCategory, removeCategory }