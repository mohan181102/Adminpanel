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


/**
 * @swagger
 * /User/creatUser:
 *   post:
 *     summary: Create a new user
 *     description: This endpoint creates a new user with a given username and password. It also allows specifying additional fields if needed.
 *     tags:
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *                 description: The username of the new user. It must be unique.
 *               password:
 *                 type: string
 *                 example: P@ssw0rd123
 *                 description: The password for the new user. It must be at least 8 characters long.
 *               AllowField:
 *                 type: string
 *                 example: []
 *                 description: Optional field to allow additional data to be associated with the user.
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     Username:
 *                       type: string
 *                       example: johndoe
 *                     AllowField:
 *                       type: string
 *                       example: someField
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists or use a new username
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error message details
 */

router.post('/creatUser', authenticateJWT, async function (req, res) {
    const { username, password, AllowField } = req.body;
    try {
        const tokenuser = req.user;
        if (tokenuser.Urole != 'Admin') {
            return res.status(403).json({ error: 'You are not authorized to create a new user' })
        }
        // GENRATE TOKEN FOR STAFF USER
        const data = {
            UserName: username,
            Password: password,
            CompanyCode: req.companyCode,
            Role: 'staff'
        }

        const Usertoken = jwt.sign(data, process.env.USER_TOKEN || "usertoken")
        const hashedPassword = await bcrypt.hash(password, 10);

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
        const User = require('../models/User')(
            sequelizeInstance, DataTypes
        )

        const alreadycreated = await User.findOne({ where: { Username: username } })

        if (alreadycreated) {
            return res.status(400).json({ error: 'User already exists or use a new username' })
        }

        if (password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters long' })
        }

        const user = await User.create({
            Username: username,
            Password: hashedPassword,
            AllowField,
            Token: Usertoken,
            Role: "staff"
        })

        // GETTING COMPANY ID
        const compaycode = req.companyCode;
        // const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: compaycode } })
        // ADDING THIS USER TO COMPANYLIST
        const GetCompanyList = await mdl.db1.CompanyList.findOne({ where: { CompanyId: Company.Name } })
        const GetAlluserList = await GetCompanyList.AllUserId
        const UpdataCompanyList = await mdl.db1.CompanyList.update(
            {
                AllUserId: [...GetAlluserList, user.Username]
            },
            {
                where: { CompanyId: Company.Name }
            }
        )
        console.log('Update CompanyList Successfully')
        logger.info(`User created successfully ${user}`)
        res.status(200).json({ success: 'User created successfully', data: user });
    } catch (error) {
        logger.error(`Error while creating User ${error}`)
        res.status(500).json({ error: error });
    }
})



/**
 * @swagger
 * /User/getOneUser:
 *   post:
 *     summary: Create a new user
 *     description: Endpoint to create a new user with a unique username and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User object that needs to be created.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *               companyCode:
 *                 type: string
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 example: securePassword123
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                     password:
 *                       type: string
 *                   required:
 *                     - username
 *                     - password
 *       400:
 *         description: User already exists or use a new username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists or use a new username
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post('/getOneUser', async function (req, res) {
    // COMPANY CODE
    const { username, password, companyCode } = req.body

    try {
        // const user = await mdl.db.User.findOne({ where: { Username: username } })
        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: companyCode } })

        if (!Company) {
            return res.status(404).send({ message: "Company not found" })
        }

        const DbName = Company.dbName
        const connection = await getDbconnection(DbName)

        const UserModel = require('../models/User')
        const User = UserModel(connection, DataTypes)

        const UserIns = await User.findOne({ where: { Username: username } })
        if (!UserIns) {
            return res.status(404).send({ message: "User not found" })
        }

        // CHECK BLACKLISTED OR NOT
        const BLACKLISTED = await mdl.db1.BlackListed.findOne({ where: { BlackToken: UserIns.Token } })

        if (BLACKLISTED) {
            return res.status(401).send({ message: 'Your token is blacklisted.', data: BLACKLISTED })
        }

        const DBuserPassword = await bcrypt.compare(password, UserIns.Password)
        console.log("haash", DBuserPassword)
        if (!DBuserPassword) {
            return res.status(404).send({ message: "Incorrect password" })
        }

        // CREATE JWT TOKEN
        const data = {
            Uname: UserIns.Username,
            Upassword: UserIns.Password,
            compCode: companyCode,
            Urole: UserIns.Role,
            AllowField: UserIns.AllowField
            // COMPANY CODE
        }
        const token = jwt.sign(data, 'key')
        // if (!token) { return console.log('Error signing token') }
        // res.cookie('token', token)

        logger.info(`User login sucessfully USER:${UserIns.Username} COMPANYCODE:${companyCode}`)
        res.status(200).send({ message: "User found", data: UserIns, token: token })
    } catch (error) {
        console.log(error)
        logger.error(`Error while trying to login ERROR:${error}`)
        return res.status(404).send({ message: "Error while getting user", error })
    }

})


/**
 * @swagger
 * /User/getAllUser:
 *   get:
 *     summary: Retrieve all users
 *     tags:
 *       - Users
 *     description: Fetches a list of all users from the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User found
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       username:
 *                         type: string
 *                         example: johndoe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *       404:
 *         description: No users found or error occurred.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No User found
 *                 error:
 *                   type: object
 *                   additionalProperties: true
 */

router.get('/getAllUser', authenticateJWT, async function (req, res) {

    try {

        const CompanyCode = req.companyCode

        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: CompanyCode } })
        const connection = await getDbconnection(Company.dbName)
        if (connection) {
            const UserModel = require('../models/User')
            const User = UserModel(connection, DataTypes)
            const users = await User.findAll()
            logger.info(`All User Found Successfully!`)
            return res.status(200).json({ message: 'User found', data: users })
        }
        logger.error(`All User Found Failure!`)
        res.status(500).send({ message: 'Connection failed' })

    } catch (error) {
        logger.error(`All User Found Fail`)
        return res.status(404).send({ message: "Error while getting user", error })
    }

})



