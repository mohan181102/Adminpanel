const express = require('express')
const router = express.Router()
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const authenticateJWT = require('../utils/JWTauth');
const getDbconnection = require('../DbConnection/CdConnection');
const logger = require('../utils/logger')



/**
 * @swagger
 * /academicmaster/create:
 *   post:
 *     summary: Create a new event
 *     description: This endpoint allows you to create a new event with an optional file upload.
 *     tags:
 *       - AcademicMaster
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               EventTitle:
 *                 type: string
 *                 description: The title of the event.
 *                 example: "Annual Science Fair"
 *               EventVideoURL:
 *                 type: string
 *                 description: The URL of the event video.
 *                 example: "https://example.com/video"
 *               Status:
 *                 type: string
 *                 description: The status of the event (e.g., active, inactive).
 *                 example: "active"
 *               File:
 *                 type: string
 *                 format: binary
 *                 description: The file associated with the event (optional).
 *     responses:
 *       200:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event created successfully"
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "server error"
 */

router.post('/create', authenticateJWT, upload.single('File'), async (req, res) => {
    const { EventTitle, EventVideoURL, Status } = req.body;
    const companyCode = req.companyCode;
    let File = null;
    if (req.file) {
        File = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    try {

        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }
        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        const AcademicMaster = require('../models/AcademicMaster')(
            sequelizeInstance, DataTypes
        )

        await AcademicMaster.create(
            {
                EventTitle,
                EventVideoTitle: EventVideoURL,
                Status,
                File
            }
        )

        logger.info(`New Academic Master Created Successfully! `)
        res.status(200).send({ message: 'Academic master created successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Error While Creating Academic Master ERROR:${error}`)
        return res.status(500).send({ message: 'server error' })
    }
})

// TOKEN
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVbmFtZSI6ImFkbWluIiwiVXBhc3N3b3JkIjoiJDJiJDEwJEFOVDBFUG1JTWlMbVZUYmNXZDBYSk92bnk4U0tHWTFPMmhWVGoyQi9YODZ1Mllybks2R3RpIiwiY29tcENvZGUiOiIweDAwN0MyMkE2IiwiaWF0IjoxNzI0MzAwNjEyfQ.cKfxQRTXE1VQa64Sx-6A3Ji5iDuBer0KeLgfb1EaQ_0


/**
 * @swagger
 * /academicmaster/getAll:
 *   get:
 *     summary: Retrieve all academic masters
 *     description: Fetches a list of all academic master records from the database.
 *     tags:
 *       - AcademicMaster
 *     responses:
 *       200:
 *         description: Successfully retrieved academic masters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Academic master fetched successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       EventTitle:
 *                         type: string
 *                         example: "Annual Science Fair"
 *                       EventVideoTitle:
 *                         type: string
 *                         example: "https://example.com/video"
 *                       Status:
 *                         type: string
 *                         example: "active"
 *                       File:
 *                         type: string
 *                         example: "http://localhost:3000/uploads/sample-file.jpg"
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
        const companyCode = req.companyCode;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }
        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        const AcademicMaster = require('../models/AcademicMaster')(
            sequelizeInstance, DataTypes
        )
        const academicMasters = await AcademicMaster.findAll();
        logger.info(`Academic Master Get Successfully!`)
        res.status(200).send({ message: 'Academic master fetched successfully', data: academicMasters });
    } catch (error) {
        console.log(error)
        logger.error(`Error getting Academic Master ${error}`)
        res.status(500).send({ message: 'Server error' })
    }
})



/**
 * @swagger
 * /academicmaster/update/{id}:
 *   put:
 *     summary: Update Client object
 *     description: Updates the name of a gallery and optionally uploads a new image associated with the new gallery name.
 *     tags:
 *       - AcademicMaster
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the client to update
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateEventTitle:  
 *                 type: string
 *                 description:  update title name of academic master
 *               UpdateEventVideoURL:
 *                 type: string
 *                 description: The new name of the gallery
 *               UpdateFile:
 *                 type: string
 *                 description: Details associated with the new gallery name
 *               UpdateStatus:
 *                 type: boolean
 *                 description: Status of the gallery
 *     responses:
 *       200:
 *         description: Successfully updated the gallery name and uploaded the new image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Successfully updated all occurrences of {oldName} to {newName}'
 *       404:
 *         description: No records found to update
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No records found to update'
 *       500:
 *         description: Error updating names
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error updating names'
 *                 error:
 *                   type: string
 *                   example: 'Error details'
 */


router.put('/update/:id', authenticateJWT, upload.single('UpdateFile'), async function (req, res) {
    const { id } = req.params
    const { UpdateEventTitle, UpdateEventVideoURL, UpdateStatus, UpdateFile } = req.body

    const companyCode = req.companyCode;
    const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

    if (!Company) {
        return res.status(404).send({ message: "Company not found" })
    }
    const DbName = Company.dbName
    const sequelizeInstance = await getDbconnection(DbName)

    const AcademicMaster = require('../models/AcademicMaster')(
        sequelizeInstance, DataTypes
    )
    let File = null;
    if (req.file) {
        File = `http://localhost:3000/uploads/${req.file.filename}`;
    }

    try {
        await AcademicMaster.update(
            {
                EventTitle: UpdateEventTitle,
                EventVideoTitle: UpdateEventVideoURL,
                Status: UpdateStatus,
                File: File != null ? File : UpdateFile
            }, {
            where: {
                Id: id
            }
        }
        )

        logger.info(`Academic Master Updated Successfully! ID:${id}`)
        return res.status(200).send({ message: 'Successfully updated' })
    } catch (error) {
        console.log(error)
        logger.error(`Error Updating Academic Master ERROR:${error}`)
        return res.status(500).send({ message: 'Server error' })
    }
})



/**
 * @swagger
 * /academicmaster/delete:
 *   delete:
 *     summary: Delete multiple academic master records
 *     description: Deletes academic master records based on an array of IDs provided in the request body.
 *     tags:
 *       - AcademicMaster
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
 *                 description: An array of IDs representing the academic master records to delete.
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Successfully deleted the specified academic master records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Academic delete successfully"
 *       400:
 *         description: Invalid request format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request, Id must be array form"
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
    const AcademicMaster = require('../models/AcademicMaster')(
        sequelizeInstance, DataTypes
    )

    if (!Array.isArray(ids) || ids.length == 0) {
        return res.status(400).send({ message: 'Invalid request, Id must be array form' })
    }

    try {
        await AcademicMaster.destroy({ where: { Id: ids } })
        // USE LOGGER

        logger.info(`Successfully deleted Academic Master ID:${ids}`)
        res.status(200).send({ message: 'Academic delete successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Failed to delete Academic Master ID:${ids}`)
        res.status(500).send({ message: 'Server error' })
    }
})


module.exports = router