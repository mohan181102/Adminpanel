const express = require('express');
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger")
const upload = require("../utils/upload");
const authenticateJWT = require('../utils/JWTauth');
const getDbconnection = require('../DbConnection/CdConnection');
const { DataTypes } = require('sequelize');


/**
 * @swagger
 * /AdvertisementMaster/create:
 *   post:
 *     summary: Create a new advertisement
 *     tags: [AdvertisementMaster]
 *     description: Create a new advertisement with optional image upload.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Category:
 *                 type: string
 *                 description: The category of the advertisement.
 *                 example: Electronics
 *               AdvertisementName:
 *                 type: string
 *                 description: The name of the advertisement.
 *                 example: Special Sale
 *               URL:
 *                 type: string
 *                 description: The URL path of the advertisement.
 *                 example: special-sale
 *               Priority:
 *                 type: integer
 *                 description: The priority of the advertisement.
 *                 example: 1
 *               Status:
 *                 type: boolean
 *                 description: The status of the advertisement.
 *                 example: true
 *               Description:
 *                 type: string
 *                 description: The description of the advertisement.
 *                 example: Special sale on electronics products.
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Optional image file for the advertisement.
 *     responses:
 *       201:
 *         description: Successfully created a new advertisement.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Advertisement created successfully
 *                 AdvertisementMaster:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: The auto-generated ID of the advertisement.
 *                     Category:
 *                       type: string
 *                       description: The category of the advertisement.
 *                     AdvertisementName:
 *                       type: string
 *                       description: The name of the advertisement.
 *                     URL:
 *                       type: string
 *                       description: The URL path of the advertisement.
 *                     Imagepaths:
 *                       type: string
 *                       description: The path to the advertisement's image.
 *                     Priority:
 *                       type: integer
 *                       description: The priority of the advertisement.
 *                     Status:
 *                       type: boolean
 *                       description: The status of the advertisement.
 *                     Description:
 *                       type: string
 *                       description: The description of the advertisement.
 *                   example:
 *                     id: 1
 *                     Category: Electronics
 *                     AdvertisementName: Special Sale
 *                     URL: special-sale
 *                     Imagepaths: http://localhost:3000/uploads/1627650337590-sale.jpg
 *                     Priority: 1
 *                     Status: true
 *                     Description: Special sale on electronics products.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */


router.post('/create', authenticateJWT, upload.single('Image'), async (req, res) => {
    const { Category, AdvertisementName, URL, Priority, Status, Description } = req.body;
    const Image = req.file;
    let imagePath = null;

    // FIND COMPANY USING COMPANYCODE
    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
        return res.status(404).send({ message: "Company not found" })
    }

    // MAKE CONNECTION USING DBNAME
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    // REQUIRE MODEL AND CREATE INSTANCE
    const AdvertisementMaster = require('../models/AdvertisementMaster')(
        sequelizeInstance, DataTypes
    )

    if (Image) {
        imagePath = `${req.protocol}://${req.get('host')}/uploads/${Image.filename}`;
    }

    try {
        const newAdvertisementMaster = await AdvertisementMaster.create({
            Category: Category,
            AdvertisementName: AdvertisementName,
            URL: URL,
            Imagepaths: imagePath,
            Priority: Priority,
            Status: Status,
            Description: Description,
        });

        logger.info(`AdvertisementMaster created: ${newAdvertisementMaster}`)
        res.status(201).json({
            message: 'Advertisement created successfully',
            AdvertisementMaster: newAdvertisementMaster,
        });
    } catch (error) {
        console.error(error);
        logger.error(`Error While Creating AdvertisementMaster: ${error}`)
        res.status(500).json({ error: 'Internal server error' });
    }
});



/**
 * @swagger
 * /AdvertisementMaster/{id}:
 *   get:
 *     summary: Get an advertisement by ID
 *     tags: [AdvertisementMaster]
 *     description: Retrieve a specific advertisement by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the advertisement to retrieve.
 *     responses:
 *       200:
 *         description: Advertisement found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The auto-generated ID of the advertisement.
 *                 Category:
 *                   type: string
 *                   description: The category of the advertisement.
 *                 AdvertisementName:
 *                   type: string
 *                   description: The name of the advertisement.
 *                 URL:
 *                   type: string
 *                   description: The URL path of the advertisement.
 *                 Imagepaths:
 *                   type: string
 *                   description: The path to the advertisement's image.
 *                 Priority:
 *                   type: integer
 *                   description: The priority of the advertisement.
 *                 Status:
 *                   type: boolean
 *                   description: The status of the advertisement.
 *                 Description:
 *                   type: string
 *                   description: The description of the advertisement.
 *               example:
 *                 id: 1
 *                 Category: Electronics
 *                 AdvertisementName: Special Sale
 *                 URL: special-sale
 *                 Imagepaths: http://localhost:3000/uploads/1627650337590-sale.jpg
 *                 Priority: 1
 *                 Status: true
 *                 Description: Special sale on electronics products.
 *       404:
 *         description: Advertisement not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Advertisement Master not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while retrieving the advertisement
 */

