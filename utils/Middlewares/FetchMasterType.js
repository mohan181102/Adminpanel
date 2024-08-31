// middleware/fetchMasterType.js function for Uploading Image Files directly from router Page
const mdl = require('../../models'); // Adjust the path accordingly

const fetchMasterType = (modelName) => async (req, res, next) => {
    const masterId = parseInt(req.params.id, 10); // Adjust if the ID parameter name is different

    try {
        const model = mdl.db[modelName];
        if (!model) {
            return res.status(400).json({ error: 'Invalid model name.' });
        }

        const record = await model.findByPk(masterId);
        if (!record) {
            return res.status(404).json({ error: `${modelName} not found.` });
        }

        req.masterType = record.MasterType; // Attach masterType to request object
        req.masterId = masterId; // Attach masterId if needed elsewhere
        //req.branchId = record.branchId;
        next();
    } catch (error) {
        console.error('Error fetching masterType:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = fetchMasterType;
