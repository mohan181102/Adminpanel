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
 * /HPBodyCard/create:
 *   post:
 *     summary: Create a new card
 *     description: Creates a new card with the provided details and uploads an image.
 *     tags: 
 *       - HPBodyCard
  *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Priority:
 *                 type: integer
 *                 description: Priority
 *               Status:
 *                 type: boolean
 *                 description: status of the event
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Path to the uploaded image
 *               URL:
 *                 type: string
 *               Details:
 *                 type: string
 *               CardWidth:
 *                 type: integer
 *               Heading:
 *                 type: string      
 *     responses:
 *       201:
 *         description: Card created successfully
 *         schema:
 *           type: object
 *           properties:
 *             newCard:
 *               type: object
 *               description: The created card object
 *             message:
 *               type: string
 *               example: Card created successfully
 *       404:
 *         description: Image not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Image not found
 *       500:
 *         description: Failed to create card
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Failed to create card
 */


router.post('/create', authenticateJWT, upload.single("Image"), async function (req, res) {
    const { Title, Status, Priority, Heading, URL, Details, CardWidth } = req.body
    try {
        const Image = req.file
        console.log(Image)
        let imagedata = null

        if (Image != null) {
            imagedata = `http://localhost:3000/uploads/${Image.originalname}`
        } else {
            res.status(404).send({ message: "Image not found" })
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
        const HPBodyCard = require('../models/HPBodyCard')(
            sequelizeInstance, DataTypes
        )

        const newCard = await HPBodyCard.create(
            {
                Title: Title,
                Heading: Heading,
                URL: URL,
                Details: Details,
                CardImage: imagedata,
                Status: Status,
                Priority: Priority,
                CardWidth: CardWidth
            }
        )

        if (newCard) {
            logger.info(`Card created successfully ${newCard}`)
            res.status(200).send({ newCard, message: "Card created successfully" })
        } else {
            res.status(500).send({ message: "Failed to create card" })
        }

    } catch (error) {
        logger.error(`Error creating card ${error}`)
        console.error(error)
    }

});



/**
 * @swagger
 * /HPBodyCard/get/{id}:
 *   get:
 *     summary: Retrieve a card by ID
 *     description: Fetches a card with the given ID from the database.
 *     tags:
 *       - HPBodyCard
 *     parameters:
 *       - in: path
 *         name: id
 *         type: string
 *         required: true
 *         description: The ID of the card to retrieve
 *     responses:
 *       200:
 *         description: Card found successfully
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: object
 *               description: The retrieved card object
 *             message:
 *               type: string
 *               example: Card found
 *       404:
 *         description: Card not found
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Card not found
 *       500:
 *         description: Failed to get card
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Failed to get card
 */


router.get('/get/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params
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
        const HPBodyCard = require('../models/HPBodyCard')(
            sequelizeInstance, DataTypes
        )


        const card = await HPBodyCard.findByPk(id)
        if (card) {
            res.send({ data: card, message: "Card founded" })
            logger.info(`Card with id ${id} found successfully`)
        } else {
            res.status(404).send({ message: "Card not found" })
        }
    }
    catch (error) {
        logger.error(`Error getting card with id ${id} ${error}`)
        res.status(500).send({ message: "Failed to get card" })
    }
})



