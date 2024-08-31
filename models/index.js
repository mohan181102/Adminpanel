const db_cntx = require("../config/index.js");
const Clientdb = require("../config/ClientDBindex.js")
const { Sequelize, DataTypes } = require("sequelize");

class db1_index {
  constructor() {
    this.db = {};
    this.db1 = {};

    this.db.Sequelize = Sequelize;
    this.db.sequelize = db_cntx;
    this.db1.Sequelize = Sequelize;
    this.db1.sequelize = Clientdb;

    this.db1.ClientDetail = require("./ClientDetails.js")(
      this.db1.sequelize,
      this.db1.Sequelize,
      DataTypes
    )

    this.db1.CompanyList = require("./CompanyUserList.js")(
      this.db1.sequelize,
      this.db1.Sequelize,
      DataTypes
    )

    this.db1.BlackListed = require("./BlackListedToken.js")(
      this.db1.sequelize,
      this.db1.Sequelize,
      DataTypes
    )

    this.db.Gallery = require("./gallery.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );
    this.db.Slider = require("./slider.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );
    this.db.NewsNotice = require("./newsandnotice.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );
    this.db.FlashNews = require("./flashnews.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );
    this.db.GeneralSetting = require("./GeneralSetting.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );
    this.db.ProductCategoryMaster = require("./ProductCategoryMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.ProductMaster = require("./ProductMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.AdvertisementMaster = require("./AdvertisementMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.Download = require("./Download.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.Event = require("./Event.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.Testimonial = require("./Testimonial.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.VideoMaster = require("./Videomaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.HPBodyCard = require("./HPBodyCard.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.HPContentMaster = require("./HPContentMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.TCIssued = require("./TCIssued.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.Contact = require("./ContactUs.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    );

    this.db.Results = require("./Result.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.MenuMasters = require("./MenuMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.User = require("./User.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.PriceMasters = require("./PriceMaster.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.Client = require("./Client.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.PageViewMaster = require("./PageViewMaster.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.AcademicMaster = require("./AcademicMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.CourseMaster = require("./CourseMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.Footer = require("./Footer.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.FontAwesome = require("./FontAwesome.model.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.DashboardPage = require("./DashboardPages.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.FrontEndPage = require("./FrontEndPages.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.DashboardCard = require("./DashboardCard.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )

    this.db.HeaderTopMaster = require("./HomePageContentMaster.js")(
      this.db.sequelize,
      this.db.Sequelize,
      DataTypes
    )
  }

  async sync_models() {
    return new Promise((res, rej) => {
      try {
        this.db.sequelize
          .sync()
          .then(() => {
            // console.log("Database & tables created!");
            console.log("Database Synchronized");
            res(true);
          })
          .catch((error) => {
            console.error("Error synchronizing database:", error);
            res(false);
          });
      } catch (ex) {
        console.error(`db1_index sync_models Error :${ex.message}`);
        res(false);
      }
    });
  }
}
module.exports = new db1_index();