/**
 * @swagger
 * /User/deleteUser/{username}:
 *   delete:
 *     summary: Delete a user by username
 *     description: Deletes a user from the database based on the provided username.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         description: The username of the user to be deleted.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: Username is required.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Username is required
 *       500:
 *         description: Error while deleting user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error while deleting user
 *                 error:
 *                   type: object
 *                   description: The error object
 */


router.delete('/deleteUser/:username', authenticateJWT, async function (req, res) {
    const { username } = req.params
    if (!username) {
        return res.status(400).send({ message: "Username is required" })
    }

    const CompanyCode = req.companyCode

    const Company = await mdl.db.ClientDetail.findOne({ CompanyCode: CompanyCode })
    const connection = await getDbconnection(Company.dbName)

    try {
        if (connection) {
            const UserModel = require('../models/User')
            const User = UserModel(connection, DataTypes)

            await User.destroy({ where: { Username: username } })
            logger.info(`User deleted successfully`)
            res.status(200).send({ message: "User deleted successfully" })
        }
    } catch (error) {
        logger.error(`Error while deleting user ERROR:${error}`)
        return res.send({ message: "Error while deleting user", error })
    }

})


/**
 * @swagger
 * /User/updateUser/{username}:
 *   put:
 *     summary: Update an existing user
 *     description: Updates the username, password, and/or additional fields for an existing user. At least one of the fields (username or password) must be provided to perform the update.
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the user to be updated.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Updateusername:
 *                 type: string
 *                 example: john_doe_updated
 *                 description: New username for the user. If not provided, the existing username will remain unchanged.
 *               Updatepassword:
 *                 type: string
 *                 example: NewP@ssw0rd456
 *                 description: New password for the user. It must be at least 8 characters long. If not provided, the existing password will remain unchanged.
 *               UpdateAllowField:
 *                 type: string
 *                 example: updatedField
 *                 description: Optional field to update additional data associated with the user.
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User updated successfully
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide UpdateUsername or UpdatePassword
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Something is wrong!
 */

router.put('/updateUser/:diffrent', authenticateJWT, async (req, res) => {
    const { username } = req.body
    const { diffrent } = req.params
    const { Updateusername, Updatepassword, UpdateAllowField } = req.body

    if (!Updatepassword && !Updateusername) {
        return res.status(400).send({ message: "Please provide UpdateUsername 0r UpdatePassword" })
    }

    const CompanyCode = req.companyCode

    const Company = await mdl.db1.ClientDetail.findOne({
        where: { CompanyCode: CompanyCode }
    });
    const connection = await getDbconnection(Company.dbName)

    const UserModel = require('../models/User')
    const User = UserModel(connection, DataTypes)
    try {

        const user = User.findOne({ Username: username })
        if (!user) {
            return res.status(404).send({ message: "User not found" })
        }

        const hashedPassword = await bcrypt.hash(Updatepassword, 10);

        await User.update({
            Username: Updateusername,
            Password: diffrent != 'null' ? hashedPassword : Updatepassword,
            AllowField: UpdateAllowField
        }, { where: { Username: username } })

        logger.info(`User updated successfully for username: ${username}`)
        res.status(200).send({ message: "User updated successfully" })
    } catch (error) {
        console.log(error)
        logger.error(`User failed to update password ERROR:${error}`)
        return res.status(500).send({ message: "Something is wrong!" })
    }
})


/**
 * @swagger
 * /getbyusername/{username}:
 *   get:
 *     summary: Create a new user
 *     description: Endpoint to create a new user with a unique username and password.
 *     tags:
 *       - Users
 *     requestBody:
 *       description: User object that needs to be created.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe
 *             required:
 *               - username
 *     responses:
 *       200:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: string
 *                   example: User created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *                   required:
 *                     - username
 *                     - password
 *       400:
 *         description: User already exists or use a new username
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: User already exists or use a new username
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Error details
 */

router.post('/withusername', authenticateJWT, async function (req, res) {
    const { username } = req.body

    try {
        const CompanyCode = req.companyCode

        const Company = await mdl.db1.ClientDetail.findOne({
            where: {
                CompanyCode: CompanyCode
            }
        })
        const connection = await getDbconnection(Company.dbName)

        const UserModel = require('../models/User')
        const User = UserModel(connection, DataTypes)
        const user = await User.findOne({ where: { Username: username } })

        if (!user) return res.status(404).send({
            message: 'User not found'
        })

        logger.info(`User found successfully Username:${username}`)
        return res.status(200).send({ message: "User found", data: user })
    } catch (error) {
        console.log(error)
        logger.error(`Error while trying to find user: ${error}`)
        return res.status(404).send({ message: "Error while getting user", error })
    }

})




router.get('/getbyusername/:username', authenticateJWT, async (req, res) => {
    const { username } = req.params
    try {
        const CompanyCode = req.companyCode

        const Company = await mdl.db1.ClientDetail.findOne({ where: { CompanyCode: CompanyCode } })
        const connection = await getDbconnection(Company.dbName)

        const UserModel = require('../models/User')
        const User = UserModel(connection, DataTypes)

        const user = await User.findOne({ where: { Username: username } })
        if (!user) return res.status(404).send({ message: "User not found!" })

        logger.info(`User Found ${user}`)
        res.status(200).send({ message: "User found!", data: user })
    } catch (error) {
        console.log(error)
        logger.error(`Error while getting user: ${error}`)
        res.status(500).send({ message: "Error while getting user" })
    }
})


module.exports = router;
