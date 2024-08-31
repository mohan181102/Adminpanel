const express = require("express");
const app = express()
const router = express.Router();
const mdl = require("../models");
const { where, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const authenticateJWT = require("../utils/JWTauth");
const getDbconnection = require("../DbConnection/CdConnection");


/**
 * @swagger
 * /frontendpage/create:
 *   post:
 *     summary: Create a new frontend page
 *     description: Creates a new frontend page entry in the database.
 *     tags:
 *       - Frontend Pages
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Font:
 *                 type: string
 *                 description: Icon for the frontend page.
 *               PageName:
 *                 type: string
 *                 description: Name of the frontend page.
 *               PageURL:
 *                 type: string
 *                 description: URL for the frontend page.
 *               NewTab:
 *                 type: boolean
 *                 description: Whether the page should open in a new tab.
 *               Priority:
 *                 type: integer
 *                 description: Priority level of the frontend page.
 *               Status:
 *                 type: string
 *                 description: Status of the frontend page (e.g., 'active', 'inactive').
 *             required:
 *               - Font
 *               - PageName
 *               - PageURL
 *               - NewTab
 *               - Priority
 *               - Status
 *     responses:
 *       200:
 *         description: Successfully created frontend page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully created frontend page
 *       404:
 *         description: Not created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Not created
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */

// /frontendpage
router.post('/create', authenticateJWT, async (req, res) => {
    const { Font, PageName, PageURL, NewTab, Priority, Status } = req.body
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
        const FrontEndPage = require('../models/FrontEndPages')(
            sequelizeInstance, DataTypes
        )

        const FrontEnd = await FrontEndPage.create({
            Icon: Font,
            PageName,
            PageURL,
            NewTab,
            Priority,
            Status,
        })

        if (!FrontEnd) return res.status(404).send({ message: 'Not created' })

        logger.info(`Successfully created ${FrontEnd}`)
        res.status(200).send({ message: 'Successfully created frontend page' })
    } catch (error) {
        console.log(error)
        logger.error(`Failed to create frontend ${error}`)
        res.status(500).json({ error: 'Server error' })
    }
})



/**
 * @swagger
 * /frontendpage/getAll:
 *   get:
 *     summary: Retrieve all frontend pages
 *     description: Fetches a list of all frontend pages from the database.
 *     tags:
 *       - Frontend Pages
 *     responses:
 *       200:
 *         description: Successfully retrieved all frontend pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All Frontend pages found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: Unique identifier for the frontend page
 *                       Icon:
 *                         type: string
 *                         description: Icon for the frontend page
 *                       PageName:
 *                         type: string
 *                         description: Name of the frontend page
 *                       PageURL:
 *                         type: string
 *                         description: URL for the frontend page
 *                       NewTab:
 *                         type: boolean
 *                         description: Whether the page should open in a new tab
 *                       Priority:
 *                         type: integer
 *                         description: Priority level of the frontend page
 *                       Status:
 *                         type: string
 *                         description: Status of the frontend page (e.g., 'active', 'inactive')
 *       404:
 *         description: No frontend pages found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error while fetching data
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Server error
 */

router.get('/getAll', authenticateJWT, async (req, res) => {
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
        const FrontEndPage = require('../models/FrontEndPages')(
            sequelizeInstance, DataTypes
        )

        const allfrontendpage = await FrontEndPage.findAll({
            order: [['Priority', 'ASC']]
        })

        if (!allfrontendpage) return res.status(404).json({ error: 'Error while fetching data' })

        logger.info(`All Frontend pages found`)
        res.status(200).send({ message: 'All Frontend pages found', data: allfrontendpage })
    } catch (error) {
        console.log(error)
        logger.error(`Failed to fetch all frontend pages ${error}`)
        res.status(500).json({ error: 'Server error' })
    }
})



/**
 * @swagger
 * /frontendpage/update/{id}:
 *   put:
 *     summary: Update a FrontEndPage
 *     description: Updates the details of a FrontEndPage by ID.
 *     tags:
 *       - Frontend Pages
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the FrontEndPage to update
 *       - in: body
 *         name: body
 *         required: true
 *         description: Details to update for the FrontEndPage
 *         schema:
 *           type: object
 *           properties:
 *             UpdateFont:
 *               type: string
 *               example: 'fa-solid fa-home'
 *             UpdatePageName:
 *               type: string
 *               example: 'Home Page'
 *             UpdatePageURL:
 *               type: string
 *               example: '/home'
 *             UpdateNewTab:
 *               type: boolean
 *               example: true
 *             UpdatePriority:
 *               type: integer
 *               example: 1
 *             UpdateStatus:
 *               type: string
 *               example: 'active'
 *     responses:
 *       200:
 *         description: FrontEndPage successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'FrontEndPage successfully updated!'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server error'
 */

router.put('/update/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params
    const { UpdateFont, UpdatePageName, UpdatePageURL, UpdateNewTab, UpdatePriority, UpdateStatus } = req.body

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
        const FrontEndPage = require('../models/FrontEndPages')(
            sequelizeInstance, DataTypes
        )

        const [udpate] = await FrontEndPage.update(
            {
                Icon: UpdateFont,
                PageName: UpdatePageName,
                PageURL: UpdatePageURL,
                NewTab: UpdateNewTab,
                Priority: UpdatePriority,
                Status: UpdateStatus,
            },
            {
                where: {
                    Id: id
                }
            }
        )

        if (udpate == 0) return response.status(404).send({ message: "Update failed" })

        logger.info(`FrontEndPage Successfully updated`)
        return res.status(200).send({ message: 'FrontEndPage successfully updated!' })
    } catch (error) {
        console.log(error)
        logger.error(`Failed to update frontend page ${error}`)
        return res.status(500).json({ error: 'Server error' })
    }
})



/**
 * @swagger
 * /frontendpage/delete:
 *   delete:
 *     summary: Delete FrontEndPages
 *     description: Deletes multiple FrontEndPages based on the provided array of IDs.
 *     tags:
 *       - Frontend Pages
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
 *         description: FrontEndPage(s) successfully deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'FrontEndPage(s) successfully deleted!'
 *       401:
 *         description: Invalid or missing ID array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Please provide id in array format'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Server error'
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(401).send({ message: 'Please provide id in array format' })
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
        const FrontEndPage = require('../models/FrontEndPages')(
            sequelizeInstance, DataTypes
        )

        await FrontEndPage.destroy(
            {
                where: {
                    Id: ids
                }
            }
        )

        logger.info(`FrontEndPage(s) successfully deleted`)
        return res.status(200).send({ message: 'FrontEndPage(s) successfully deleted!' })
    } catch (error) {
        console.log(error)
        logger.error(`Failed to delete frontend page(s) ${error}`)
        return res.status(500).send({ message: 'Server error: ' })
    }
})

module.exports = router