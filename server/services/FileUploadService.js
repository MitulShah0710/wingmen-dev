const multer = require('multer');
const productUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/product')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const categoryUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/category')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const brandUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/brand')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const userUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/user')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const subCategoryUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/subCategory')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const driverDocumentUpload = multer.diskStorage({

  destination: function (req, file, cb) {

    cb(null, 'server/uploads/driverDocument')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const bannerUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/banner')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const driverUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/driver')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const driverJobCompletedUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/driverJobCompleted')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});
const vehicleUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/vehicle')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});

const serviceTypeUpload = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'server/uploads/serviceType')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + `.${file.originalname.split('.').pop()}`)
  }
});

const product = multer({ storage: productUpload });
const category = multer({ storage: categoryUpload });
const brand = multer({ storage: brandUpload });
const user = multer({ storage: userUpload });
const subCategory = multer({ storage: subCategoryUpload });
const driverDocument = multer({ storage: driverDocumentUpload });
const banner = multer({ storage: bannerUpload });
const driver = multer({ storage: driverUpload });
const driverJob = multer({ storage: driverJobCompletedUpload });
const vehicle = multer({ storage: vehicleUpload });
const serviceType = multer({ storage: serviceTypeUpload });
module.exports = {
  product: product,
  category: category,
  brand: brand,
  user: user,
  subCategory: subCategory,
  driverDocument: driverDocument,
  banner: banner,
  driver: driver,
  driverJob,
  vehicle: vehicle,
  serviceType: serviceType
};
