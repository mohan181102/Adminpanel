const express = require("express");
const app = express()
const router = express.Router();
const mdl = require("../models");
const { where, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");
const authenticateJWT = require("../utils/JWTauth");


/**
 * @swagger
 * /fontawesome/create:
 *   post:
 *     summary: Create a new font entry
 *     description: Creates a new font entry with the provided FontName and FontValue.
 *     tags:
 *       - FontAwesome
 *     requestBody:
 *       description: The font information to be created
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FontName:
 *                 type: string
 *                 example: "FontAwesome"
 *               FontValue:
 *                 type: string
 *                 example: "fa-solid fa-camera"
 *             required:
 *               - FontName
 *               - FontValue
 *     responses:
 *       200:
 *         description: Font added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Font added successfully"
 *       404:
 *         description: Error creating new font
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating new font"
 *       500:
 *         description: Server error creating new font
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error creating new font"
 */

router.post('/create', authenticateJWT, async (req, res) => {
    const { FontValue, FontName } = req.body

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
        const FontAwesome = require('../models/FontAwesome.model')(
            sequelizeInstance, DataTypes
        )

        const font = await FontAwesome.create(
            {
                FontName,
                FontValue
            }
        )

        if (!font) {
            return res.status(404).send({ message: "Error creating new font" })
        }

        logger.info(`Font add successfully`)
        return res.status(200).send({ message: 'Font add successfully' })
    } catch (error) {
        console.log(error)
        logger.error(`Font add failed`)
        return res.status(500).send({ message: "Server Error creating new font" })
    }
})




/**
 * @swagger
 * /fontawesome/getAll:
 *   get:
 *     summary: Retrieve all FontAwesome icons
 *     description: Fetches a list of all FontAwesome icons from the database.
 *     tags:
 *       - FontAwesome
 *     responses:
 *       200:
 *         description: Successfully retrieved all FontAwesome icons.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "All fonts found"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "fa-home"
 *                       code:
 *                         type: string
 *                         example: "f015"
 *       404:
 *         description: No fonts found or all fonts not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No fonts found"
 *       500:
 *         description: Server error while retrieving FontAwesome icons.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error creating font awesome"
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
        const FontAwesome = require('../models/FontAwesome.model')(
            sequelizeInstance, DataTypes
        )

        const allFont = await FontAwesome.findAll()

        if (!allFont) return res.status(404).send({ message: "All fonts not found" })

        if (allFont.length == 0) return res.status(404).send({ message: "No fonts found" })

        logger.info(`All font found successfully`)
        return res.status(200).send({ message: "All fonts found", data: allFont })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ message: "Server Error creating font awesome" })
    }
})



/**
 * @swagger
 * /fontawesome/update/{id}:
 *   put:
 *     summary: Update a FontAwesome entry
 *     description: Update the FontName and FontValue of a FontAwesome entry identified by its ID.
 *     tags:
 *       - FontAwesome
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the FontAwesome entry to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       description: Object containing the new values for FontName and FontValue
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateFontName:
 *                 type: string
 *                 example: "New Font Name"
 *               UpdateFontvalue:
 *                 type: string
 *                 example: "New Font Value"
 *     responses:
 *       '200':
 *         description: Successfully updated font
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Successfully updated font"
 *       '201':
 *         description: Error updating font
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error updating font"
 *       '500':
 *         description: Server Error updating font awesome
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error updating font awesome"
 */

router.put('/update/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params
    const { UpdateFontvalue, UpdateFontName } = req.body

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
        const FontAwesome = require('../models/FontAwesome.model')(
            sequelizeInstance, DataTypes
        )

        const font = await FontAwesome.update(
            {
                FontName: UpdateFontName,
                FontValue: UpdateFontvalue
            },
            {
                where: {
                    Id: id
                }
            }
        )

        if (!font) return res.status(201).send({ message: 'Error updating font' })
        logger.info(`Font Update Successfully`)
        return res.status(200).send({ message: 'Successfully updated font' })
    } catch (error) {
        console.log(error)
        logger.error(`Error updating font ERROR:${error}`)
        return res.status(500).send({ message: "Server Error updating font awesome" })
    }
})



/**
 * @swagger
 * /fontawesome/delete:
 *   delete:
 *     summary: Delete FontAwesome entries
 *     description: Delete multiple FontAwesome entries by their IDs.
 *     tags:
 *       - FontAwesome
 *     requestBody:
 *       description: Array of IDs of the FontAwesome entries to delete
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
 *       '200':
 *         description: Successfully deleted font(s)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Font delete successfully"
 *       '400':
 *         description: Invalid request, id should be array or have at least one value
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request, id should be array or have at least one value"
 *       '500':
 *         description: Server Error deleting FontAwesome entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Server Error deleting font awesome"
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    try {
        const { ids } = req.body

        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).send({ message: "Invalid request, id should be array or have atleast one value " })
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
        const FontAwesome = require('../models/FontAwesome.model')(
            sequelizeInstance, DataTypes
        )
        await FontAwesome.destroy({
            where: {
                Id: ids
            }
        })

        logger.info(`Font(s) deleted successfully`)
        return res.status(200).send({ message: "Font delete successfully" })
    } catch (error) {
        console.log(error)
        logger.error(`Error while deleting font: ${error}`)
        return res.status(500).send({ message: "Server Error deleting font awesome" })
    }
})


module.exports = router