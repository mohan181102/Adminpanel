const express = require('express');
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");

const upload = require("../utils/upload");
const { where, DataTypes } = require('sequelize');
const authenticateJWT = require('../utils/JWTauth');
const getDbconnection = require('../DbConnection/CdConnection');
const logger = require('../utils/logger');



/**
 * @swagger
 * /pageview/create:
 *   post:
 *     summary: Create a new page
 *     description: Creates a new page with the given title, page name, priority, and status.
 *     tags:
 *       - PageViewMaster
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: The title of the page.
 *                 example: "Homepage"
 *               PageName:
 *                 type: string
 *                 description: The name of the page.
 *                 example: "home"
 *               Priority:
 *                 type: integer
 *                 description: The priority level of the page.
 *                 example: 1
 *               Status:
 *                 type: boolean
 *                 description: The status of the page.
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Page created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Page created successfully"
 *       404:
 *         description: Error creating page.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating page"
 */

router.post('/create', authenticateJWT, async function (req, res) {
    try {
        const { Title, PageName, Priority, Status } = req.body
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
        const PageViewMaster = require('../models/PageViewMaster.model')(
            sequelizeInstance, DataTypes
        )

        const page = await PageViewMaster.create(
            {
                Title,
                PageName,
                Priority,
                Status
            }
        )

        if (!page) {
            return res.status(404).send({ message: 'Error creating page' })
        }

        logger.info(`Successfully created page view master`)
        return res.status(200).send({ message: 'Page created successfully' })
    } catch (error) {
        console.log(error);
        logger.error(`Error while creating page view master: ${error}`)
        return res.status(404).send({ message: 'Error creating page' })
    }
})



/**
 * @swagger
 * /pageview/getAll:
 *   get:
 *     summary: Retrieve all pages
 *     tags:
 *       - PageViewMaster
 *     description: Fetches a list of all pages from the PageViewMaster table.
 *     responses:
 *       200:
 *         description: Successfully retrieved all pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All pages found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: Sample Page
 *                       content:
 *                         type: string
 *                         example: This is a sample page content.
 *       404:
 *         description: Error fetching all pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching all pages
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
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
        const PageViewMaster = require('../models/PageViewMaster.model')(
            sequelizeInstance, DataTypes
        )

        const allPages = await PageViewMaster.findAll()

        if (!allPages) return res.status(404).send({ message: 'Error fetching all pages' })

        logger.info(`Successfully get all pages`)
        res.status(200).send({ message: 'All pages found', data: allPages })
    } catch (error) {
        console.log(error);
        logger.error(`Error while fetching all pages: ${error}`)
        return res.status(500).send({ message: 'Server error' });
    }
})



/**
 * @swagger
 * /pageview/update/{id}:
 *   put:
 *     summary: Update a PriceMaster record
 *     tags:
 *       - PageViewMaster
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
 *               UpdateTitle:
 *                 type: string
 *                 description: Title of the Pageview record.
 *               UpdatePageName:
 *                 type: string
 *                 description: Plan name of the PriceMaster record.
 *               UpdatePriority:
 *                 type: integer
 *                 description: Priority of the PriceMaster record.
 *               UpdateStatus:
 *                 type: string
 *                 description: Status of the PriceMaster record.
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

router.put('/update/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params
    const { UpdateTitle, UpdatePageName, UpdatePriority, UpdateStatus } = req.body

    // Title, PageName, Priority, Status
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
        const PageViewMaster = require('../models/PageViewMaster.model')(
            sequelizeInstance, DataTypes
        )

        await PageViewMaster.update(
            {
                Title: UpdateTitle,
                PageName: UpdatePageName,
                Priority: UpdatePriority,
                Status: UpdateStatus
            },
            {
                where: {
                    Id: id
                }
            }
        )

        logger.info(`Successfully updated page view master with id: ${id}`)
        res.status(200).send({ message: 'Page updated successfully' })
    } catch (error) {
        console.log(error);
        logger.error(`Error while updating page view master with id: ${id}: ${error}`)
        return res.status(500).send({ message: 'Server error' });
    }

})



/**
 * @swagger
 * /pageview/delete:
 *   delete:
 *     summary: Delete multiple PageViewMaster records
 *     tags:
 *       - PageViewMaster
 *     description: Deletes multiple PageViewMaster records based on provided IDs.
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
 *                 description: Array of IDs to delete
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: Successfully destroyed records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully destroyed
 *       400:
 *         description: Bad request due to invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please send at least one id!
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: server side error
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    const { ids } = req.body
    if (!Array.isArray(ids) || ids.length == 0) {
        return res.status(404).send({ message: 'Please send at least one id!' })
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
        const PageViewMaster = require('../models/PageViewMaster.model')(
            sequelizeInstance, DataTypes
        )

        await PageViewMaster.destroy({ where: { id: ids } })

        logger.info(`Successfully destroyed page view masters with ids: ${ids}`)
        return res.status(200).send({ message: 'Successfully destroyed' })
    } catch (error) {
        console.log(error)
        logger.error(`Error while destroying page view masters with ids: ${ids}: ${error}`)
        return res.status(500).send({ message: 'server side error' });
    }
})


module.exports = router