router.get("/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters

    // FIND COMPANY USING COMPANYCODE
    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
        return res.status(404).send({ message: "Company not found" })
    }

    // MAKE CONNECTION USING DBNAME
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    // REQUIRE MODEL AND CREATE INSTANCE
    const AdvertiSementMaster = require('../models/AdvertisementMaster')(
        sequelizeInstance, DataTypes
    )
    try {
        const AdvertisementMaster = await AdvertiSementMaster.findByPk(id); // Find the record by its primary key

        if (AdvertisementMaster) {
            logger.info(`AdvertisementMaster get ID:${id}`)
            res.status(200).json(AdvertisementMaster); // Return the found record
        } else {
            res.status(404).json({ error: "Advertisement Master not found" }); // Return a 404 error if not found
        }

    } catch (error) {
        console.error(error);
        logger.error(`Error While Getting AdvertisementMaster ID:${id} ERROR:${error}`)
        res.status(500).json({ error: "An error occurred while retrieving the advertisement" }); // Handle any other errors
    }
});



/**
 * @swagger
 * /AdvertisementMaster/get/all:
 *   get:
 *     summary: Get all advertisements
 *     tags: [AdvertisementMaster]
 *     description: Retrieve a list of all advertisements.
 *     responses:
 *       200:
 *         description: Successfully retrieved all advertisements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The auto-generated ID of the advertisement.
 *                   Category:
 *                     type: string
 *                     description: The category of the advertisement.
 *                   AdvertisementName:
 *                     type: string
 *                     description: The name of the advertisement.
 *                   URL:
 *                     type: string
 *                     description: The URL path of the advertisement.
 *                   Imagepaths:
 *                     type: string
 *                     description: The path to the advertisement's image.
 *                   Priority:
 *                     type: integer
 *                     description: The priority of the advertisement.
 *                   Status:
 *                     type: boolean
 *                     description: The status of the advertisement.
 *                   Description:
 *                     type: string
 *                     description: The description of the advertisement.
 *               example:
 *                 - id: 1
 *                   Category: Electronics
 *                   AdvertisementName: Special Sale
 *                   URL: special-sale
 *                   Imagepaths: http://localhost:3000/uploads/1627650337590-sale.jpg
 *                   Priority: 1
 *                   Status: true
 *                   Description: Special sale on electronics products.
 *                 - id: 2
 *                   Category: Furniture
 *                   AdvertisementName: Summer Discount
 *                   URL: summer-discount
 *                   Imagepaths: http://localhost:3000/uploads/1627650337591-discount.jpg
 *                   Priority: 2
 *                   Status: true
 *                   Description: Summer discount on all furniture items.
 *       404:
 *         description: No advertisements found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: ExProductCategoryMaster not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while retrieving the advertisements
 */


router.get("/get/all", authenticateJWT, async (req, res) => {
    try {

        // FIND COMPANY USING COMPANYCODE
        const companyCode = req.companyCode;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }

        // MAKE CONNECTION USING DBNAME
        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        // REQUIRE MODEL AND CREATE INSTANCE
        const AdvertiSementMaster = require('../models/AdvertisementMaster')(
            sequelizeInstance, DataTypes
        )

        const ExAdvertisementMaster = await AdvertiSementMaster.findAll(); // Find the record by its primary key

        if (ExAdvertisementMaster) {
            logger.info(`All AdvertiSementMaster get successfully`)
            res.status(200).json(ExAdvertisementMaster); // Return the found record
        } else {
            res.status(404).json({ error: "ExProductCategoryMaster not found" }); // Return a 404 error if not found
        }
    } catch (error) {
        console.error(error);
        logger.error(`Error getting AdvertiSement! ERROR:${error}`)
        res.status(500).json({ error: "An error occurred while retrieving the news notice" }); // Handle any other errors
    }
});



