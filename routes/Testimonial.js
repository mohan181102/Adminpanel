const express = require("express");
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const logger = require("../utils/logger");
const authenticateJWT = require("../utils/JWTauth");
const { DataTypes } = require("sequelize");
const getDbconnection = require("../DbConnection/CdConnection");



/**
 * @swagger
 * /Testimonial/create:
 *   post:
 *     summary: Create a new testimonial.
 *     tags:
 *       - Testimonial
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               Name:
 *                 type: string
 *               Status:
 *                 type: boolean
 *               Priority:
 *                 type: number
 *               URL:
 *                 type: string
 *               Details:
 *                 type: string
 *               Designation:
 *                 type: string
 *               Image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Testimonial created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     Name:
 *                       type: string
 *                     Status:
 *                       type: string
 *                     Priority:
 *                       type: string
 *                     URL:
 *                       type: string
 *                     Details:
 *                       type: string
 *                     Designation:
 *                       type: string
 *                     Image:
 *                       type: string
 *       400:
 *         description: No image uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Failed to create testimonial
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       404:
 *         description: Error in processing request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


// CREATE ROUTE
router.post('/create', authenticateJWT, upload.single("Image"), async function (req, res) {
    try {
        const { Name, Status, Priority, URL, Details, Designation } = req.body
        let Imagepath = null;
        const image = req.file
        console.log(image)
        if (!image) {
            res.status(400).send({ error: "No image uploaded" })
            return
        }
        Imagepath = `${req.protocol}://${req.get("host")}/uploads/${image.filename}`

        console.log("final path", Imagepath)

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
        const Testimonials = require('../models/Testimonial')(
            sequelizeInstance, DataTypes
        )

        const Testimonial = await Testimonials.create({
            Name,
            Status,
            Priority,
            URL,
            Details,
            Designation,
            Image: Imagepath,
        })

        if (Testimonial) {
            logger.info(`Testimonial created successfully DATA:${Testimonial}`)
            res.status(200).send({ message: "Testimonial created successfully", data: Testimonial })
        } else {
            res.status(500).send({ error: "Failed to create testimonial" })
        }
    } catch (error) {
        logger.error(`Failed to create testimonials`, error)
        res.status(404).send({ error: error })
    }
})



/**
 * @swagger
 * /Testimonial/update/{id}:
 *   put:
 *     summary: Update a download item by ID
 *     tags:
 *       - Testimonial
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the download item to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateName:
 *                 type: string
 *               UpdateStatus:
 *                 type: boolean
 *               UpdatePriority:
 *                 type: integer
 *               UpdateURL:
 *                 type: string
 *               UpdateDetails:
 *                 type: string
 *               Image:
 *                 type: string
 *                 format: binary
 *               UpdateDesignation:
 *                 type: string
 *     responses:
 *       '200':
 *         description: Successfully updated the download item
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: ID of the updated download item
 *                 Name:
 *                   type: string
 *                 URL:
 *                   type: string
 *                 Image:
 *                   type: string
 *                   description: URL of the updated image
 *                 Status:
 *                   type: string
 *                 Designation:
 *                   type: string
 *                 Priority:
 *                   type: integer
 *                 Details:
 *                   type: string
 *       '404':
 *         description: Testimonial not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       '500':
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */


