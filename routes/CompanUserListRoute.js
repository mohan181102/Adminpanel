const express = require("express");
const router = express.Router();
const mdl = require("../models");
const path = require("path");
const fs = require("fs");
const upload = require("../utils/upload");
const { where, DataTypes } = require("sequelize");
const logger = require("../utils/logger");
const getDbconnection = require("../DbConnection/CdConnection");
const authenticateJWT = require("../utils/JWTauth");


router.post("/create", async(req, res)=>{
    try {
        // FIND ALL COMPANY
        const AllCompany = await mdl.db1.ClientDetail.findAll();
        console.log(AllCompany)

        // 
    } catch (error) {
        logger.error(`Error in CompanyList: ${error.message}`);
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
})

module.exports = router