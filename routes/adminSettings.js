const router = new (require('express')).Router();
const { IPSettings } = require('../models/IPSettings');

const checkAdmin = (req, res, next) => {
    console.log(req.permissions.system)
  if (!req.permissions.isAdmin && !req.permissions.system.includes('Update Admin Settings')) {
    res.status(401).send("Unauthorized Access");
    return;
  }
  next();
};

router.get('/api/admin/ip-settings', checkAdmin, async (req, res) => {
  try {
    let settings = await IPSettings.findOne({});
    if (!settings) {
      settings = await IPSettings.create({
        ipAddresses: [],
        isEnabled: false
      });
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.post('/api/admin/ip-settings', checkAdmin, async (req, res) => {
  try {
    const { ipAddresses, isEnabled } = req.body;
    
    let settings = await IPSettings.findOne({});
    if (!settings) {
      settings = await IPSettings.create({
        ipAddresses,
        isEnabled,
        lastModifiedBy: req.user.id
      });
    } else {
      settings = await IPSettings.findOneAndUpdate(
        {},
        {
          ipAddresses,
          isEnabled,
          lastModifiedBy: req.user.id,
          lastModifiedAt: new Date()
        },
        { new: true }
      );
    }
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

module.exports = router;