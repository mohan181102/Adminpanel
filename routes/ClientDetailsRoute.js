const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, Sequelize } = require("sequelize");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
const logger = require('../utils/logger');
const { loadModels } = require("../loadModels/loadmodels");


const sanitizeDbName = (dbName) => {
    // Remove any characters that are not letters, numbers, or underscores
    return dbName?.replace(/[^a-zA-Z0-9_]/, "");
};
/**
 * @swagger
 * /ClientDetails/create:
 *   post:
 *     summary: Creates a new database and client record
 *     description: This endpoint creates a new database file and a corresponding client record. It also creates a default admin user.
 *     tags:
 *       - ClientsDetails
 *     requestBody:
 *       description: Information required to create a new database and client record
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *                 description: The name of the client.
 *                 example: "Example Client"
 *               SiteUrl:
 *                 type: string
 *                 description: The URL of the client’s site.
 *                 example: "https://example.com"
 *               Restriction:
 *                 type: string
 *                 description: Any restrictions for the client.
 *                 example: "None"
 *               DbName:
 *                 type: string
 *                 description: The name of the database to be created.
 *                 example: "example_client_db"
 *             required:
 *               - Name
 *               - SiteUrl
 *               - DbName
 *     responses:
 *       200:
 *         description: Successfully created client and database
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Success created client"
 *       400:
 *         description: Bad request, such as when the database already exists or required fields are missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "database already exists"
 *       404:
 *         description: Database name not found or invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "database name not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error While Creating Client!"
 *     security:
 *       - apiKey: []
 */

router.post("/create", async (req, res) => {
    try {
        const { Name, SiteUrl, Restriction, DbName } = req.body

        const dbName = sanitizeDbName(DbName)
        if (!dbName) return res.status(404).send({ message: "database name not found" })

        const Client = await mdl.db1.ClientDetail.create({
            Name,
            SiteUrl,
            dbName,
            Restriction
        })

        const dbFilePath = path.join(__dirname, `../database/${Client.dbName}.db`);

        // check already existing db
        if (fs.existsSync(dbFilePath)) {
            return res.status(400).send({ message: "database already exists" })
        }

        const sequelize = new Sequelize({
            dialect: "sqlite",
            storage: dbFilePath
        })
        const DataTypes = Sequelize.DataTypes;
        const model = loadModels(sequelize, DataTypes)
        await sequelize.sync({ force: true })

        // CREATING DEFAULT USER ADMIN
        // username, password, AllowField


        const hashedPassword = await bcrypt.hash("admin", 10);

        const DefaultUser = await model.Users.create({
            Username: "admin",
            Password: hashedPassword,
            AllowField: ["all"],
            Role: "Admin"
        })

        const companyget = await mdl.db1.ClientDetail.findOne({ where: { Name } })
        const data = {
            CompanyName: Name,
            DbName: dbName,
            DefaultUser: "admin",
            CompanyCode: companyget.CompanyCode
        }

        // ADDING COMPANY TO NEW COMPANYLIST
        const CompanyList = await mdl.db1.CompanyList.create(
            {
                AllUserId: [DefaultUser.Username],
                CompanyId: companyget.Name,
                BlacklistedCompanyId: null
            }
        )

        console.log(CompanyList)

        logger.info('Company create successfully')
        res.status(200).json({ message: 'Successfully create company', data })
    } catch (error) {
        console.log(error);
        logger.error(`Error While Creating Company ERROR:${error}`)
        return res.status(500).send({ message: "Error While Creating Client!" })
    }
})


/**
 * @swagger
 * /ClientDetails/login/{code}:
 *   get:
 *     summary: Get company details by company code
 *     tags: 
 *       - ClientsDetails
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         description: The code of the company to retrieve.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company found successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company found successfully.
 *                 data:
 *                   type: object
 *                   description: The company object.
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Example Company
 *                     CompanyCode:
 *                       type: string
 *                       example: ABC123
 *       404:
 *         description: Company not found or invalid code provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while creating company!
 */

router.get("/login/:code", async (req, res) => {
    try {
        const { code } = req.params

        if (!code) {
            return res.status(404).send({ message: 'Please provide all details.' })
        }

        const company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: code } })

        if (!company) {
            return res.status(404).send({ message: 'Company not found.' })
        }
        logger.info(`company find successfully, CODE:${code}`)
        return res.status(200).send({ message: 'Company found successfully.', data: company })
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: "Error while creating company!" })
    }
})



/**
 * @swagger
 * /ClientDetails/update/{id}:
 *   put:
 *     summary: Update company details by ID
 *     tags: 
 *       - ClientsDetails
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the company to update.
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateName:
 *                 type: string
 *                 description: The new name of the company.
 *                 example: Updated Company Name
 *               UpdateSiteUrl:
 *                 type: string
 *                 description: The new site URL of the company.
 *                 example: https://newcompanysite.com
 *               UpdateRestriction:
 *                 type: string
 *                 description: The new restriction details of the company.
 *                 example: No access after 9 PM
 *     responses:
 *       200:
 *         description: Company updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Updated company successfully
 *       404:
 *         description: Company not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company not found.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while updating client!
 */

router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params
        const { UpdateName, UpdateSiteUrl, UpdateRestriction } = req.body
        if (!id) return res.status(404).send({ message: 'Company not found.' })
        await mdl.db1.ClientDetail.update({
            Name: UpdateName,
            SiteUrl: UpdateSiteUrl,
            Restriction: UpdateRestriction
        }, {
            where: {
                Id: id
            }
        })

        logger.info(`Company details update successfully ID:${id}`)
        res.status(200).send({ message: 'Updated company successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Error updating company ERROR:${error}`)
        res.status(500).send({ message: "Error while updating client!" })
    }
})


// ALL COMPANY GET
// router.get('/')

/**
 * @swagger
 * /ClientDetails/delete/{id}:
 *   delete:
 *     summary: Delete a company by ID
 *     tags: 
 *       - ClientsDetails
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the company to delete.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Company deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Company Deleted successfully ID:{id}
 *       404:
 *         description: Company not found or invalid ID provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while deleting
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while deleting client!
 */

router.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params
        if (!id) return res.status(404).send({ message: `Error while deleting` })
        await mdl.db1.ClientDetail.destroy({
            where: {
                Id: id
            }
        })
        res.status(200).send({ message: `Company Deleted successfully ID:${id}` })
        logger.info(`Company deleted successfully ID:${id}`)
    } catch (error) {
        console.log(error)
        logger.error(`Error deleting company ERROR:${error}`)
        res.status(500).send({ message: "Error while deleting client!" })
    }
})

module.exports = router