const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const authenticateJWT = require("../utils/JWTauth");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");



/**
 * @swagger
 * /MenuMaster/create:
 *   post:
 *     summary: Create a new menu item
 *     description: Creates a new menu item with the provided details. An image can be uploaded with the request.
 *     tags:
 *       - MenuMaster
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Category_sub:
 *                 type: string
 *                 description: The subcategory of the menu item.
 *               URL:
 *                 type: string
 *                 description: The URL associated with the menu item.
 *               Priority:
 *                 type: integer
 *                 description: The priority of the menu item.
 *               GruopName:
 *                 type: string
 *                 description: The group name associated with the menu item.
 *               Status:
 *                 type: string
 *                 description: The status of the menu item.
 *               TextArea:
 *                 type: string
 *                 description: Additional text related to the menu item.
 *               Image:
 *                 type: string
 *                 description: The image file associated with the menu item. This is handled as a file upload.
 *             required:
 *               - Category_sub
 *               - URL
 *               - Priority
 *               - GruopName
 *               - Status
 *               - TextArea
 *     responses:
 *       200:
 *         description: Menu item created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Menu created successfully!
 *       500:
 *         description: Error creating the menu item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating menu
 *     security:
 *       - apiKeyAuth: []
 */

router.post('/create', authenticateJWT, upload.single("Image"), async (req, res) => {
    const { Category_sub, URL, Priority, GruopName, Status, TextArea } = req.body;
    let ImagePath = null;
    if (req.file) {
        ImagePath = `${req.protocol}://${req.get("host")}/uploads/${req.file.originalname}`
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
        const MenuMaster = require('../models/MenuMaster')(
            sequelizeInstance, DataTypes
        )

        await MenuMaster.create(
            {
                Category_sub,
                URL,
                Priority,
                TextArea,
                GruopName,
                Status,
                Image: ImagePath != null ? ImagePath : "",
            }
        )

        logger.info(`Successfully created menu master`)
        res.status(200).json({
            message: "Menu created successfully!",
        })

    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: "Error creating menu" })
        console.log(error)
    }
})



/**
 * @swagger
 * /menumaster/getall:
 *   get:
 *     summary: Retrieve all menu items
 *     tags: 
 *       - MenuMaster
 *     description: Fetches a list of all menu items from the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved all menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "all menu found"
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
 *                         example: "Menu Item Name"
 *                       description:
 *                         type: string
 *                         example: "Description of the menu item"
 *                       price:
 *                         type: number
 *                         format: float
 *                         example: 12.99
 *       500:
 *         description: Error while fetching all menu items
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error while fetching all menu"
 *                 error:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Error Name"
 *                     message:
 *                       type: string
 *                       example: "Detailed error message"
 *                     stack:
 *                       type: string
 *                       example: "Stack trace information"
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
        const MenuMaster = require('../models/MenuMaster')(
            sequelizeInstance, DataTypes
        )

        const allMenu = await MenuMaster.findAll(
            {
                order: [['Priority', 'ASC']]
            }
        )

        if (allMenu) {
            logger.info(`Successfully fetched all menu`)
            res.status(200).json({ message: "all menu found", data: allMenu })
        }

    } catch (error) {
        logger.error(error)
        res.status(500).json({ message: "Error while fetching all menu", error: error })
    }
})



/**
 * @swagger
 * /menumaster/update/{id}:
 *   put:
 *     summary: Update a result by ID
 *     tags: 
 *       - MenuMaster
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
 *               Category_sub:
 *                 type: string
 *                 description: The new title of the event
 *               Status:
 *                 type: boolean
 *                 description: The new status of the event
 *               URL:
 *                 type: string
 *                 description: The new URL associated with the event
 *               Priority:
 *                 type: integer
 *                 description: The new URL associated with the event
 *               GruopName:
 *                 type: string
 *                 description: The new URL associated with the event
 *               Image:
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



router.put('/update/:id', authenticateJWT, upload.single("Image"), async function (req, res) {
    try {
        const { id } = req.params
        const { Category_sub, URL, Priority, GruopName, Status, Image, UpdateTextArea } = req.body
        let filename = null
        if (req.file) {
            filename = `${req.protocol}://${req.get("host")}/uploads/${req.file.originalname}`
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
        const MenuMaster = require('../models/MenuMaster')(
            sequelizeInstance, DataTypes
        )

        await MenuMaster.update({
            Category_sub,
            URL,
            Priority,
            GruopName,
            TextArea: UpdateTextArea,
            Status,
            Image: filename != null ? filename : Image
        }, { where: { Id: id } })
        logger.info('MenuMaster updated successfully')
        res.status(200).json({ message: 'Menu updated successfully' })
    } catch (error) {
        logger.error(`Menu update failed: ${error.message}`)
        res.status(500).json({ message: "Menu update failed" })
    }
})



/**
 * @swagger
 * /menumaster/delete:
 *   delete:
 *     summary: Delete Menu Items
 *     description: Deletes menu items based on provided IDs.
 *     tags:
 *       - MenuMaster
 *     requestBody:
 *       description: IDs of the menu items to be deleted.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of IDs to delete.
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: Menu deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Menu deleted successfully
 *       400:
 *         description: ID should be in form of array
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID should be in form of array
 *       500:
 *         description: Menu delete failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Menu delete failed
 */


router.delete('/delete', authenticateJWT, async function (req, res) {
    const { id } = req.body

    if (!Array.isArray(id) || id.length == 0) {
        res.status(404).json({ message: "ID should be in form of array" })
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
        const MenuMaster = require('../models/MenuMaster')(
            sequelizeInstance, DataTypes
        )

        const DeletedItem = await MenuMaster.findByPk(id[0])
        const allMenu = await MenuMaster.findAll()
        const deleteditem = DeletedItem.dataValues

        let allValue = []

        allMenu.forEach(item => {
            if (item.dataValues.GruopName == deleteditem.Category_sub) {
                console.log(item)
                allValue.push(item)
            }
        })

        if (allValue.length == 0) {
            await MenuMaster.destroy({ where: { Id: id } })
        } else {
            logger.error(`delete child first`)
            return res.status(403).json({ message: "Delete child Menu first ?" })
        }
        logger.info(`Menu delete successful`)
        res.status(200).json({ message: 'Menu deleted successfully' })
    } catch (error) {
        logger.info(`Menu delete failed`)
        res.status(500).json({ message: "Menu delete failed" })
    }
})




/**
 * @swagger
 * /menumaster/getsingle/{id}:
 *   get:
 *     summary: Retrieve a single menu item by ID
  *     tags:
 *       - MenuMaster
 *     description: Returns a single menu item from the database based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the menu item to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved the menu item.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Successfully found menu of 123
 *                 data:
 *                   type: object
 *                   description: The retrieved menu item data.
 *                   additionalProperties: true
 *       '404':
 *         description: Could not find the menu item or ID was not provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Couldn't find
 */


router.get('/getsingle/:id', authenticateJWT, async (req, res) => {
    try {
        const { id } = req.params

        if (!id) {
            return res.send(404).json({ message: "please provide a id number" })
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
        const MenuMaster = require('../models/MenuMaster')(
            sequelizeInstance, DataTypes
        )

        const result = await MenuMaster.findByPk(id)

        if (!result) {
            return res.status(404).send("Menu not present")
        }
        logger.info(`Successfullly found menu`)
        res.status(200).json({ message: "Successfully found menu of " + id, data: result })
    } catch (error) {
        logger.error(`Menu find failed: ${error.message}`)
        res.send(404).json({ message: "Couldn't find" })
        console.log(error)
    }
})


module.exports = router