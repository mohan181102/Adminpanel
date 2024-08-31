const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const authenticateJWT = require("../utils/JWTauth");
const getDbconnection = require("../DbConnection/CdConnection");


/**
 * @swagger
 * /dashboardcard/create:
 *   post:
 *     summary: Create a new dashboard card
 *     description: Adds a new card to the dashboard with the specified properties.
 *     tags:
 *       - Dashboard Card
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Icon:
 *                 type: string
 *                 description: The icon to be used for the card.
 *               CardName:
 *                 type: string
 *                 description: The name of the card.
 *               Pageurl:
 *                 type: string
 *                 description: The URL of the page that the card links to.
 *               CardColor:
 *                 type: string
 *                 description: The color of the card.
 *               TableName:
 *                 type: string
 *                 description: The name of the table related to the card.
 *               TableCondition:
 *                 type: string
 *                 description: The condition for filtering the table data.
 *               NewTab:
 *                 type: boolean
 *                 description: Whether the link should open in a new tab.
 *               Priority:
 *                 type: integer
 *                 description: The priority level of the card.
 *               Status:
 *                 type: boolean
 *                 description: The status of the card (e.g., active, inactive).
 *     responses:
 *       200:
 *         description: Dashboard card created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard card created successfully
 *       500:
 *         description: Error creating card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating card
 *                 error:
 *                   type: string
 *                   example: Error details (e.g., database error)
 */

router.post('/create', authenticateJWT, async (req, res) => {
    try {
        const { Icon, CardName, Pageurl, CardColor, TableName, TableCondition, NewTab, Priority, Status } = req.body
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

        const data = await DashboardCard.create({
            Icon,
            CardName,
            Pageurl,
            CardColor,
            TableName,
            TableCondition,
            NewTab,
            Priority,
            Status
        })

        logger.info(`Dashboard card created successfully ${data}`)
        return res.status(200).send({ message: 'Dashboard card created successfully', data: data })
    } catch (error) {
        console.log(error)
        logger.error(`Dashboard card failed to create ERROR: ${error}`)
        return res.status(500).send({ message: 'Error creating card', error: error })
    }
})


/**
 * @swagger
 * /dashboardcard/getAll:
 *   get:
 *     summary: Retrieve all dashboard cards
 *     description: Fetches a list of all dashboard cards from the database.
 *     tags:
 *       - Dashboard Card
 *     responses:
 *       200:
 *         description: Successfully retrieved all cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All cards found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique identifier for the card.
 *                       Icon:
 *                         type: string
 *                         description: The icon associated with the card.
 *                       CardName:
 *                         type: string
 *                         description: The name of the card.
 *                       Pageurl:
 *                         type: string
 *                         description: The URL the card links to.
 *                       CardColor:
 *                         type: string
 *                         description: The color of the card.
 *                       TableName:
 *                         type: string
 *                         description: The name of the table related to the card.
 *                       TableCondition:
 *                         type: string
 *                         description: The condition for filtering the table data.
 *                       NewTab:
 *                         type: boolean
 *                         description: Indicates if the link should open in a new tab.
 *                       Priority:
 *                         type: integer
 *                         description: The priority level of the card.
 *                       Status:
 *                         type: string
 *                         description: The status of the card (e.g., active, inactive).
 *       404:
 *         description: No cards found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No cards found
 *       500:
 *         description: Error fetching cards
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching all cards
 *                 error:
 *                   type: string
 *                   example: Error details (e.g., database error)
 */

router.get('/getAll', authenticateJWT, async (req, res) => {
    try {

        if (!allcards) return res.status(404).send({ message: 'No cards found' })
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
        const allcards = await DashboardCard.findAll()

        logger.info(`All cards found successfully`)
        return res.status(200).send({ message: 'All cards found', data: allcards })
    } catch (error) {
        console.log(error)
        logger.error(`All cards failed to fetch ERROR: ${error}`)
        return res.status(500).send({ message: 'Error fetching all cards', error: error })
    }
})



/**
 * @swagger
 * /dashboardcard/update/{id}:
 *   put:
 *     summary: Update an existing dashboard card
 *     description: Updates the details of a specific dashboard card identified by its ID.
 *     tags:
 *       - Dashboard Card
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The unique identifier of the dashboard card to update.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateIcon:
 *                 type: string
 *                 description: The updated icon for the card.
 *               UpdateCardName:
 *                 type: string
 *                 description: The updated name of the card.
 *               UpdatePageurl:
 *                 type: string
 *                 description: The updated URL the card links to.
 *               UpdateCardColor:
 *                 type: string
 *                 description: The updated color of the card.
 *               UpdateTableName:
 *                 type: string
 *                 description: The updated name of the table related to the card.
 *               UpdateTableCondition:
 *                 type: string
 *                 description: The updated condition for filtering the table data.
 *               UpdateNewTab:
 *                 type: boolean
 *                 description: Whether the link should open in a new tab.
 *               UpdatePriority:
 *                 type: integer
 *                 description: The updated priority level of the card.
 *               UpdateStatus:
 *                 type: boolean
 *                 description: The updated status of the card (e.g., active, inactive).
 *     responses:
 *       200:
 *         description: Dashboard card updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard card updated successfully
 *       400:
 *         description: Invalid input provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid input
 *       404:
 *         description: Dashboard card not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dashboard card not found
 *       500:
 *         description: Error updating card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error
 *                 error:
 *                   type: string
 *                   example: Error details (e.g., database error)
 */

router.put('/update/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params
    const { UpdateIcon, UpdateCardName, UpdatePageurl, UpdateCardColor, UpdateTableName, UpdateTableCondition, UpdateNewTab, UpdatePriority, UpdateStatus } = req.body

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

        await DashboardCard.update(
            {
                Icon: UpdateIcon,
                CardName: UpdateCardName,
                Pageurl: UpdatePageurl,
                CardColor: UpdateCardColor,
                TableName: UpdateTableName,
                TableCondition: UpdateTableCondition,
                NewTab: UpdateNewTab,
                Priority: UpdatePriority,
                Status: UpdateStatus
            }, {
            where: {
                Id: id
            }
        }
        )

        logger.info(`Dashboard card with ID ${id} updated successfully`)
        return res.status(200).send({ message: 'Dashboard card updated successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Dashboard card update failed with ID ${id} ERROR: ${error}`)
        res.status(500).send({ message: 'Server error', error: error })
    }

})


// DELETE

/**
 * @swagger
 * /dashboardcard/delete:
 *   delete:
 *     summary: Delete multiple dashboard cards
 *     description: Deletes multiple dashboard cards based on the provided IDs.
 *     tags:
 *       - Dashboard Card
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
 *                 description: An array of IDs of the dashboard cards to delete.
 *                 example: [1, 2, 3]
 *     responses:
 *       '200':
 *         description: Cards deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Cards deleted successfully
 *       '400':
 *         description: Bad request if `ids` is not an array or is empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request format
 *       '500':
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

router.delete('/delete',authenticateJWT, async function (req, res) {
    try {
        const { ids } = req.body

        if (!Array.isArray(ids) || ids.length == 0) return

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

        await DashboardCard.destroy({ where: { Id: ids } })

        logger.info(`Dashboard cards with IDs ${ids} deleted successfully`)
        return res.status(200).send({ message: 'Cards deleted successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Dashboard cards delete failed with IDs ${ids} ERROR: ${error}`)
        return res.status(500).send({ message: 'Server error' })
    }
})

module.exports = router