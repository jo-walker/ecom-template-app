const { Datatypes } = require('sequelize');
const sequelize = require('../config/database');
const { calculateLuhnChecksum, validateSKU } = require('../utils/skuUtils');

const Product = sequelize.define('Product', {
    code:{
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true, // as the primary key
    },
    SKU: {  
        type: DataTypes.STRING, // should support all standards (UPC, EAN, ISBN, etc)
        unique: true, // SKU is unique, but not the primary key
    },
    description:{
        type: Datatypes.JSON,
    },
    vendor:{
        type: Datatypes.JSON,
    },
    selling_price:{
        type: Datatypes.JSON, //retail, wholesale, holidays, clearance
    },
    buying_price:{ 
        type: Datatypes.JSON, // distributor, factory
    },
    stock:{
        type: Datatypes.JSON, // quantity, reserved, available
    },
    size:{
        type: Datatypes.JSON, // width, height, depth, weight
    },
    linked_pictures:{
        type: Datatypes.JSON,
    },
    history:{
        type: Datatypes.JSON, // date, action, user
    },  
    status:{
        type: Datatypes.STRING,
    },
}, {
    timestamps: false, // disable timestamps because we have history
    hooks: {// hooks are functions that are called before or after a certain event
        beforeCreate: (product) => {
            if (!validateSKU(product.SKU)) {// validateSKU is a function that checks if the SKU is valid
                const baseSku = product.SKU.slice(0, product.SKU.length - 1);// remove the last digit
                const checksum = calculateLuhnChecksum(baseSku);// calculate the checksum
                product.SKU = baseSku + checksum;// add the checksum to the SKU
            }
        },
        beforeUpdate: (product) => {
            if (!validateSKU(product.SKU)) {
                const baseSku = product.SKU.slice(0, product.SKU.length - 1);
                const checksum = calculateLuhnChecksum(baseSku);
                product.SKU = baseSku + checksum;
            }
        }
    }
});

module.exports = Product;