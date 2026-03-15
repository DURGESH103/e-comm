const express = require('express');
const { addAddress, getAddresses, updateAddress, deleteAddress, setDefault } = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.post('/',           addAddress);
router.get('/',            getAddresses);
router.put('/:id',         updateAddress);
router.delete('/:id',      deleteAddress);
router.put('/:id/default', setDefault);

module.exports = router;
