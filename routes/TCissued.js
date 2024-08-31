const express = require("express");
const router = express.Router();

const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const authenticateJWT = require("../utils/JWTauth");
const getDbconnection = require("../DbConnection/CdConnection");
const logger = require("../utils/logger");



/**
 * @swagger
 * /TCissued/create:
 *   post:
 *     summary: Create a new TC Issued entry for a student
 *     description: Adds a new TC Issued record to the database for a student.
 *     tags:
 *       - TC Issued
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               StudentName:
 *                 type: string
 *                 example: John Doe
 *               FatherName:
 *                 type: string
 *                 example: Richard Doe
 *               MotherName:
 *                 type: string
 *                 example: Mary Doe
 *               DOB:
 *                 type: string
 *                 format: date
 *                 example: 2000-01-01
 *               AdmissionNo:
 *                 type: string
 *                 example: A12345
 *               ClassLeft:
 *                 type: string
 *                 example: 10
 *               TCNo:
 *                 type: string
 *                 example: TC123456
 *               LeavingDate:
 *                 type: string
 *                 format: date
 *                 example: 2024-06-15
 *               Remark:
 *                 type: string
 *                 example: Transfer certificate issued
 *               Link:
 *                 type: string
 *                 example: http://example.com/link-to-tc
 *               Status:
 *                 type: string
 *                 example: Issued
 *     responses:
 *       200:
 *         description: Successfully created the TC Issued entry
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Student TC Issued created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     Studentname:
 *                       type: string
 *                     Fathersname:
 *                       type: string
 *                     Mothersname:
 *                       type: string
 *                     DOB:
 *                       type: string
 *                     AdmissionNo:
 *                       type: string
 *                     ClassLeft:
 *                       type: string
 *                     TCNo:
 *                       type: string
 *                     LeavingDate:
 *                       type: string
 *                     Remark:
 *                       type: string
 *                     LINK:
 *                       type: string
 *                     Status:
 *                       type: string
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error creating student
 */

router.post('/create', authenticateJWT, async (req, res) => {
    const { StudentName, FatherName, MotherName, DOB, AdmissionNo, ClassLeft, TCNo, LeavingDate, Remark, Link, Status } = req.body

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
        const TCIssued = require('../models/TCIssued')(
            sequelizeInstance, DataTypes
        )

        const TCissued = await TCIssued.create({
            Studentname: StudentName,
            Fathersname: FatherName,
            Mothersname: MotherName,
            DOB,
            AdmissionNo: AdmissionNo,
            ClassLeft: ClassLeft,
            TCNo: TCNo,
            LeavingDate: LeavingDate,
            Remark: Remark,
            LINK: Link,
            Status: Status
        })

        logger.info(`Student TC Issued Created successfully ${TCIssued}`)
        res.status(200).json({ message: 'Student TC Issued created successfully', data: TCissued })
        if (!TCissued) {
            res.status(404).json({ message: "Error creating student", })
        }

    } catch (error) {
        console.log(error)
        logger.error(`Error creating student ${error}`)
        res.status(500).json({ message: "Error creating student" })
    }
})



/**
 * @swagger
 * /TCissued/getall:
 *   get:
 *     summary: Retrieve all TC Issued records
 *     tags:
 *       - TC Issued
 *     description: Fetches all records from the TCIssued table.
 *     responses:
 *       200:
 *         description: Successfully retrieved all records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: The unique identifier of the record.
 *                   field1:
 *                     type: string
 *                     description: Description of the field1.
 *                   field2:
 *                     type: string
 *                     description: Description of the field2.
 *                   # Add other fields here based on your schema
 *       404:
 *         description: No data found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No data found"
 *       500:
 *         description: Error retrieving the data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error getting all TC"
 */

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
        const TCIssued = require('../models/TCIssued')(
            sequelizeInstance, DataTypes
        )

        const data = await TCIssued.findAll()

        logger.info(`TCIssued Created successfully`)
        res.status(200).json(data)
        if (!data) {
            res.status(404).json({ message: "No data found" })
        }
    } catch (error) {
        logger.error(`TCissued Creation Failed: ${error.message}`)
        res.status(500).json({ message: "Error getting all TC" })
    }
})



/**
 * @swagger
 * /TCissued/update/{id}:
 *   put:
 *     summary: Update a TC record
 *     tags:
 *       - TC Issued
 *     description: Updates a TC record in the database with provided details. Fields that are not provided will remain unchanged.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the TC record to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               UpdateStudentName:
 *                 type: string
 *                 description: New name of the student
 *               UpdateFatherName:
 *                 type: string
 *                 description: New name of the father
 *               UpdateMotherName:
 *                 type: string
 *                 description: New name of the mother
 *               UpdateDOB:
 *                 type: string
 *                 format: date
 *                 description: New date of birth of the student
 *               UpdateAdmissionNo:
 *                 type: string
 *                 description: New admission number
 *               UpdateClassLeft:
 *                 type: string
 *                 description: New class left
 *               UpdateTCNo:
 *                 type: string
 *                 description: New TC number
 *               UpdateLeavingDate:
 *                 type: string
 *                 format: date
 *                 description: New leaving date
 *               UpdateRemark:
 *                 type: string
 *                 description: New remarks
 *               UpdateLink:
 *                 type: string
 *                 description: New link related to the TC
 *               UpdateStatus:
 *                 type: string
 *                 description: New status of the TC
 *     responses:
 *       200:
 *         description: TC updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: TC updated successfully
 *       500:
 *         description: Error updating TC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error updating TC
 *                 error:
 *                   type: object
 *                   additionalProperties: true
 *                   example: { ... }
 */

