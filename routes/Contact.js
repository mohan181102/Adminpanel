const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const authenticateJWT = require("../utils/JWTauth");
const { DataTypes, where } = require("sequelize");
const getDbconnection = require("../DbConnection/CdConnection");
const logger = require("../utils/logger")

/**
 * @swagger
 * /Contact/create:
 *   post:
 *     summary: Create a new contact entry
 *     description: This endpoint allows you to submit a contact form with the user's email, full name, message, and date.
 *     tags:
 *       - Contact
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the contact.
 *               FullName:
 *                 type: string
 *                 description: The full name of the contact.
 *               Message:
 *                 type: string
 *                 description: The message from the contact.
 *               Date:
 *                 type: string
 *                 format: date
 *                 description: The date of the contact form submission.
 *             required:
 *               - Email
 *               - FullName
 *               - Message
 *               - Date
 *     responses:
 *       200:
 *         description: Contact form submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Contact Form Submitted Successfully'
 *       404:
 *         description: Invalid email
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: 'Invalid email'
 *       500:
 *         description: Error occurred while submitting the contact form
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Contact Form Submitted Error'
 *                 error:
 *                   type: string
 *                   example: 'Detailed error message here'
 */

router.post("/create", authenticateJWT, async function (req, res) {
    const { Email, FullName, Message, Date } = req.body
    const companyCode = req.companyCode;

    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!regex.test(Email)) {
        res.status(404).send(`Invalid email`)
    }

    try {
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }
        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        const contactModel = require('../models/ContactUs')(
            sequelizeInstance, DataTypes
        )

        await contactModel.create({
            Email,
            FullName,
            Message,
            Date
        });

        logger.info(`Contact form submitted successfully for ${FullName} - ${Email}`)
        res.status(200).json({ message: 'Contact Form Submitted Successfully' });
    } catch (error) {
        logger.error(`Contact form submission failed ERROR:${error}`)
        res.status(500).send({ message: 'Contact Form Submitted Error', error: error });
    }
})



/**
 * @swagger
 * /Contact/getall:
 *   get:
 *     summary: Retrieve all contact entries
 *     description: This endpoint returns a list of all contact entries from the database.
 *     tags:
 *       - Contact
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


router.get("/getall", authenticateJWT, async (req, res) => {
    try {
        const companyCode = req.companyCode;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }

        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        const contactModel = require('../models/ContactUs')(
            sequelizeInstance, DataTypes
        )

        const Contacts = await contactModel.findAll();
        if (!Contacts) return res.status(404).json({ error })
        logger.info(`All Contacts get: ${Contacts}`)
        res.status(200).json(Contacts);
    } catch (error) {
        console.error(error);
        logger.error(`Error getting Contacts: ${error}`)
        res.status(500).json({ error: 'Server error' });
    }
})



/**
 * @swagger
 * /Contact/delete:
 *   delete:
 *     summary: Deletes contact records by IDs
 *     description: This endpoint deletes contact records from the database based on the provided IDs. Requires authentication.
 *     tags:
 *       - Contact
 *     security:
 *       - apiKey: []
 *     requestBody:
 *       description: IDs of the contacts to be deleted
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
 *                 description: An array of contact IDs to be deleted.
 *                 example: [1, 2, 3]
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: Successfully deleted the specified contact records
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contact is destroyed Successfully"
 *       400:
 *         description: Bad request, such as when `ids` is not an array or is empty
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ids must be an array"
 *       404:
 *         description: Not found, such as when no company is associated with the provided `companyCode`
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Company not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error message describing what went wrong"
 */

router.delete("/delete", authenticateJWT, async (req, res) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
        res.status(404).json({ error: 'ids must be an array' });
    }

    try {
        const companyCode = req.companyCode;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }

        const DbName = Company.dbName
        const sequelizeInstance = await getDbconnection(DbName)

        const contactModel = require('../models/ContactUs')(
            sequelizeInstance, DataTypes
        )

        await contactModel.destroy({ where: { Id: ids } })
        logger.info(`Contacts deleted successfully: ${ids}`)
        res.status(200).send({ message: "Contact is destroyed Successfully" })
    } catch (error) {
        logger.error(`Contact destroyed successfully ERROR:${error}`)
        res.status(500).json({ error: error.message });
    }
})

module.exports = router