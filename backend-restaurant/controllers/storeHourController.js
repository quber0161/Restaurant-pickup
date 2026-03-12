import storeHourModel from "../models/storeHourModel.js";
import birdiebiteRestaurantModel from "../models/birdiebiteRestaurantModel.js";
import moment from 'moment'

async function resolveRestaurantId(req) {
  if (req.adminRestaurantId) return req.adminRestaurantId;
  const slug = req.query.slug || req.body.slug || req.body.restaurantSlug;
  if (slug) {
    const restaurant = await birdiebiteRestaurantModel.findOne({ slug: slug.trim().toLowerCase() });
    return restaurant?._id || null;
  }
  return null;
}

// Get all weekly hours and overrides (per restaurant)
const getHour = async (req, res) => {
  try {
    const restaurantId = await resolveRestaurantId(req);
    const filter = restaurantId ? { restaurantId } : { $or: [{ restaurantId: null }, { restaurantId: { $exists: false } }] };
    const storeHours = await storeHourModel.find(filter);
    res.json(storeHours);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store hours' });
  }
};

// Add or update weekly hours or override (per restaurant)
const setHour = async (req, res) => {
  const { day, isOverride, date, openTime, closeTime, isClosed, restaurantSlug } = req.body;
  try {
    const restaurantId = await resolveRestaurantId(req);
    if (!restaurantId) {
      return res.status(400).json({ error: 'Restaurant context required (slug or admin token)' });
    }
    let query = { restaurantId };
    if (isOverride) {
      query.date = date;
      query.isOverride = true;
    } else {
      query.day = day;
      query.isOverride = false;
    }
    const updated = await storeHourModel.findOneAndUpdate(
      query,
      { restaurantId, day, isOverride, date, openTime, closeTime, isClosed },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save store hour' });
  }
};

// Delete an override (per restaurant)
const deleteHour = async (req, res) => {
  try {
    const restaurantId = await resolveRestaurantId(req);
    const filter = { date: req.params.date, isOverride: true };
    if (restaurantId) filter.restaurantId = restaurantId;
    await storeHourModel.deleteOne(filter);
    res.json({ message: 'Override deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete override' });
  }
};

const isStoreOpenNow = async (req, res) => {
  try {
    const restaurantId = await resolveRestaurantId(req);
    const baseFilter = restaurantId ? { restaurantId } : { $or: [{ restaurantId: null }, { restaurantId: { $exists: false } }] };

    const clientDate = req.query.clientDate;
    const clientTime = req.query.clientTime;
    const now = (clientDate && clientTime)
      ? moment(`${clientDate} ${clientTime}`, 'YYYY-MM-DD HH:mm')
      : moment();
    const today = now.format('dddd');
    const todayDate = now.format('YYYY-MM-DD');

    const override = await storeHourModel.findOne({ ...baseFilter, date: todayDate, isOverride: true });
    const rule = override || await storeHourModel.findOne({ ...baseFilter, day: today, isOverride: false });

    if (!rule) {
      return res.json({ isOpen: true, isOrderAllowed: true, isPreOrderTime: false });
    }

    if (rule.isClosed) {
      return res.json({ isOpen: false, isOrderAllowed: false, isPreOrderTime: false });
    }

    const openMoment = moment(`${todayDate} ${rule.openTime}`, 'YYYY-MM-DD HH:mm');
    const closeMoment = moment(`${todayDate} ${rule.closeTime}`, 'YYYY-MM-DD HH:mm');
    const fifteenMinutesBeforeClose = closeMoment.clone().subtract(15, 'minutes');
    const oneHourBeforeOpen = openMoment.clone().subtract(1, 'hours');

    const isOpen = now.isBetween(openMoment, closeMoment, null, '[)');
    const isOrderAllowed = now.isBetween(openMoment, fifteenMinutesBeforeClose, null, '[)');
    const isPreOrderTime = now.isBetween(oneHourBeforeOpen, openMoment, null, '[)');

    return res.json({ isOpen, isOrderAllowed, isPreOrderTime });
  } catch (err) {
    console.error("Error checking store status:", err);
    return res.status(500).json({ error: "Failed to check store status" });
  }
};



export { getHour, setHour, deleteHour, isStoreOpenNow }