router.put('/update/:id', authenticateJWT, async function (req, res) {
    const { id } = req.params
    const { UpdateStudentName, UpdateFatherName, UpdateMotherName, UpdateDOB, UpdateAdmissionNo, UpdateClassLeft, UpdateTCNo, UpdateLeavingDate, UpdateRemark, UpdateLink, UpdateStatus } = req.body

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
        const TCissued = require('../models/TCIssued')(
            sequelizeInstance, DataTypes
        )

        const OldTC = await TCissued.findByPk(id)

        const updated = await TCissued.update({
            Studentname: UpdateStudentName != null ? UpdateStudentName : OldTC.Studentname,
            Fathersname: UpdateFatherName != null ? UpdateFatherName : OldTC.Fathersname,
            Mothersname: UpdateMotherName != null ? UpdateMotherName : OldTC.Mothersname,
            DOB: UpdateDOB != null ? UpdateDOB : OldTC.DOB,
            AdmissionNo: UpdateAdmissionNo != null ? UpdateAdmissionNo : OldTC.AdmissionNo,
            ClassLeft: UpdateClassLeft != null ? UpdateClassLeft : OldTC.ClassLeft,
            TCNo: UpdateTCNo != null ? UpdateTCNo : OldTC.TCNo,
            LeavingDate: UpdateLeavingDate != null ? UpdateLeavingDate : OldTC.LeavingDate,
            Remark: UpdateRemark != null ? UpdateRemark : OldTC.Remark,
            LINK: UpdateLink != null ? UpdateLink : OldTC.LINK,
            Status: UpdateStatus != null ? UpdateStatus : OldTC.Status,
        }, {
            where: {
                Id: id
            }
        })

        logger.info(`TC updated successfully with ID: ${id}`)
        res.status(200).send({ message: "Tc updated successfully", data: updated })

    } catch (error) {
        logger.error(`TC Update Error: ${error.message}`)
        res.send({ message: "Error updating TC", error: error })
    }
})



/**
 * @swagger
 * /TCissued/delete:
 *   delete:
 *     summary: Delete multiple TCs
 *     tags:
 *       - TC Issued
 *     description: Deletes multiple TCs based on an array of IDs provided in the request body.
 *     requestBody:
 *       description: Array of IDs to be deleted
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
 *                 description: Array of TC IDs to delete
 *             required:
 *               - id
 *     responses:
 *       200:
 *         description: TC deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: TC deleted successfully!
 *       400:
 *         description: Invalid input or missing ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: ID should be in array format
 *       500:
 *         description: Error deleting TC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error deleting TC
 *                 error:
 *                   type: string
 *                   example: Detailed error message
 */

router.delete('/delete', authenticateJWT, async function (req, res) {
    const { id } = req.body

    if (!Array.isArray(id) || id.length == 0) {
        res.send({ message: "ID should be in array format" })
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
        const TCIssued = require('../models/TCIssued')(
            sequelizeInstance, DataTypes
        )

        await TCIssued.destroy({ where: { id: id } })

        logger.info(`TC deleted successfully with IDs: ${id}`)
        res.status(200).send({ message: "TC deleted successfully!" })
    } catch (error) {
        logger.error(`TC Delete Error: ${error.message}`)
        res.status(500).send({ message: "Error deleting TC", error: error })
    }
})



/**
 * @swagger
 * /TCissued/singleTC/{id}:
 *   get:
 *     summary: Retrieve a single TC (Technical Certificate) by ID
 *     tags:
 *       - TC Issued
 *     description: Fetches a specific TC based on the provided ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: The ID of the TC to retrieve.
 *     responses:
 *       '200':
 *         description: Successfully retrieved TC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: TC found successfully
 *                 data:
 *                   type: object
 *                   additionalProperties: true
 *                   description: The retrieved TC object.
 *       '500':
 *         description: Error fetching TC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error Fetching TC
 *                 error:
 *                   type: object
 *                   additionalProperties: true
 *                   description: Details of the error encountered.
 */

router.get('/singleTC/:id', authenticateJWT, async function (req, res) {
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
        const TCIssued = require('../models/TCIssued')(
            sequelizeInstance, DataTypes
        )

        const TC = await TCIssued.findByPk(id)
        TC && logger.info(`TC found successfully ${TC}`)
        TC ? res.status(200).send({ message: "TC found successfully", data: TC }) : res.status(401).send({ message: "NO Tc found", data: TC })
    } catch (error) {
        logger.error(`TC Fetch Error: ${error.message}`)
        res.send({ message: "Error Fetching TC", error: error })
    }
})




module.exports = router