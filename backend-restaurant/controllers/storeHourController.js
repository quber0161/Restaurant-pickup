import storeHourModel from "../models/storeHourModel.js";
import moment from 'moment'

// Get all weekly hours and overrides
const getHour = async (req, res) => {
  try {
    const storeHours = await storeHourModel.find({});
    res.json(storeHours);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch store hours' });
  }
};

// Add or update weekly hours or override
const setHour = async (req, res) => {
  const { day, isOverride, date, openTime, closeTime, isClosed } = req.body;
  try {
    let query = isOverride ? { date, isOverride: true } : { day, isOverride: false };
    const updated = await storeHourModel.findOneAndUpdate(
      query,
      { day, isOverride, date, openTime, closeTime, isClosed },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save store hour' });
  }
};

// Delete an override (optional)
const deleteHour =  async (req, res) => {
  try {
    await storeHourModel.deleteOne({ date: req.params.date, isOverride: true });
    res.json({ message: 'Override deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete override' });
  }
};

const isStoreOpenNow = async (req, res) => {
  try {
    const now = moment();
    const today = now.format('dddd'); // e.g., "Monday"
    const todayDate = now.format('YYYY-MM-DD');

    // Check for override first
    const override = await storeHourModel.findOne({ date: todayDate, isOverride: true });
    const rule = override || await storeHourModel.findOne({ day: today, isOverride: false });

    if (!rule || rule.isClosed) {
      return res.json({ isOpen: false });
    }

    const openTime = moment(`${todayDate} ${rule.openTime}`, 'YYYY-MM-DD HH:mm');
    const closeTime = moment(`${todayDate} ${rule.closeTime}`, 'YYYY-MM-DD HH:mm');

    const isOpen = now.isBetween(openTime, closeTime);
    return res.json({ isOpen });
  } catch (err) {
    console.error("Error checking store status:", err);
    return res.status(500).json({ error: "Failed to check store status" });
  }
};






export { getHour, setHour, deleteHour, isStoreOpenNow }
