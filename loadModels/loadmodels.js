const path = require("path");
const fs = require("fs");
const { Sequelize } = require("sequelize");

// Function to load models
const loadModels = (sequelize, DataTypes) => {
    return {
        Users: require("../models/User.js")(sequelize, Sequelize, DataTypes),
        DashboardCard: require("../models/DashboardCard.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        AdvertismentMaster: require("../models/AdvertisementMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        HPContentMaster: require("../models/HPContentMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Client: require("../models/Client.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        ContactUs: require("../models/ContactUs.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        CourseMaster: require("../models/CourseMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        DashboardPages: require("../models/DashboardPages.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Download: require("../models/Download.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Event: require("../models/Event.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Flashnews: require("../models/flashnews.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        FontAwesomeModel: require("../models/FontAwesome.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        FooteModel: require("../models/Footer.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        FrontEndPage: require("../models/FrontEndPages.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        GalleryModel: require("../models/gallery.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        GenralSetting: require("../models/GeneralSetting.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        HomePageContentMaster: require("../models/HomePageContentMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        HomepageBodyCard: require("../models/HPBodyCard.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        MenuMaster: require("../models/MenuMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        NewsAndNotice: require("../models/newsandnotice.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        PageViewMaster: require("../models/PageViewMaster.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        PriceMasterModel: require("../models/PriceMaster.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        ProductCategoryMaster: require("../models/ProductCategoryMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        ProductMaster: require("../models/ProductMaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Result: require("../models/Result.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Slider: require("../models/slider.model.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        TCIssued: require("../models/TCIssued.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        Testimonials: require("../models/Testimonial.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        VideoMAster: require("../models/Videomaster.js")(
            sequelize,
            Sequelize,
            DataTypes
        ),
        AcademicMaster: require('../models/AcademicMaster.js')(
            sequelize,
            Sequelize,
            DataTypes
        )

    };
};

module.exports = { loadModels };
