const express = require("express");
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const logger = require("../utils/logger")
const upload = require("../utils/upload");
const { error } = require("console");
const authenticateJWT = require("../utils/JWTauth");
const getDbconnection = require("../DbConnection/CdConnection");
const { DataTypes } = require("sequelize");

/**
 * @swagger
 /Event/create:
 *   post:
 *     summary: Create an Event
 *     description: Creating a Event and upload image.
 *     tags:
 *       - Event
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               EventTitle:
 *                 type: string
 *               Priority:
 *                 type: integer
 *                 description: Priority
 *               Status:
 *                 type: boolean
 *                 description: status of the event
 *               Imagepath:
 *                 type: string
 *                 format: binary
 *                 description: Path to the uploaded image
 *                 
 *     responses:
 *       201:
 *         description: Details of the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Event:
 *                   type: object
 *                   properties:
 *                     Id:
 *                       type: integer
 *                     EventTitle:
 *                       type: string
 *                     Imagepath:
 *                       type: string
 *                     Priority:
 *                       type: integer
 *                     Status:
 *                       type: Boolen
 *                     createdAt:
 *                       type: datetime
 *                     updatedAt:
 *                       type: datetime
 *       500:
 *         description: Error uploading Event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error uploading Event to database'
 */


router.post("/create", authenticateJWT, upload.array("Image"), async (req, res) => {
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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )

        const { EventTitle, Priority, Status, Image } = req.body;
        // console.log("data", EventTitle, Priority, Status, Image)
        // console.log("file", req.files)
        // console.log("images", Image)
        const imageUrls = req.files.map((file) => {
            return {
                Imagepath: `${req.protocol}://${req.get("host")}/uploads/${file.originalname
                    }`,
            };
        });

        const Event = {
            EventTitle: EventTitle,
            Priority: Priority,
            Status: Status == 'True' ? true : false,
            Imagepath: imageUrls,
        }
        // console.log("Event", Event)
        const image = await EventModel.create(Event);
        // console.log(image.Imagepath)
        if (image) {
            logger.info(`Event Created successfully: ${image}`)
            res.status(200).json({ Event: image });
        }
    } catch (error) {
        console.error("Error in event:", error);
        logger.error(`Error creating event: ${error}`);
        res.status(500).json({ message: "Error in event", error });
    }
});


/**
 * @swagger
 * /Event/images/all:
 *   get:
 *     summary: Retrieve all Event
 *     description: Retrieves all Event.
 *     tags:
 *       - Event
 *     responses:
 *       200:
 *         description: Successfully retrieved Events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     EventTitle:
 *                       type: string
 *                     Imagepath:
 *                       type: string      
 *       404:
 *         description: No Event found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No Event found'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 */


router.get("/images/all", authenticateJWT, async (req, res) => {
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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )

        const images = await EventModel.findAll();

        if (!images || images.length === 0) {
            return res.status(404).json({ message: "No event found" });
        }

        const groupedImages = images.reduce((acc, image) => {
            const name = image.EventTitle;
            if (!acc[name]) {
                acc[name] = [];
            }
            acc[name].push(image);
            return acc;
        }, {});

        logger.info(`Successfully Get All Event `)
        res.status(200).json({ groupedImages });
    } catch (error) {
        console.error("Error retrieving event:", error);
        logger.error(`Error getting all event: ${error}`);
        res
            .status(500)
            .json({ message: "Error retrieving events", error: error.message });
    }
});


/**
 * @swagger
 * /Event/images/{id}:
 *   delete:
 *     summary: Delete an Event
 *     description: Deletes a specified image from the gallery by image ID.
 *     tags:
 *       - Event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           description: The ID of the Event to be deleted
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event deleted successfully"
 *                 fileName:
 *                   type: string
 *                   example: "example.jpg"
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Event not found"
 *       500:
 *         description: Error deleting Event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error deleting Event"
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */


router.delete("/images/:id", authenticateJWT, async (req, res) => {
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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )

        const Event = await EventModel.findByPk(req.params.id);
        if (!Event) {
            return res.status(404).json({ message: "Event not found" });
        }
        const fileName = Event.EventTitle
        await Event.destroy();

        logger.info(`Event deleted successfully: ${Event.EventTitle}`)
        res.status(200).json({ message: "Event deleted successfully", fileName });
    } catch (error) {
        console.error("Error deleting Event:", error);
        logger.error(`Error deleting event: ${error}`);
        res
            .status(500)
            .json({ message: "Error deleting Event", error: error.message });
    }
});

/**
 * @swagger
 * /Event/images/single/{id}:
 *   delete:
 *     summary: Delete an image from the slider by ID.
 *     description: Deletes an image from the slider and removes its path from the database.
 *     tags:
 *       - Event
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the slider event.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: The full path of the image to be deleted.
 *     responses:
 *       200:
 *         description: Image deleted successfully from slider.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Image deleted successfully from slider.
 *       404:
 *         description: Either the event or the image was not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Event not found or Image not found in slider.
 *       500:
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error.
 */

