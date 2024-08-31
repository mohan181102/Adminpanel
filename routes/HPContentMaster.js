const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const authenticateJWT = require("../utils/JWTauth");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");
const { error } = require("console");


/**
 * @swagger
 * /HPContentMaster/create:
 *   post:
 *     summary: Create new content
 *     description: Creates a new content entry in the HPContentMaster.
 *     tags:
 *       - HPContentMaster
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: The title of the content
 *                 example: "New Content Title"
 *               Color:
 *                 type: string
 *                 description: The color associated with the content
 *                 example: "#FFFFFF"
 *               Status:
 *                 type: string
 *                 description: The status of the content
 *                 example: "active"
 *               Priority:
 *                 type: number
 *                 description: The priority of the content
 *                 example: 1
 *               Content:
 *                 type: string
 *                 description: The main content body
 *                 example: "This is the main content."
 *     responses:
 *       200:
 *         description: Content created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Title:
 *                   type: string
 *                 Color:
 *                   type: string
 *                 Status:
 *                   type: string
 *                 Priority:
 *                   type: number
 *                 Content:
 *                   type: string
 *       500:
 *         description: Error creating Content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error creating Content"
 */

router.post('/create', authenticateJWT, async function (req, res) {
    const { Title, Color, Status, Priority, Content } = req.body;

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
        const HPContentMaster = require('../models/HPContentMaster')(
            sequelizeInstance, DataTypes
        )

        const ContenMaster = await HPContentMaster.create({ Title, BgColor: Color, Status, Priority, Content });
        logger.info(`Content Master Create Successfully!`)
        res.status(200).json(ContenMaster);
    } catch (error) {
        console.error(error);
        logger.error(`Content Master Creation failed ${error}`)
        res.status(500).json({ error: 'Error creating Content' });
    }
})



/**
 * @swagger
 * /HPContentMaster/update/{id}:
 *   put:
 *     summary: Update content by ID
 *     description: Updates an existing content entry in the HPContentMaster by its ID.
 *     tags:
 *       - HPContentMaster
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the content to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateTitle:
 *                 type: string
 *                 description: The updated title of the content
 *                 example: "Updated Content Title"
 *               UpdateColor:
 *                 type: string
 *                 description: The updated color associated with the content
 *                 example: "#000000"
 *               UpdateStatus:
 *                 type: boolean
 *                 description: The updated status of the content
 *                 example: "inactive"
 *               UpdatePriority:
 *                 type: number
 *                 description: The updated priority of the content
 *                 example: 2
 *               UpdateContent:
 *                 type: string
 *                 description: The updated main content body
 *                 example: "This is the updated main content."
 *     responses:
 *       200:
 *         description: Content updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Title:
 *                   type: string
 *                 Priority:
 *                   type: number
 *                 BgColor:
 *                   type: string
 *                 Status:
 *                   type: string
 *                 Content:
 *                   type: string
 *       404:
 *         description: Content not found or error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Content not found"
 */

router.put('/update/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;
    const { UpdateTitle, UpdateColor, UpdateStatus, UpdatePriority, UpdateContent } = req.body;
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
        const HPContentMaster = require('../models/HPContentMaster')(
            sequelizeInstance, DataTypes
        )


        if (id) {
            const OldContent = await HPContentMaster.findByPk(id)
            const newContent = await HPContentMaster.update(
                {
                    Title: UpdateTitle != null ? UpdateTitle : OldContent.Title,
                    Priority: UpdatePriority != null ? UpdatePriority : OldContent.Priority,
                    BgColor: UpdateColor != null ? UpdateColor : OldContent.BgColor,
                    Status: UpdateStatus != null ? UpdateStatus : OldContent.Status,
                    Content: UpdateContent != null ? UpdateContent : OldContent.Content
                }, {
                where: {
                    Id: id
                }
            })

            if (newContent) {
                const Updated = await HPContentMaster.findByPk(newContent[0])
                logger.info(`Update HPContentMaster Successfully`)
                res.status(200).json(Updated);
            } else {
                logger.error(`Update HPContentMaster Failed`)
                res.status(404).json({ error: 'Content not found' });
            }
        }
    } catch (error) {
        logger.error(`Update HPContentMaster Failed ERROR:${error}`)
        res.status(404).json({ error: error.message });
    }
})


/**
 * @swagger
 * /HPContentMaster/getall:
 *   get:
 *     summary: Retrieve all content
 *     description: Retrieves all content entries from the HPContentMaster.
 *     tags:
 *       - HPContentMaster
 *     responses:
 *       200:
 *         description: A list of all content entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   Title:
 *                     type: string
 *                   Priority:
 *                     type: number
 *                   BgColor:
 *                     type: string
 *                   Status:
 *                     type: string
 *                   Content:
 *                     type: string
 *       500:
 *         description: Error retrieving contents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Error retrieving contents"
 */

router.get('/getall', authenticateJWT, async (req, res) => {
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
        const HPContentMaster = require('../models/HPContentMaster')(
            sequelizeInstance, DataTypes
        )

        const Contents = await HPContentMaster.findAll();
        logger.info(`Get All HPContentMaster Successfully`)
        res.status(200).json(Contents);
    } catch (error) {
        logger.info(`get all HPContentMaster failed ERROR:${error}`)
        console.error(error);
        res.status(500).json({ error: 'Error retrieving Contents' });
    }
})



/**
 * @swagger
 * /HPContentMaster/delete:
 *   delete:
 *     summary: Delete content by IDs
 *     description: Deletes multiple content entries from the HPContentMaster by their IDs.
 *     tags:
 *       - HPContentMaster
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of IDs of the content entries to delete
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Content deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Card deleted successfully"
 *       400:
 *         description: Invalid request format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Deleted should be an array"
 *       500:
 *         description: Error deleting content
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting card"
 */


router.delete('/delete', authenticateJWT, async (req, res) => {
    const { id } = req.body

    if (!id || !Array.isArray(id) || id.length === 0) {
        res.status(200).send({ message: "Deleted should be an array" })
        return
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
        const HPContentMaster = require('../models/HPContentMaster')(
            sequelizeInstance, DataTypes
        )

        await HPContentMaster.destroy({
            where: {
                Id: id
            }
        })

        logger.info(`Delete HPContentMaster Successfully`)
        res.status(200).send({ message: "Card deleted successfully" })

    } catch {
        logger.error(`Error deleting HPContentMaster ${error}`)
        res.send({ message: "Error deleting card" })
    }
})

module.exports = router