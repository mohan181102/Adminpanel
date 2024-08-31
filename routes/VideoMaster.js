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
 * /VideoMaster/create:
 *   post:
 *     summary: Create a new video task
 *     tags:
 *       - VideoMaster
 *     description: Endpoint to create a new video task in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Title:
 *                 type: string
 *               Status:
 *                 type: boolean
 *               Priority:
 *                 type: integer
 *               URL:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Title:
 *                   type: string
 *                 Status:
 *                   type: string
 *                 Priority:
 *                   type: string
 *                 URL:
 *                   type: string
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.post('/create', authenticateJWT, async function (req, res) {

    try {
        const { Title, Status, Priority, URL } = req.body
        

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
        const VideoMaster = require('../models/Videomaster')(
            sequelizeInstance, DataTypes
        )

        const VideoMasters = await VideoMaster.create({ Title, Status, Priority, URL });
        logger.info(`VideoMaster created successfully ${VideoMasters}`)
        res.status(200).json(VideoMasters);
    } catch (error) {
        console.error(error);
        logger.error(`Error while creating Video Master ${error}`)
        res.status(500).json({ error: 'Server error' });
    }
})



/**
 * @swagger
 * /VideoMaster/get/single/{id}:
 *   get:
 *     summary: Get a single video by ID
 *     tags:
 *       - VideoMaster
 *     description: Retrieve a single video task from the database by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the video task to retrieve.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 Title:
 *                   type: string
 *                 Status:
 *                   type: string
 *                 Priority:
 *                   type: string
 *                 URL:
 *                   type: string
 *       '404':
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Video not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */

router.get('/get/single/:id', authenticateJWT, async (req, res) => {
    const { id } = req.params;

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
        const VideoMasters = require('../models/Videomaster')(
            sequelizeInstance, DataTypes
        )

        const VideoMaster = await VideoMasters.findByPk(id);
        if (!VideoMaster) return res.status(404).json({ error: 'Video not found' });
        logger.info(`Video Master Get Successfully`)
        res.status(200).json(VideoMaster);
    } catch (error) {
        console.error(error);
        logger.info(`Video Master Get  failed: ${error.message}`)
        res.status(500).json({ error: 'Server error' });
    }
})



/**
 * @swagger
 * /VideoMaster/getall:
 *   get:
 *     summary: Get all video tasks
 *     tags:
 *        - VideoMaster
 *     description: Retrieve all video tasks from the database.
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   Title:
 *                     type: string
 *                   Status:
 *                     type: string
 *                   Priority:
 *                     type: string
 *                   URL:
 *                     type: string
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
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
        const VideoMaster = require('../models/Videomaster')(
            sequelizeInstance, DataTypes
        )
        const VideoMasters = await VideoMaster.findAll();
        if (!VideoMasters) return res.status(404).json({ error })
        logger.info(`all videomaster get ${VideoMaster}`)
        res.status(200).json(VideoMasters);
    } catch (error) {
        console.error(error);
        logger.info(`all videomaster get failed: ${error.message}`)
        res.status(500).json({ error: 'Server error' });
    }
})



/**
 * @swagger
 * /VideoMaster/update/{id}:
 *   put:
 *     summary: Update a video task by ID
 *     tags:
 *       - VideoMaster
 *     description: Update an existing video task in the database by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numeric ID of the video task to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateTitle:
 *                 type: string
 *               UpdateStatus:
 *                 type: string
 *               UpdatePriority:
 *                 type: string
 *               UpdateURL:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 Title:
 *                   type: string
 *                 Status:
 *                   type: string
 *                 Priority:
 *                   type: string
 *                 URL:
 *                   type: string
 *       '404':
 *         description: Video not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Video not found
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


router.put('/update/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params;
    const { UpdateTitle, UpdateStatus, UpdatePriority, UpdateURL } = req.body;

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
        const VideoMaster = require('../models/Videomaster')(
            sequelizeInstance, DataTypes
        )
        let videoMaster = await VideoMaster.findByPk(id);

        if (!videoMaster) return res.status(404).json({ error: 'Video not found' });

        const [update] = await VideoMaster.update(
            {
                Title: UpdateTitle,
                Status: UpdateStatus,
                Priority: UpdatePriority,
                URL: UpdateURL
            }, { where: { Id: id } }
        )

        logger.info(`Video Master Update Successfully ID: ${id}`)
        res.status(200).json(update);
    } catch {
        logger.error(`Video Master Update failed ERROR: ${error.message}}`)
        res.status(404).json({ message: "Something went wrong" })
    }
})


/**
 * @swagger
 * /VideoMaster/delete:
 *   delete:
 *     summary: Delete videos by ID
 *     tags:
 *       - VideoMaster
 *     description: Delete multiple video tasks from the database by their IDs.
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
 *                   type: integer
 *     responses:
 *       '200':
 *         description: Videos deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Videos deleted successfully
 *       '400':
 *         description: Invalid request body format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please Give id in array format
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Failed to delete videos
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    try {
        const { id } = req.body

        if (!Array.isArray(id)) {
            res.send({ message: 'Please Give id in array format' })
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
        const VideoMaster = require('../models/Videomaster')(
            sequelizeInstance, DataTypes
        )
        const deleteVideo = await VideoMaster.destroy({
            where: {
                Id: id
            }
        })

        if (deleteVideo) {
            logger.info(`Video Master Delete Successfully ID: ${id}`)
            res.status(200).send({ message: 'Videos deleted successfully' })
        } else {
            logger.info(`Video Master Delete failed`)
            res.send({ message: 'Failed to delete videos' })
        }
    } catch (error) {
        console.log(error)
        logger.error(`Video Master Delete failed ERROR: ${error.message}}`)
        res.status(500).send({ message: 'Server error' })
    }
})

module.exports = router