// UPDATE TESTIMONIAL
router.put('/update/:id', authenticateJWT, upload.single("Image"), async function (req, res) {
    const { id } = req.params;

    const { Name, Status, Priority, URL, Details, Designation } = req.body;
    const Image = req.file;

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
        const Testimonial = require('../models/Testimonial')(
            sequelizeInstance, DataTypes
        )
        const OldEvent = await Testimonial.findByPk(id)
        let imageUrl = null;

        if (Image != undefined) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${Image.originalname}`;
        }

        const [updated] = await mdl.db.Testimonial.update(
            {
                Name: Name,
                Status: Status,
                Priority: Priority,
                URL: URL,
                Details: Details,
                Designation: Designation,
                Image: imageUrl != null ? imageUrl : Image
            },
            { where: { id: id } }
        )

        logger.info(`Successfully updated testimonial ID:${id}`)
        res.status(200).send({ message: "successfully updated testimonials", data: updated })

    } catch (error) {
        console.error(error);
        logger.error(`Failed to update testimonials: ${error.message}`)
        res.status(500).json({ error: "An error occurred while updating the testimonial" });
    }
})



/**
 * @swagger
 * /Testimonial/delete:
 *   delete:
 *     summary: Update a download item by ID
 *     tags:
 *       - Testimonial
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
 *             required:
 *               - id
 *     responses:
 *       '200':
 *         description: Testimonials deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Testimonial with id 1 deleted successfully
 *       '404':
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Testimonial with id 1 not found
 *       '400':
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Testimonial id must be in array format
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 */



// DELETE SINGLE TESTIMONIAL
router.delete('/delete', authenticateJWT, async function (req, res) {
    try {
        const { id } = req.body; // Assuming IDs are sent in the request body as an array

        // Check if IDs array exists and has values
        if (!id || !Array.isArray(id) || id.length === 0) {
            return res.status(400).send({ error: "No valid IDs provided" });
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
        const Testimonial = require('../models/Testimonial')(
            sequelizeInstance, DataTypes
        )

        // Delete testimonials based on IDs
        const deleteResult = await Testimonial.destroy({
            where: {
                Id: id  // Assuming 'id' is the primary key field in your Testimonial model
            }
        });

        return res.status(200).send({ message: ' Testimonial deleted successfully' })
    } catch (error) {
        logger.error(`Testimonials delete failed: ${error.message}`)
        res.status(500).send({ error: error.message });
    }
});



/**
 * @swagger
 * /Testimonial/getall:
 *   get:
 *     summary: Retrieve all testimonials
 *     tags:
 *       - Testimonial
 *     description: Retrieve a list of all testimonials from the database.
 *     responses:
 *       200:
 *         description: A list of testimonials.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All testimonials
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
 *                         example: John Doe
 *                       testimonial:
 *                         type: string
 *                         example: This is a great service!
 *       404:
 *         description: No testimonials found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No testimonials found
 *       500:
 *         description: An error occurred while fetching testimonials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching testimonials
 */


// GET ALL TESTIMONES
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
        const Testimonial = require('../models/Testimonial')(
            sequelizeInstance, DataTypes
        )

        const testimonials = await Testimonial.findAll({ attributes: ['Id', 'URL', 'Name', 'Designation', 'Details', 'Image', 'Status', 'Priority'] })
        if (!testimonials) {
            res.status(404).send({ message: 'No testimonials found' })
        }
        logger.info(`Fetched all testimonials`)
        res.send({ message: 'All testimonials', data: testimonials })
    } catch (error) {
        console.error(error)
        logger.error(`Failed to fetch testimonials: ${error.message}`)
        res.status(500).json({ error: "An error occurred while fetching testimonials" })
    }
})



/**
 * @swagger
 * /Testimonial/single/{id}:
 *   get:
 *     summary: Get a single testimonial by ID
 *     description: Fetches a single testimonial based on the provided ID.
 *     tags:
 *       - Testimonial
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the testimonial to fetch
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Testimonial found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Testimonial found
 *                 data:
 *                   type: object
 *                   $ref: '#/components/schemas/Testimonial'
 *       404:
 *         description: Testimonial not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Testimonial with id {id} not found
 *       500:
 *         description: An error occurred while fetching testimonial
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: An error occurred while fetching testimonial
 */


// GET SINGLE TESTIMONIALS
router.get('/single/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params;
    if (!id) return res.status(404).send({ message: "Please send id" });

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
        const Testimonial = require('../models/Testimonial')(
            sequelizeInstance, DataTypes
        )

        const testimonial = await Testimonial.findByPk(id)
        if (!testimonial) {
            return res.status(404).send({ message: `Testimonial with id ${id} not found` })
        }

        logger.info(`Fetched testimonial with ID: ${id}`)
        res.send({ message: 'Testimonial found', data: testimonial })
    } catch (error) {
        console.error(error)
        logger.error(`Failed to fetch testimonial with ID: ${id}: ${error.message}`)
        res.status(500).json({ error: "An error occurred while fetching testimonial" })
    }

})



module.exports = router