/**
 * @swagger
 * /AdvertisementMaster/update/{Id}:
 *   put:
 *     summary: Update an advertisement by ID
 *     tags: [AdvertisementMaster]
 *     description: Update the details of an existing advertisement, including optional image upload.
 *     parameters:
 *       - in: path
 *         name: Id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the advertisement to update.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Category:
 *                 type: string
 *                 description: The category of the advertisement.
 *                 example: Electronics
 *               AdvertisementName:
 *                 type: string
 *                 description: The name of the advertisement.
 *                 example: Special Sale
 *               URL:
 *                 type: string
 *                 description: The URL path of the advertisement.
 *                 example: special-sale
 *               Priority:
 *                 type: integer
 *                 description: The priority of the advertisement.
 *                 example: 1
 *               Status:
 *                 type: boolean
 *                 description: The status of the advertisement.
 *                 example: true
 *               Description:
 *                 type: string
 *                 description: The description of the advertisement.
 *                 example: Special sale on electronics products.
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image file for the advertisement.
 *     responses:
 *       200:
 *         description: Advertisement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: The auto-generated ID of the advertisement.
 *                 Category:
 *                   type: string
 *                   description: The category of the advertisement.
 *                 AdvertisementName:
 *                   type: string
 *                   description: The name of the advertisement.
 *                 URL:
 *                   type: string
 *                   description: The URL path of the advertisement.
 *                 Imagepaths:
 *                   type: string
 *                   description: The path to the advertisement's image.
 *                 Priority:
 *                   type: integer
 *                   description: The priority of the advertisement.
 *                 Status:
 *                   type: boolean
 *                   description: The status of the advertisement.
 *                 Description:
 *                   type: string
 *                   description: The description of the advertisement.
 *               example:
 *                 id: 1
 *                 Category: Electronics
 *                 AdvertisementName: Special Sale
 *                 URL: special-sale
 *                 Imagepaths: http://localhost:3000/uploads/1627650337590-sale.jpg
 *                 Priority: 1
 *                 Status: true
 *                 Description: Special sale on electronics products.
 *       404:
 *         description: Advertisement not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Product category not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while updating the advertisement
 */

router.put("/update/:Id", authenticateJWT, upload.single("Image"), async (req, res) => {
    const { Id } = req.params;
    const { Category, AdvertisementName, URL, Priority, Status, Description } = req.body;
    const Image = req.file;
    let imagePath = null;

    if (Image) {
        imagePath = `${req.protocol}://${req.get("host")}/uploads/${Image.filename}`;
    }

    try {
        // FIND COMPANY USING COMPANYCODE
        const companyCode = req.companyCode;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }

        // MAKE CONNECTION USING DBNAME
        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        // REQUIRE MODEL AND CREATE INSTANCE
        const AdvertiSementMaster = require('../models/AdvertisementMaster')(
            sequelizeInstance, DataTypes
        )

        const existingAdvertisementMaster = await AdvertiSementMaster.findByPk(Id);

        if (existingAdvertisementMaster) {
            // Delete the existing image if a new image is uploaded
            if (Image && existingAdvertisementMaster.Imagepaths) {
                const existingImagePath = existingAdvertisementMaster.Imagepaths.replace(
                    `${req.protocol}://${req.get("host")}`,
                    './',
                );
                fs.unlinkSync(existingImagePath);
                existingAdvertisementMaster.Imagepaths = null;
            }

            // Update product category properties
            existingAdvertisementMaster.Category = Category;
            existingAdvertisementMaster.AdvertisementName = AdvertisementName;
            existingAdvertisementMaster.URL = URL;
            existingAdvertisementMaster.Imagepaths = imagePath || existingAdvertisementMaster.Imagepaths;
            existingAdvertisementMaster.Priority = Priority;
            existingAdvertisementMaster.Status = Status;
            existingAdvertisementMaster.Description = Description;

            // Save the updated record
            await existingAdvertisementMaster.save();

            res.status(200).json(existingAdvertisementMaster);
        } else {
            res.status(404).json({ error: "Product category not found" });
        }
    } catch (error) {
        console.error(error);
        logger.error(`Error while updating Academic master: ERROR:${error}`)
        res.status(500).json({ error: "An error occurred while updating the product category" });
    }
});


/**
 * @swagger
 * /AdvertisementMaster/delete/{id}:
 *   delete:
 *     summary: Delete an advertisement by ID
 *     tags: [AdvertisementMaster]
 *     description: Delete a specific advertisement by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the advertisement to delete.
 *     responses:
 *       200:
 *         description: Advertisement deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Advertisement Master with id 1 deleted successfully
 *       404:
 *         description: Advertisement not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Advertisement Master with id 1 not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */


router.delete("/delete/:id", authenticateJWT, async (req, res) => {
    const { id } = req.params;

    try {
        // FIND COMPANY USING COMPANYCODE
        const companyCode = req.companyCode;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }

        // MAKE CONNECTION USING DBNAME
        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        // REQUIRE MODEL AND CREATE INSTANCE
        const AdvertiSementMaster = require('../models/AdvertisementMaster')(
            sequelizeInstance, DataTypes
        )


        // Assuming mdl.db.ProductCategoryMaster is your model
        const deletedAdvertisementMaster = await AdvertiSementMaster.destroy({
            where: { id: id }
        });

        if (deletedAdvertisementMaster === 1) {
            res.status(200).json({
                message: `Advertisement Master with id ${id} deleted successfully`,
            });
        } else {
            res.status(404).json({
                error: `Advertisement Master with id ${id} not found`,
            });
        }

        logger.info(`Advertisement Master with id ${id} deleted successfully`)
    } catch (error) {
        console.error(error);
        logger.error(`Advertisment Master Delete Error ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;