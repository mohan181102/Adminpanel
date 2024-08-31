const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");
const authenticateJWT = require("../utils/JWTauth");


/**
 * @swagger
 * components:
 *   schemas:
 *     Client:
 *       type: object
 *       required:
 *         - Title
 *         - URL
 *         - Status
 *       properties:
 *         Title:
 *           type: string
 *           description: Title of the download.
 *           example: Example Title
 *         URL:
 *           type: string
 *           description: URL of the download.
 *           example: http://example.com/download
 *         Details:
 *           type: string
 *           description: Details of the Client.
 *           example: "abc"
 *         Priority:
 *           type: number
 *           description: priority of the client.
 *           example:  1
 *         Status:
 *           type: boolean
 *           description: Status of the download (true for active, false for inactive).
 *           example: true
 *         Image:
 *           type: string
 *           description: Path to the uploaded image (optional).
 * 
 * /client/create:
 *   post:
 *     summary: Create a new download
 *     tags:
 *       - Client
 *     description: Endpoint to create a new download entry. Accepts multipart/form-data for file uploads.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *                 description: Title of the download.
 *                 example: Example Title
 *               URL:
 *                 type: string
 *                 description: URL of the download.
 *                 example: http://example.com/download
 *               Priority:
 *                 type: integer,
 *                 description: Priority of the client.
 *                 example:  abc
 *               Details:
 *                 type: string
 *                 description: Details of client.
 *                 example: http://example.com/download
 *               Status:
 *                 type: boolean
 *                 description: Status of the download (true for active, false for inactive).
 *                 example: true
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Image file for the download (optional).
 *     responses:
 *       201:
 *         description: Download created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: A success message indicating the download creation.
 *                   example: Download created successfully
 *                 Download:
 *                   $ref: '#/components/schemas/Download'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message in case of internal server issues.
 *                   example: Internal server error
 */

router.post('/create', authenticateJWT, upload.single('Image'), async (req, res) => {
    try {
        const { Title, Details, URL, Priority, Status } = req.body
        let ImageURL = null;
        if (req.file) {
            ImageURL = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
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
        const ClientModel = require('../models/Client.model')(
            sequelizeInstance, DataTypes
        )

        await ClientModel.create(
            {
                Title,
                Details,
                URL,
                Priority,
                Status,
                Image: ImageURL
            }
        )

        logger.info(`Client create successfully`)
        return res.status(200).send({ message: 'created successfully' })
    } catch (error) {
        console.log(error);
        logger.error(`Client create failed`)
        return res.status(404).send({ message: 'error creating client' })
    }
})




/**
 * @swagger
 * /client/getAll:
 *   get:
 *     summary: Retrieve all contact entries
 *     description: This endpoint returns a list of all contact entries from the database.
 *     tags:
 *       - Client
 *     responses:
 *       200:
 *         description: A list of all contact entries
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique identifier of the contact.
 *                     example: 1
 *                   Email:
 *                     type: string
 *                     format: email
 *                     description: The email address of the contact.
 *                     example: 'example@example.com'
 *                   FullName:
 *                     type: string
 *                     description: The full name of the contact.
 *                     example: 'John Doe'
 *                   Message:
 *                     type: string
 *                     description: The message from the contact.
 *                     example: 'Hello, I have an inquiry.'
 *                   Date:
 *                     type: string
 *                     format: date
 *                     description: The date of the contact form submission.
 *                     example: '2024-07-23'
 *       404:
 *         description: No contacts found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'No contacts found'
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
        const ClientModel = require('../models/Client.model')(
            sequelizeInstance, DataTypes
        )

        const allClient = await ClientModel.findAll()

        if (!allClient) return res.status(404).send({ message: 'No clients found' })

        logger.info(`All client find successfully`)
        return res.status(200).send({ message: 'All client fetched', data: allClient })
    } catch (error) {
        logger.error(`Failed to fetch client ${error}`)
        return res.status(404).send({ message: 'error creating client' })
    }
})



/**
 * @swagger
 * /client/update/{id}:
 *   put:
 *     summary: Update Client object
 *     description: Updates the name of a gallery and optionally uploads a new image associated with the new gallery name.
 *     tags:
 *       - Client
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
 *               UpdaTitle:
 *                 type: string
 *                 description: The old name of the gallery
 *               UpdateURL:
 *                 type: string
 *                 description: The new name of the gallery
 *               UpdateDetails:
 *                 type: string
 *                 description: Details associated with the new gallery name
 *               UpdateStatus:
 *                 type: boolean
 *                 description: Status of the gallery
 *               UpdatePriority:
 *                 type: string
 *                 description: Priority of the gallery
 *               UpdateImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image to upload
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


router.put('/update/:id', authenticateJWT, upload.single("UpdateImage"), async (req, res) => {
    const { id } = req.params
    const { UpdaTitle, UpdateDetails, UpdateURL, UpdatePriority, UpdateStatus, UpdateImage } = req.body
    let imagepath = null
    if (req.file) {
        imagepath = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`

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
    const ClientModel = require('../models/Client.model')(
        sequelizeInstance, DataTypes
    )

    try {
        const [Client] = await ClientModel.update(
            {
                Title: UpdaTitle,
                Details: UpdateDetails,
                URL: UpdateURL,
                Priority: UpdatePriority,
                Status: UpdateStatus,
                Image: imagepath != null ? imagepath : UpdateImage
            },
            {
                where: {
                    Id: id
                }
            }
        )

        if (Client == 0) return res.status(404).send({ message: 'Error updating client' })

        logger.info(`Client Update successfully ${id}`)
        return res.status(200).send({ message: 'Client updated successfully', data: Client })
    } catch (error) {
        console.log(error)
        return res.status(404).send({ message: 'error creating event' })
    }
})



/**
 * @swagger
 * /client/delete:
 *   delete:
 *     summary: Delete multiple clients
 *     description: Deletes multiple clients by their IDs.
 *     tags:
 *       - Client
 *     requestBody:
 *       description: List of client IDs to delete.
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
 *         description: Successfully deleted clients.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully deleted client
 *       400:
 *         description: Invalid request, ids must be an array and not empty.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request, ids must be an array and not empty
 *       404:
 *         description: Client delete unsuccessful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client delete unsuccessfully
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    try {
        const { ids } = req.body
        if (!Array.isArray(ids) || ids.length == 0) {
            return res.status(400).send({ message: 'Invalid request, ids must be an array and not empty' })
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
        const ClientModel = require('../models/Client.model')(
            sequelizeInstance, DataTypes
        )

        await ClientModel.destroy({ where: { Id: ids } })

        logger.info(`Client Delete successfully ${ids}`)
        return res.status(200).send({ message: 'Successfully deleted client' })
    } catch (error) {
        console.log(error)
        logger.error(`Client Delete failed ERROR:${error}`)
        res.status(404).send({ message: 'client delete unsuccesfully' })
    }
})

module.exports = router