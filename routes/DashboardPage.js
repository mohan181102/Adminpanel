const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where } = require("sequelize");
const authenticateJWT = require("../utils/JWTauth");
const logger = require("../utils/logger");


/**
 * @swagger
 * /dashboardpage/create:
 *   post:
 *     summary: Create a new dashboard page
 *     description: This endpoint creates a new dashboard page entry with the provided details.
 *     tags:
 *       - DashboardPage
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Icon:
 *                 type: string
 *                 description: Icon for the dashboard page.
 *               PageName:
 *                 type: string
 *                 description: Name of the dashboard page.
 *               PageURL:
 *                 type: string
 *                 description: URL associated with the dashboard page.
 *               Status:
 *                 type: boolean
 *                 description: Status of the dashboard page (e.g., 'active', 'inactive').
 *             required:
 *               - Icon
 *               - PageName
 *               - PageURL
 *               - Status
 *     responses:
 *       200:
 *         description: Dashboard page successfully created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'DashboardPage Successfully Created!'
 *                 data:
 *                   type: object
 *                   properties:
 *                     Icon:
 *                       type: string
 *                     PageName:
 *                       type: string
 *                     PageURL:
 *                       type: string
 *                     Status:
 *                       type: string
 *       400:
 *         description: Bad request, typically due to missing or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Dashboard page creating failed'
 *       500:
 *         description: Server-side error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'server side error'
 *                 error:
 *                   type: string
 *                   example: 'Detailed server-side error message'
 */

// /dashboardpage
router.post('/create', async (req, res) => {
    const { Icon, PageName, PageURL, Status } = req.body
    try {
        const dashboardpage = await mdl.db.DashboardPage.create({
            Icon,
            PageName,
            PageURL,
            Status
        })

        if (!dashboardpage) return res.status(404).send({ message: 'Dashboard page creating failed' })

        res.status(200).json({ message: 'DashboardPage Succesfully Created!', data: dashboardpage });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: 'server side error', error: error });
    }
})



/**
 * @swagger
 * /dashboardpage/getAll:
 *   get:
 *     summary: Retrieve all dashboard pages
 *     description: Fetches all the dashboard pages from the database.
 *     tags:
 *       - DashboardPage
 *     responses:
 *       200:
 *         description: Successfully retrieved all dashboard pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'all datashboard pages found'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       Icon:
 *                         type: string
 *                         description: Icon for the dashboard page.
 *                       PageName:
 *                         type: string
 *                         description: Name of the dashboard page.
 *                       PageURL:
 *                         type: string
 *                         description: URL associated with the dashboard page.
 *                       Status:
 *                         type: string
 *                         description: Status of the dashboard page (e.g., 'active', 'inactive').
 *       404:
 *         description: No dashboard pages found or something went wrong
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Something went wrong'
 *       500:
 *         description: Server-side error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'server side error'
 *                 error:
 *                   type: string
 *                   example: 'Detailed server-side error message'
 */

router.get('/getAll', async (req, res) => {
    try {
        const alldatashboardpage = await mdl.db.DashboardPage.findAll()
        if (!alldatashboardpage) return res.status(404).send({ message: 'Something went wrong', data: [] });
        res.status(200).send({ message: 'all datashboard pages found', data: alldatashboardpage })
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: 'server side error', error: error });
    }
})



/**
 * @swagger
 * /dashboardpage/update/{id}:
 *   put:
 *     summary: Update a specific dashboard page
 *     description: Updates the details of a dashboard page specified by its ID.
 *     tags:
 *       - DashboardPage
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the dashboard page to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateIcon:
 *                 type: string
 *                 description: Updated icon for the dashboard page.
 *               UpdatePageName:
 *                 type: string
 *                 description: Updated name of the dashboard page.
 *               UpdatePageURL:
 *                 type: string
 *                 description: Updated URL associated with the dashboard page.
 *               UpdateStatus:
 *                 type: boolean
 *                 description: Updated status of the dashboard page (e.g., 'active', 'inactive').
 *             required:
 *               - UpdateIcon
 *               - UpdatePageName
 *               - UpdatePageURL
 *               - UpdateStatus
 *     responses:
 *       200:
 *         description: Successfully updated the dashboard page
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Updated Dashboard Success!'
 *       404:
 *         description: Dashboard page with the specified ID not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Id not found'
 *       500:
 *         description: Server-side error during the update operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error updating Dashboard'
 *                 error:
 *                   type: string
 *                   example: 'Detailed server-side error message'
 */

router.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { UpdateIcon, UpdatePageName, UpdatePageURL, UpdateStatus } = req.body

    try {
        if (!id) return res.status(404).send({ message: 'Id not found' });

        const [update] = await mdl.db.DashboardPage.update(
            {
                Icon: UpdateIcon,
                PageName: UpdatePageName,
                PageURL: UpdatePageURL,
                Status: UpdateStatus,
            },
            {
                where: {
                    Id: id
                }
            }
        )

        res.status(200).send({ message: 'Updated Dashboard Success!' })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Error updating Dashboard' })
    }
})



/**
 * @swagger
 * /dashboardpage/delete:
 *   delete:
 *     summary: Delete multiple dashboard pages
 *     description: Deletes dashboard pages based on an array of IDs provided in the request body.
 *     tags:
 *       - DashboardPage
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
 *                 description: An array of IDs representing the dashboard pages to be deleted.
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: Successfully deleted the dashboard pages
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Dashboard deleted successfully'
 *       404:
 *         description: ID should be in array format or no IDs provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'ID should be in array format'
 *       500:
 *         description: Server-side error during the delete operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Server error'
 *                 error:
 *                   type: string
 *                   example: 'Detailed server-side error message'
 */


router.delete('/delete', authenticateJWT, async (req, res) => {
    const { ids } = req.body

    if (!Array.isArray(ids)) {
        return res.status(404).send({ message: 'ID should be in array format' })
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
        const DashboardCard = require('../models/DashboardCard')(
            sequelizeInstance, DataTypes
        )

        await DashboardCard.destroy(
            {
                where: {
                    Id: ids
                }
            }
        )

        logger.info(`Dashboard deleted successfully!`)
        return res.status(200).send({ message: 'Dashboard deleted successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Error deleting dashboard: ${error}`)
        return res.status(500).send({ message: 'Server error' })
    }
})

module.exports = router