router.delete("/images/single/:id", async (req, res) => {
    const EventId = req.params.id;
    const imagePathToDelete = req.body.image;

    // console.log(`deleting ${imagePathToDelete}`)
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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )
        // Find the Slider by ID
        const slider = await EventModel.findByPk(EventId);
        if (!slider) {
            return res.status(404).json({ error: "Event not found" });
        }
        // console.log(slider);
        const filenameToDelete = path.basename(imagePathToDelete);
        // Check if the image path exists in the slider
        const imagePaths = slider.Imagepath;
        console.log("paths", imagePaths)
        const Indexofimage = JSON.parse(imagePaths)

        console.log("Indexofimage", Indexofimage, filenameToDelete);

        const imageIndex = Indexofimage.findIndex(
            (imagePath) => path.basename(imagePath.Imagepath) === decodeURIComponent(filenameToDelete)
        );
        console.log("imageIndex", imageIndex);
        if (imageIndex === -1) {
            return res.status(404).json({ error: "Image not found in slider" });
        }

        // Delete the image file from /uploads folder
        const filePath = path.join(
            __dirname,
            "../uploads",
            filenameToDelete
        );
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Error deleting file ${filePath}:`, err);
                return res.status(500).json({ error: "Error deleting image file" });
            } else {
                console.log(`Successfully deleted file ${filePath}`);
            }
        });

        // Remove the image path from the slider's Imagepaths array

        Indexofimage.splice(imageIndex, 1);

        await EventModel.update(
            { Imagepath: Indexofimage },
            { where: { id: EventId } }
        );

        logger.info(`Image deleted from Event successfully`)
        res.json({ message: "Image deleted successfully from Event" });
    } catch (error) {
        console.error("Error deleting image from Event:", error);
        logger.error(`Error deleting image from Event: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});



/**
 * @swagger
 * /Event/images/{Id}:
 *   get:
 *     summary: Retrieve a specific Event
 *     description: Fetches details of a specific event by event ID.
 *     tags:
 *       - Event
 *     parameters:
 *       - in: path
 *         name: Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the event to retrieve
 *     responses:
 *       200:
 *         description: Details of the event
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Event:
 *                   type: object
 *                   properties:
 *                     Id:
 *                       type: integer
 *                     EventTitle:
 *                       type: string
 *                     Imagepath:
 *                       type: string
 *                     Priority:
 *                       type: integer
 *                     Status:
 *                       type: Boolen
 *                     createdAt:
 *                       type: datetime
 *                     updatedAt:
 *                       type: datetime
 *       404:
 *         description: Event not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Event not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

router.get("/images/:Id", authenticateJWT, async (req, res) => {
    const Id = req.params.Id;

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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )

        const Event = await EventModel.findByPk(Id);
        if (!Event) {
            return res.status(404).json({ error: "Event not found" });
        }

        logger.info(`Find An Event Successfully`)
        res.status(200).json({ Event });
    } catch (error) {
        console.error("Error retrieving event:", error);
        logger.error(`Error retrieving event: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
});


/**
 * @swagger
 * /Event/images/name:
 *   put:
 *     summary: Update Event by using id.
 *     description: Updates the event by finding base on id.
 *     tags:
 *       - Event
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer              
 *                 description: The id of the Event
 *               newEventTitle:
 *                 type: string
 *                 description: The new name of the Event
 *               newStatus:
 *                 type: boolean
 *                 description: The new name of the Event
 *               newPriority:
 *                 type: integer
 *                 description: The new name of the Event
 *               Image:
 *                 type: string
 *                 format: binary
 *                 description: Optional new image to upload
 *             required:
 *                 -id
 *     responses:
 *       200:
 *         description: Successfully updated the Event and uploaded the new image
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Successfully updated all occurrences'
 *       404:
 *         description: No event found to update
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
 *                   example: 'Error updating event'
 *                 error:
 *                   type: string
 *                   example: 'Error details'
 */

router.put("/images/name", authenticateJWT, upload.single("Image"), async (req, res) => {
    const { newEventTitle, id, newStatus, newPriority, Image } = req.body;
    console.log("data ", newEventTitle, newStatus, newPriority, id, Image)
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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )
        const OldEvent = await EventModel.findByPk(id)
        let imageUrl = null;
        // console.log("Image ", Image)
        if (Image != null) {
            imageUrl = `${req.protocol}://${req.get("host")}/uploads/${Image
                }`;
        }

        const [updated] = await EventModel.update(
            {
                EventTitle: newEventTitle != null ? newEventTitle : OldEvent.EventTitle,
                Imagepath: imageUrl != null ? imageUrl : OldEvent.Imagepath,
                Status: newStatus != null ? newStatus : OldEvent.Status,
                Priority: newPriority != null ? newPriority : OldEvent.Priority
            },
            { where: { Id: id } }
        );

        if (updated) {
            logger.info('Successfully updated all occurrences')
            res.status(200).json({
                updated: updated,
                message: `Successfully updated all occurrences`,
            });
        } else {
            res.status(404).json({ message: "No event found to update" });
        }
    } catch (error) {
        logger.error(`Failed to update event ${error}`)
        console.error("Error updating names:", error);
        res
            .status(500)
            .json({ message: "Error updating event", error: error.message });
    }
});



/**
 * @swagger
 * /Event/deleteALL:
 *   delete:
 *     summary: Delete all events from the database.
 *     description: Deletes all records from the 'Event' table in the database.
 *     tags:
 *       - Event
 *     responses:
 *       200:
 *         description: Successfully deleted all events.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: All events deleted successfully
 *       404:
 *         description: Something went wrong (if no events were found to delete).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something went wrong
 *       500:
 *         description: Internal server error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Internal server error
 */

router.delete("/deleteALL", authenticateJWT, async function (req, res) {
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
        const EventModel = require('../models/Event')(
            sequelizeInstance, DataTypes
        )

        const allEventdelete = await EventModel.destroy({
            where: {}, // Deletes all rows
            truncate: true, // Resets increment IDs (autoIncrement columns)
        });
        if (allEventdelete) {
            res.status(200).json({ message: "All events deleted successfully" });
        }

        logger.info(`All event delete successfully`)
        res.status(404).json({ message: "Something went wrong" });
    } catch (error) {
        console.log(error);
        logger.error(`Error deleting all events: ${error}`);
        res.status(500).json({ error: "Internal server error" });
    }
})









module.exports = router