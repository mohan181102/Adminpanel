const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const getDbconnection = require("../DbConnection/CdConnection");
const logger = require("../utils/logger");
const authenticateJWT = require("../utils/JWTauth");
const jwtcheck = require("../utils/CheckJWTToken")



/**
 * @swagger
 * /blacklistToken/create:
 *   post:
 *     summary: Create a new contact entry
 *     description: This endpoint allows you to submit a contact form with the user's email, full name, message, and date.
 *     tags:
 *       - BlackList Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UserToken:
 *                 type: string
 *                 format: email
 *                 description: The email address of the contact.               
 *             required:
 *               - UserToken
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


router.post('/create', authenticateJWT, async (req, res) => {
    try {
        const CompanyCode = req.companyCode
        const { UserToken } = req.body;
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: CompanyCode } })
        const IsValidToken = jwtcheck(UserToken)
        const tokenuser = req.user;

        if (tokenuser.Urole != 'Admin') {
            return res.status(403).json({ error: 'You are not authorized to create a new user' })
        }

        if (!IsValidToken) {
            return res.status(404).send({ message: 'Please enter a valid JWT token' })
        }

        const NewBlackListToken = await mdl.db1.BlackListed.create(
            {
                BlackToken: UserToken
            }
        )

        if (!NewBlackListToken) return res.status(404).send({ message: 'Error creating new blacklisted token' })

        logger.info('successfully create new blacklisted token')
        res.status(200).json({ message: 'Blacklist Token Created Successfully', token: NewBlackListToken });
    } catch (error) {
        console.log(error);
        logger.error('Error creating Blacklist Token: ' + error.message)
        res.status(500).json({ message: 'Server Error' });
    }
})


// READ

/**
 * @swagger
 * /blacklistToken/getAll:
 *   get:
 *     summary: Retrieve all contact entries
 *     description: This endpoint returns a list of all contact entries from the database.
 *     tags:
 *       - BlackList Token
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

router.get('/getall', authenticateJWT, async (req, res) => {
    try {
        const CompanyCode = req.companyCode
        const tokenuser = req.user;

        if (tokenuser.Urole != 'Admin') {
            return res.status(403).json({ error: 'Only admin is allow' })
        }

        const Allblacklisted = await mdl.db1.BlackListed.findAll()

        res.status(200).json({ message: 'Allblacklisted successfully fetched', data: Allblacklisted })
    } catch (error) {
        logger.error(`Error while getting all blacklisted ERROR:${error.message}`)
        console.log(error)
        res.status(404).send("server error")
    }
})



// DELETE

/**
 * @swagger
 * /blacklistToken/delete/{id}:
 *   delete:
 *     summary: Update a course master entry
 *     description: Updates the details of a specific course master entry identified by the provided ID.
 *     tags:
 *       - BlackList Token
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

router.delete('/delete/:token', authenticateJWT, async (req, res) => {
    try {
        const { token } = req.params
        const tokenuser = req.user;

        if (tokenuser.Urole != 'Admin') {
            return res.status(403).json({ error: 'Only admin is allow' })
        }

        await mdl.db1.BlackListed.destroy({
            where: {
                BlackToken: token
            }
        })

        res.status(200).json({ message: 'Blacklist deleted successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Error while deleting blacklist ERROR:${error.message}`)
        res.status(404).send("server error")
    }
})

module.exports = router