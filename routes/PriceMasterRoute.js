const express = require('express');
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");

const upload = require("../utils/upload");
const { where, DataTypes } = require('sequelize');
const logger = require('../utils/logger');
const authenticateJWT = require('../utils/JWTauth');
const getDbconnection = require('../DbConnection/CdConnection');



/**
 * @swagger
 * /pricemaster/create:
 *   post:
 *     summary: Create a new PriceMaster
 *     description: Endpoint to create a new PriceMaster entry with an optional image upload.
 *     tags:
 *       - PriceMaster
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Categoery:
 *                 type: string
 *                 description: Category of the PriceMaster
 *               PlanName:
 *                 type: string
 *                 description: Name of the plan
 *               Priority:
 *                 type: integer
 *                 description: Priority level of the plan
 *               Status:
 *                 type: string
 *                 description: Status of the plan
 *               URL:
 *                 type: string
 *                 description: URL related to the plan
 *               TextArea:
 *                 type: string
 *                 description: Additional text or description
 *               GruopName:
 *                 type: string
 *                 description: Group name related to the plan
 *               Image:
 *                 type: file
 *                 format: binary
 *                 description: Optional image file
 *     responses:
 *       200:
 *         description: PriceMaster created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PriceMaster created successfully
 *       500:
 *         description: Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server Error
 */


router.post('/create', authenticateJWT, upload.single('Image'), async (req, res) => {
    try {
        const { Categoery, PlanName, Priority, Status, URL, TextArea, GruopName } = req.body
        let ImagePath = null;
        if (req.file) {
            ImagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.originalname}`
        }

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
        const PriceMaster = require('../models/PriceMaster.model')(
            sequelizeInstance, DataTypes
        )

        await PriceMaster.create({
            Category: Categoery,
            PlanName,
            Priority,
            Status,
            URL,
            TextArea,
            GruopName,
            Image: ImagePath
        })

        logger.info(`Pricemaster created successfully`)
        res.status(200).json({ message: 'PriceMaster created successfully' })

    } catch (error) {
        console.log(error);
        logger.error(`Error creating PriceMaster ERROR:${error}`)
        res.status(500).json({ error: 'Server Error' });
    }
})


/**
 * @swagger
 * /pricemaster/getAll:
 *   get:
 *     summary: Retrieve all price master entries
 *     description: Fetches all records from the PriceMasters table.
 *     tags:
 *       - PriceMaster
 *     responses:
 *       200:
 *         description: Successfully retrieved all price master records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'All Price Master'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server Error'
 */

router.get('/getAll', authenticateJWT, async function (req, res) {
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
        const PriceMaster = require('../models/PriceMaster.model')(
            sequelizeInstance, DataTypes
        )

        const data = await PriceMaster.findAll()

        if (data) {
            logger.info(`All PriceMaster retrieved successfully`)
            return res.status(200).json({ message: 'All Price Master', data: data })
        }
    } catch (error) {
        console.log(error);
        logger.error(`Error retrieving all PriceMaster ERROR:${error}`)
        res.status(500).json({ error: 'Server Error' });
    }
})



/**
 * @swagger
 * /pricemaster/delete:
 *   delete:
 *     summary: Delete price master entries by IDs
 *     tags:
 *       - PriceMaster
 *     description: Deletes multiple price master records based on the provided IDs.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: Successfully deleted price master records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'PriceMaster deleted successfully'
 *       404:
 *         description: IDs should be in array format or error while deleting Price Master
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'IDs should be in array format'
 *                 error:
 *                   type: string
 *                   example: 'error while deleting Price Master'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server Error'
 */


router.delete('/delete', authenticateJWT, async function (req, res) {
    try {
        const { ids } = req.body
        const allPrice = await mdl.db.PriceMasters.findAll()
        if (!Array.isArray(ids) || ids.length == 0) {
            return res.status(404).json({ message: 'IDs should be in array format' })
        }

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
        const PriceMaster = require('../models/PriceMaster.model')(
            sequelizeInstance, DataTypes
        )

        const DeletedItem = await PriceMaster.findByPk(ids[0])
        const deleteditem = DeletedItem.dataValues

        let allValue = []

        allPrice.forEach(item => {
            if (item.dataValues.GruopName == deleteditem.PlanName) {
                console.log(item)
                allValue.push(item)
            }
        })

        if (allValue.length == 0) {
            await PriceMaster.destroy({
                where: {
                    id: ids
                }
            })
        } else {
            return res.status(403).json({ message: "Delete child Menu first ?" })
        }

        logger.info(`PriceMaster deleted successfully`)
        res.status(200).json({ message: 'PriceMaster deleted successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Error updating PriceMaster ERROR:${error}`)
        res.status(500).json({ error: 'Server Error' })
    }
})




/**
 * @swagger
 * /pricemaster/update/{id}:
 *   put:
 *     summary: Update a PriceMaster record
 *     tags:
 *       - PriceMaster
 *     description: Updates an existing PriceMaster record by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the PriceMaster record to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateCategoery:
 *                 type: string
 *                 description: Category of the PriceMaster record.
 *               UpdatePlanName:
 *                 type: string
 *                 description: Plan name of the PriceMaster record.
 *               UpdatePriority:
 *                 type: integer
 *                 description: Priority of the PriceMaster record.
 *               UpdateStatus:
 *                 type: string
 *                 description: Status of the PriceMaster record.
 *               UpdateURL:
 *                 type: string
 *                 description: URL associated with the PriceMaster record.
 *               UpdateTextArea:
 *                 type: string
 *                 description: Additional text area information for the PriceMaster record.
 *               UpdateGruopName:
 *                 type: string
 *                 description: Group name associated with the PriceMaster record.
 *               UpdateImage:
 *                 type: string
 *                 description: Existing image URL for the PriceMaster record. This will be updated if a new image is provided.
 *     responses:
 *       '200':
 *         description: PriceMaster updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: PriceMaster updated successfully
 *       '404':
 *         description: ID not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: id not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server Error
 */


router.put('/update/:id', authenticateJWT, upload.single('Image'), async (req, res) => {
    try {
        const { id } = req.params
        const { UpdateCategoery, UpdatePlanName, UpdatePriority, UpdateStatus, UpdateURL, UpdateTextArea, UpdateGruopName, UpdateImage } = req.body
        let ImagePath = null;

        if (req.file) {
            ImagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.originalname}`
        }

        if (!id) {
            return res.status(404).send({ message: 'id not found' })
        }

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
        const PriceMaster = require('../models/PriceMaster.model')(
            sequelizeInstance, DataTypes
        )

        await PriceMaster.update(
            {
                Category: UpdateCategoery,
                PlanName: UpdatePlanName,
                Priority: UpdatePriority,
                Status: UpdateStatus,
                URL: UpdateURL,
                TextArea: UpdateTextArea,
                GruopName: UpdateGruopName,
                Image: ImagePath != null ? ImagePath : UpdateImage
            },
            {
                where: {
                    Id: id
                }
            }
        )

        logger.info(`PriceMaster updated successfully`)
        res.status(200).json({ message: 'PriceMaster updated successfully' })

    } catch (error) {
        console.log(error)
        logger.error(`Error updating price master: ${error.message}`)
        res.status(500).json({ error: 'Server Error' })
    }
})


module.exports = router