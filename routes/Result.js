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
 * /Result/create:
 *   post:
 *     summary: Create a new result
 *     description: Uploads a file and creates a new result with the given details.
 *     tags:
 *       - Results
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               EventTitle:
 *                 type: string
 *                 description: Title of the event
 *                 example: "Sample Event"
 *               URL:
 *                 type: string
 *                 description: URL related to the event
 *                 example: "http://example.com"
 *               Status:
 *                 type: string
 *                 description: Status of the event
 *                 example: "Active"
 *               File:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: Result created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Result created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     EventTitle:
 *                       type: string
 *                       example: Sample Event
 *                     URL:
 *                       type: string
 *                       example: http://example.com
 *                     Status:
 *                       type: string
 *                       example: Active
 *                     File:
 *                       type: string
 *                       example: http://localhost:3000/uploads/samplefile.jpg
 *       500:
 *         description: Error creating
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating
 */


router.post('/create', authenticateJWT, upload.single("File"), async (req, res) => {
    const { EventTitle, URL, Status } = req.body;
    const file = req.file
    let imagepath = null;
    if (file) {
        imagepath = `http://localhost:3000/uploads/${file.filename}`;
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
        const Result = require('../models/Result')(
            sequelizeInstance, DataTypes
        )
        const result = await Result.create({
            EventTitle,
            URL,
            Status,
            File: imagepath
        })

        logger.info(`Result created successfully: ${result}`)
        res.status(200).send({ message: 'Result created successfully', data: result });
    } catch (error) {
        logger.error(`Error creating Result: ${error}`)
        res.status(500).send({ message: 'Error creating' })
    }
})




/**
 * @swagger
 * /Result/getall:
 *   get:
 *     summary: Retrieve all results
 *     description: Fetches all results from the database.
 *     tags:
 *       - Results
 *     responses:
 *       200:
 *         description: A list of results.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "Result name"
 *                       value:
 *                         type: number
 *                         example: 42.0
 *       404:
 *         description: No results found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No results found
 *       500:
 *         description: Error fetching results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error fetching results
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */



router.get('/getall', authenticateJWT, async function (req, res) {
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
        const Result = require('../models/Result')(
            sequelizeInstance, DataTypes
        )
        const results = await Result.findAll();

        if (!results) {
            res.status(404).send({ message: 'No results found' })
            return;
        }

        logger.info(`Result Get Successfully`)
        res.status(200).send({ results });
    } catch (error) {
        logger.error(`Error fetching Result: ${error}`)
        res.status(500).send({ message: 'Error fetching results', error: error })
    }
})



/**
 * @swagger
 * /Result/delete:
 *   delete:
 *     summary: Delete results
 *     description: Deletes results from the database based on the provided array of IDs.
 *     tags:
 *       - Results
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
 *     responses:
 *       200:
 *         description: Result Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Result Deleted successfully
 *       404:
 *         description: Ids should be in form of array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Ids should be in form of array
 *       500:
 *         description: Error while deleting
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while deleting
 */


router.delete('/delete', authenticateJWT, async function (req, res) {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length == 0) {
        return res.status(404).send({ message: 'Ids should be in form of array' })
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
        const Result = require('../models/Result')(
            sequelizeInstance, DataTypes
        )
        await Result.destroy({
            where: {
                Id: ids
            }
        })

        logger.info(`Result Deleted Successfully`)
        res.status(200).send({ message: 'Result Deleted successfully' })
    } catch (error) {
        logger.error(`Result Deleted Error: ${error}`)
        res.status(500).send({ message: "Error while deleting" })
    }
})




/**
 * @swagger
 * /Result/update/{id}:
 *   put:
 *     summary: Update a result by ID
 *     tags: 
 *       - Results
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the result to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateEventTitle:
 *                 type: string
 *                 description: The new title of the event
 *               UpdateStatus:
 *                 type: string
 *                 description: The new status of the event
 *               UpdateURL:
 *                 type: string
 *                 description: The new URL associated with the event
 *               FileData:
 *                 type: string
 *                 format: binary
 *                 description: The new file to upload
 *     responses:
 *       200:
 *         description: Successfully updated the result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully updated the result
 *       500:
 *         description: Error updating the result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating the result
 */


router.put('/update/:id', authenticateJWT, upload.single("FileData"), async (req, res) => {
    const { id } = req.params
    const { UpdateEventTitle, UpdateStatus, UpdateURL, FileData } = req.body
    const file = req.file
    let imagepath = null

    if (file) {
        imagepath = `http://localhost:3000/uploads/${file.originalname}`
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
        const Result = require('../models/Result')(
            sequelizeInstance, DataTypes
        )

        const UpdateResult = await Result.update(
            {
                EventTitle: UpdateEventTitle,
                Status: UpdateStatus,
                URL: UpdateURL,
                File: imagepath != null ? imagepath : FileData
            },
            {
                where: {
                    Id: id
                }
            }
        )

        logger.info(`Result Updated Successfully`)
        res.status(200).send({ message: 'Successfully updated the result' })

    } catch (error) {
        logger.error(`Error updating Result: ${error}`)
        res.status(500).send({ message: "Error updating the result" })
    }
})

module.exports = router