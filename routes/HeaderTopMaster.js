const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const authenticateJWT = require("../utils/JWTauth");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");


/**
 * @swagger
 * /headertopmaster/create:
 *   post:
 *     summary: Create a new header entry
 *     description: Creates a new header entry in the `HeaderTopMaster` table with the specified details.
 *     tags:
 *       - Header Top Master
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: The title of the header.
 *                 example: "New Header"
 *               Priority:
 *                 type: integer
 *                 description: The priority level of the header.
 *                 example: 1
 *               Bgcolor:
 *                 type: string
 *                 description: The background color of the header in hexadecimal format.
 *                 example: "#FFFFFF"
 *               Status:
 *                 type: string
 *                 description: The status of the header (e.g., active, inactive).
 *                 example: "active"
 *               TextArea:
 *                 type: string
 *                 description: Additional text or content related to the header.
 *                 example: "Some additional content here."
 *     responses:
 *       200:
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Created successfully"
 *                 data:
 *                   type: object
 *                   description: The created header entry.
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.post('/create', authenticateJWT, async function (req, res) {
    const { Title, Priority, BgColor, Status, TextArea } = req.body;

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
        const HeaderTopMaster = require('../models/HomePageContentMaster')(
            sequelizeInstance, DataTypes
        )
        const result = await HeaderTopMaster.create({
            Title,
            Priority,
            BgColor,
            Status,
            TextArea
        })

        logger.info(`Created successfully ${result}`)
        return res.status(200).send({ message: 'Created successfully', data: result })
    } catch (error) {
        console.log(error);
        logger.error(`HomepageContentMaster creation ERROR:${error}`)
        res.status(500).json({ message: 'Server error' });
    }
})


/**
 * @swagger
 * /headertopmaster/getAll:
 *   get:
 *     summary: Retrieve all header entries
 *     description: Fetches all entries from the `HeaderTopMaster` table.
 *     tags:
 *       - Header Top Master
 *     responses:
 *       200:
 *         description: Successfully retrieved all entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully loaded all"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the header entry.
 *                         example: 1
 *                       Title:
 *                         type: string
 *                         description: The title of the header.
 *                         example: "Sample Header"
 *                       Priority:
 *                         type: integer
 *                         description: The priority level of the header.
 *                         example: 1
 *                       Bgcolor:
 *                         type: string
 *                         description: The background color of the header in hexadecimal format.
 *                         example: "#FFFFFF"
 *                       Status:
 *                         type: string
 *                         description: The status of the header (e.g., active, inactive).
 *                         example: "active"
 *                       TextArea:
 *                         type: string
 *                         description: Additional text or content related to the header.
 *                         example: "Some additional content here."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
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
        const HeaderTopMaster = require('../models/HomePageContentMaster')(
            sequelizeInstance, DataTypes
        )
        const result = await HeaderTopMaster.findAll()
        logger.info(`Successfully loaded all HeaderTopMaster ${result}`)
        res.status(200).json({ message: 'Successfully loaded all', data: result })
    } catch (error) {
        console.log(error)
        logger.error(`failed to load ${error.message}`)
        res.status(500).json({ message: 'Server error' })
    }
})



/**
 * @swagger
 * /headertopmaster/update/{id}:
 *   put:
 *     summary: Update a specific header entry
 *     description: Updates the details of a specific header entry identified by its ID in the `HeaderTopMaster` table.
 *     tags:
 *       - Header Top Master
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Unique identifier of the header entry to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateTitle:
 *                 type: string
 *                 description: The new title of the header.
 *                 example: "Updated Header"
 *               UpdatePriority:
 *                 type: integer
 *                 description: The new priority level of the header.
 *                 example: 2
 *               UpdateBgColor:
 *                 type: string
 *                 description: The new background color of the header in hexadecimal format.
 *                 example: "#FF0000"
 *               UpdateStatus:
 *                 type: string
 *                 description: The new status of the header (e.g., active, inactive).
 *                 example: "inactive"
 *               UpdateTextArea:
 *                 type: string
 *                 description: Updated additional text or content related to the header.
 *                 example: "Updated content here."
 *     responses:
 *       200:
 *         description: Header updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Header updated successfully"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */

router.put('/update/:id', authenticateJWT, async function (req, res) {
    try {
        const { id } = req.params
        const { UpdateTitle, UpdatePriority, UpdateBgColor, UpdateStatus, UpdateTextArea } = req.body

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
        const HeaderTopMaster = require('../models/HomePageContentMaster')(
            sequelizeInstance, DataTypes
        )

        await HeaderTopMaster.update(
            {
                Title: UpdateTitle,
                Priority: UpdatePriority,
                BgColor: UpdateBgColor,
                Status: UpdateStatus,
                TextArea: UpdateTextArea
            },
            {
                where: {
                    Id: id
                }
            }
        )

        logger.info(`Successfully updated HeaderTopMaster with ID ${id}`)
        res.status(200).send({ message: 'Header updated successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Error updating Header Top Master ${error}`)
        res.status(500).send({ message: 'Server error' })
    }
})



/**
 * @swagger
 * /headertopmaster/delete:
 *   delete:
 *     summary: Delete multiple header entries
 *     description: Deletes multiple header entries identified by their IDs from the `HeaderTopMaster` table.
 *     tags:
 *       - Header Top Master
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
 *                 description: Array of unique identifiers for the header entries to delete.
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Successfully deleted the specified header entries
 *       404:
 *         description: ID should be an array format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "ID should be an array format"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server error"
 */


router.delete('/delete', authenticateJWT, async function (req, res) {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length == 0) {
        return res.status(404).send({ message: 'ID should be an array format' })
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
        const HeaderTopMaster = require('../models/HomePageContentMaster')(
            sequelizeInstance, DataTypes
        )

        await HeaderTopMaster.destroy({
            where: {
                Id: ids
            }
        })

        logger.info(`Successfully deleted HeaderTopMaster with IDs ${ids}`)
        return res.status(200).send({ message: 'Header top deleted successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Failed to delete ${error}`)
        res.status(500).send({ message: 'Server error' })
    }
})



module.exports = router