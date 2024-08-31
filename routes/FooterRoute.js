const express = require("express");
const app = express()
const router = express.Router();
const mdl = require("../models");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");
const authenticateJWT = require("../utils/JWTauth");


/**
 * @swagger
 * /Footer/create:
 *   post:
 *     summary: Create a new course master
 *     description: Creates a new course master entry with the provided details.
 *     tags:
 *       - Footer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 example: 'Introduction to Programming'
 *               Priority:
 *                 type: integer
 *                 example: 1
 *               Bgcolor:
 *                 type: string
 *                 example: '#FFFFFF'
 *               Status:
 *                 type: string
 *                 example: 'Active'
 *               TextContent:
 *                 type: string
 *                 example: 'This is an introductory course on programming.'
 *             required:
 *               - Title
 *               - Priority
 *               - Bgcolor
 *               - Status
 *               - TextContent
 *     responses:
 *       '200':
 *         description: Successfully created course master
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Successfully created course master'
 *       '404':
 *         description: Error creating course master
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error creating course master'
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Error creating Course'
 */


router.post('/create', authenticateJWT, async (req, res) => {
    const { Title, Priority, Bgcolor, Status, TextContent } = req.body

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
        const Footer = require('../models/Footer.model')(
            sequelizeInstance, DataTypes
        )

        const newFooter = await Footer.create(
            {
                Title: Title,
                Priority: Priority,
                Bgcolor: Bgcolor,
                Status: Status,
                TextContent: TextContent
            }
        )

        if (!Footer) {
            return res.status(404).send({ message: 'Error creating course master' })
        }

        logger.info(`Successfully created course master`)
        res.status(200).send({ message: 'Successfully created course master', data: newFooter })
    } catch (error) {
        console.log(error)
        logger.error(`Error creating course master: ${error.message}`)
        res.status(500).json({ error: 'Error creating Course' })
    }
})




/**
 * @swagger
 * /Footer/getAll:
 *   get:
 *     summary: Retrieve all course master entries
 *     description: Fetches all the course master entries from the database.
 *     tags:
 *       - Footer
 *     responses:
 *       '200':
 *         description: Successfully fetched data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Successfully fetching data'
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       Title:
 *                         type: string
 *                         example: 'Introduction to Programming'
 *                       Priority:
 *                         type: integer
 *                         example: 1
 *                       Bgcolor:
 *                         type: string
 *                         example: '#FFFFFF'
 *                       Status:
 *                         type: string
 *                         example: 'Active'
 *                       TextContent:
 *                         type: string
 *                         example: 'This is an introductory course on programming.'
 *       '404':
 *         description: No data found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No data found'
 *       '500':
 *         description: Server side error while fetching data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server side error while fetching data'
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
        const Footer = require('../models/Footer.model')(
            sequelizeInstance, DataTypes
        )

        const alldata = await Footer.findAll()

        if (!alldata) {
            return res.status(404).json({ message: 'No data found' })
        }

        logger.info(`Successfully fetched data`)
        res.status(200).json({ message: 'Successfully fetching data', data: alldata })
    } catch (error) {
        console.log(error)
        logger.error(`Error fetching data: ${error.message}`)
        return res.status(500).json({ error: 'Server side error while fetching data' })
    }
})




/**
 * @swagger
 * /Footer/update/{id}:
 *   put:
 *     summary: Update a course master entry
 *     description: Updates the details of a specific course master entry identified by the provided ID.
 *     tags:
 *       - Footer
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: ID of the course master entry to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateTitle:
 *                 type: string
 *                 example: 'Updated Programming Course'
 *               UpdatePriority:
 *                 type: integer
 *                 example: 2
 *               UpdateBgcolor:
 *                 type: string
 *                 example: '#000000'
 *               UpdateStatus:
 *                 type: string
 *                 example: 'Inactive'
 *               UpdateTextContent:
 *                 type: string
 *                 example: 'This course has been updated with new content.'
 *             required:
 *               - UpdateTitle
 *               - UpdatePriority
 *               - UpdateBgcolor
 *               - UpdateStatus
 *               - UpdateTextContent
 *     responses:
 *       '200':
 *         description: Course master entry updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Course master update successfully'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     Title:
 *                       type: string
 *                       example: 'Updated Programming Course'
 *                     Priority:
 *                       type: integer
 *                       example: 2
 *                     Bgcolor:
 *                       type: string
 *                       example: '#000000'
 *                     Status:
 *                       type: string
 *                       example: 'Inactive'
 *                     TextContent:
 *                       type: string
 *                       example: 'This course has been updated with new content.'
 *       '404':
 *         description: Course master entry not found or update failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Course master update failed'
 *       '500':
 *         description: Server side error while updating data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server side error while updating data'
 */


router.put('/update/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params
    const { UpdateTitle, UpdatePriority, UpdateBgcolor, UpdateStatus, UpdateTextContent } = req.body

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
        const Footer = require('../models/Footer.model')(
            sequelizeInstance, DataTypes
        )

        const [update] = await Footer.update({
            Title: UpdateTitle,
            Priority: UpdatePriority,
            Bgcolor: UpdateBgcolor,
            Status: UpdateStatus,
            TextContent: UpdateTextContent
        }, {
            where: {
                Id: id
            }
        })

        if (!update) {
            return res.status(404).json({ message: 'Course master update failed' })
        }

        logger.info(`Course master entry with ID: ${id} updated successfully`)
        return res.status(200).send({ messsage: 'Course master update successfully', data: update })
    } catch (error) {
        console.log(error)
        logger.error(`Course master entry with ID: ERROR${error}`)
        return res.status(500).json({ error: 'Server side error while updating data' })
    }
})




/**
 * @swagger
 * /Footer/delete:
 *   delete:
 *     summary: Delete multiple course master entries
 *     description: Deletes multiple course master entries identified by their IDs provided in the request body.
 *     tags:
 *       - Footer
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
 *       '200':
 *         description: Successfully deleted course master entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Course master deleted successfully'
 *       '404':
 *         description: Invalid request or no IDs provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Invalid request, id must be array'
 *       '500':
 *         description: Server side error while deleting data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Server side error while deleting data'
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    const { ids } = req.body

    if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(404).json({ message: 'Invalid request, id must be array' })
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
        const Footer = require('../models/Footer.model')(
            sequelizeInstance, DataTypes
        )

        await Footer.destroy({ where: { Id: ids } })

        logger.info(`Course master entries with IDs: ${ids} deleted successfully`)
        return res.status(200).json({ message: 'Course master deleted successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Course master entries with IDs: ERROR:${error}`)
        return res.status(500).json({ error: 'Server side error while deleting data' })
    }
})



module.exports = router