/**
 * @swagger
 * /HPBodyCard/getall:
 *   get:
 *     summary: Retrieve all cards
 *     description: Fetches all cards from the database.
 *     tags:
 *       - HPBodyCard
 *     responses:
 *       200:
 *         description: Cards found successfully
 *         schema:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *               description: An array of retrieved card objects
 *             message:
 *               type: string
 *               example: Cards found
 *       500:
 *         description: Failed to get cards
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Failed to get cards
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
        const HPBodyCard = require('../models/HPBodyCard')(
            sequelizeInstance, DataTypes
        )

        const cards = await HPBodyCard.findAll()
        logger.info(`Found successfully ${cards}`)
        res.send({ data: cards, message: "Cards found" })
    }
    catch (error) {
        logger.error(`Failed to create ERROR:${error}`)
        res.status(500).send({ message: error.message })
    }
})



/**
 * @swagger
 * /HPBodyCard/delete:
 *   delete:
 *     summary: Delete card(s)
 *     description: Deletes one or more cards identified by their IDs from the database.
 *     tags:
 *       - HPBodyCard
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
 *                   type: string
 *                 example: ["123", "456"]
 *     responses:
 *       200:
 *         description: Card(s) deleted successfully
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Deleted successfully
 *       400:
 *         description: Invalid request format
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Deleted should be an array of non-empty IDs
 *       500:
 *         description: Failed to delete card(s)
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: Failed to delete card(s)
 */

router.delete('/delete', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.body

        if (!id || !Array.isArray(id) || id.length === 0) {
            res.status(200).send({ message: "Deleted should be an array" })
            return
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
        const HPBodyCard = require('../models/HPBodyCard')(
            sequelizeInstance, DataTypes
        )

        const deleteCard = await HPBodyCard.destroy({
            where: {
                Id: id
            }
        })

        if (deleteCard) {
            logger.info(`Body card delete success ${deleteCard}`)
            res.status(200).send({ message: "Deleted successfully" })
        }

    } catch (error) {
        console.log(error)
        logger.error(`Error deleting card(s) ${error}`)
        res.status(500).send({ message: "Failed to delete card" })
    }
})



/**
 * @swagger
 * /HPBodyCard/update/{id}:
 *   put:
 *     summary: Update a body card by ID with file upload
 *     description: Update details of a body card identified by its ID, including optional file upload.
 *     tags:
 *       - HPBodyCard
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the body card to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateTitle:
 *                 type: string
 *               UpdateStatus:
 *                 type: string
 *               UpdatePriority:
 *                 type: integer
 *               UpdateDetails:
 *                 type: string
 *               UpdateURL:
 *                 type: string
 *               UpdateHeading:
 *                 type: string
 *               UpdateCardWidth:
 *                 type: integer
 *               Image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       '200':
 *         description: Successfully updated the body card
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   description: Updated body card details
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       '500':
 *         description: Internal server error
 */

router.put('/update/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params
    const { UpdateTitle, UpdateStatus, UpdateDetails, UpdatePriority, UpdateURL, UpdateHeading, UpdateCardWidth, Image } = req.body
    let imagepath = null

    console.log("image", Image)


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
        const HPBodyCard = require('../models/HPBodyCard')(
            sequelizeInstance, DataTypes
        )


        const oldBodyCard = await HPBodyCard.findByPk(id)
        if (Image != oldBodyCard.CardImage) {
            imagepath = `http://localhost:3000/uploads/${Image}`
        }
        const updateCard = await HPBodyCard.update(
            {
                Title: UpdateTitle != null ? UpdateTitle : oldBodyCard.Title,
                Heading: UpdateHeading != null ? UpdateHeading : oldBodyCard.Heading,
                URL: UpdateURL != null ? UpdateURL : oldBodyCard.URL,
                Details: UpdateDetails != null ? UpdateDetails : oldBodyCard.Details,
                CardImage: imagepath != null ? imagepath : oldBodyCard.CardImage,
                Status: UpdateStatus != null ? UpdateStatus : oldBodyCard.Status,
                Priority: UpdatePriority != null ? UpdatePriority : oldBodyCard.Priority,
                CardWidth: UpdateCardWidth != null ? UpdateCardWidth : oldBodyCard.CardWidth
            },
            {
                where: {
                    Id: id
                }
            }
        )

        if (updateCard) {
            logger.info(`Body card update success ${updateCard}`)
            res.status(200).send({ data: updateCard, message: "Successfully Update Card" })
        }
    } catch (error) {
        console.log(error)
        logger.error(`Error updating card ${error}`)
        res.status(500).send({ message: "Failed to update " })
    }



})

module.exports = router