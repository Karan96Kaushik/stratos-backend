const fs = require('fs');
const csv = require('csv-parse/sync');
const mongoose = require('mongoose');
const { Procurements } = require('../models/Procurements');
const { getID, updateID } = require('../models/Utils');
const { Members } = require('../models/Members');
const { Vendors } = require('../models/Vendors');

// Errors
// 1. Hrishikesh Mindhe spelling mistake
// 1. Rutuja Narsingh spelling mistake

let memberIDs = {};


const findMemberID = (name) => {
    return memberIDs[name] || memberIDs[name.replace('   ', '')] || memberIDs[name.replace('  ', '')] || memberIDs[name.replace(' ', '').replace('CA ', '').replace('Adv ', '')] || 'NA';
}

const start = async () => {
    try {

        await mongoose.connect(process.env.dbCreds || 'mongodb://localhost:27017/stratos');

        let members = await Members.find({}).lean().exec();
        members.forEach(member => {
            memberIDs[member.userName.split(' ').join('')] = String(member._id);
        });

        console.log(memberIDs)

        // return

        // Read and parse CSV
        const csvContent = fs.readFileSync('scripts/procurements.csv', 'utf8');
        const records = csv.parse(csvContent, {
            columns: true,
            skip_empty_lines: true
        });

        // Sort records by date
        records.sort((a, b) => new Date(a.Date) - new Date(b.Date));

        // Connect to MongoDB

        // Process each record
        for (const record of records) {
            // Generate procurement ID
            const procurementIdPrefix = "PREQ";
            const procurementID = procurementIdPrefix + await getID(procurementIdPrefix);
            await updateID(procurementIdPrefix);

            // Map CSV fields to procurement fields
            const procurement = {
                procurementID,
                srNo: record['Sr No.'],
                createdTime: new Date(record.Date.split('/').reverse().join('-')),
                // date: new Date(record.Date),
                referenceNo: record['Reference No.'],
                department: record.Department,
                addedByName: addSpaceOnLowerToUpper(record['Procurement Requisition By'].trim().split('+')[0].replace('CA ', '').replace('Adv ', '').replace('   ', ' ').replace('  ', ' ')),
                addedBy: findMemberID(addSpaceOnLowerToUpper(record['Procurement Requisition By'].trim().split('+')[0].replace('CA ', '').replace('Adv ', '').replace('   ', ' ').replace('  ', ' '))) || 'NA',
                approvedByName: record['Procurement Approved By'].trim().split('+').filter(Boolean).map(name => addSpaceOnLowerToUpper(name)),
                _approvers: record['Procurement Approved By'].trim().split('+').filter(Boolean).map(name => findMemberID(name)),
                lastApproverDate: record['Last Approver Date'] ? new Date(record['Last Approver Date'].split('/').reverse().join('-')) : null,
                vendorName: record['Vendor Name'],
                vendorCode: record['Vendor Code'],
                vendorType: record['Vendor Type'],
                productDetails: record['Product Details'],
                billNo: record['Bill No'],
                amount: parseFloat(record.Amount || 0),
                gstamount: parseFloat(record.GST || 0) || 0,
                tdsamount: parseFloat(record.TDS || 0),
                total: parseFloat(record.Total || 0),
                status: record.Status == 'Paid' ? 'Completed' : "Approved",
                paymentReference: record['Payment Type'],
                remarks: [record.Remarks],
                // paymentMonth: record['Payment Month'],
                paymentDate: record['Payment Date'] ? new Date(record['Payment Date'].split('/').reverse().join('-')) : null,
                assetTaggingCode: record['Asset Tagging Code'],
                tat: parseInt(record.Tat || 0),
            };

            if (procurement.addedBy == 'NA' || procurement._approvers.includes('NA')) {
                console.log(procurement, record['Procurement Requisition By'].trim().split('+')[0].replace('CA ', '').replace('Adv ', '').replace('   ', ' ').replace('  ', ' '))
            }

            // console.log(procurement)

            // Create procurement in database
            await Procurements.create(procurement);
            console.log(`Added procurement ${procurementID}`);
        }

        console.log('All procurements added successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

// start();


function addSpaceOnLowerToUpper(str) {
    if (!str) return '';
    
    let result = str[0];
    
    for (let i = 1; i < str.length; i++) {
        const prevChar = str[i - 1];
        const currentChar = str[i];
        
        // Add space only if previous is lowercase and current is uppercase
        if (prevChar === prevChar.toLowerCase() && 
            currentChar === currentChar.toUpperCase()) {
            result += ' ' + currentChar;
        } else {
            result += currentChar;
        }
    }
    
    result = result.trim().split(' ').map(word => word.trim()).filter(Boolean).join(' ');
    if (result.includes('Parth')) {
        console.log(result)
    }
    return result;
}

const vendorTypes = {
    "Office Stationeries" : 
        ["Ambika Stationery & Xerox",
        "Shivam Computer Stationery",
        "Shreya Enterprises & Laxmi Stationery"],
    "Office Keeping" : 
        ["Aadya Enterprises",
        "Raj AC & Refrigeration",
        "Track On- SR International",
        "Asha Enterprises",
        "Riddhi Enterprises",
        "Option Print",
        "Track On- SR International"],
    "Fees": [
        "Ankit Choudhary",
        "PB Associates",
        "Sahil Mahale",
        "Sandeep Gaikwad",
        "Unique Publicity",
        "Vikas Abhang & Associates",
        "M/s Pranav Bhaskaran & Associates",
        "Adv Sahil Parandawal"
    ],
    "IT": [
        "Computer Express",
        "Computer Plus",
        "Croma",
        "Ligionest Technologies Pvt Ltd."
    ],
    "Human Resource": [
        "HR One",
        "KEKA",
        "Info Edge Ltd – Naukri",
        "Your Dost",
        "Work India",
        "Serve HR Pvt Ltd",
        "LinkedIn"
    ]
}

const startVendor = async () => {
    try {
        await mongoose.connect(process.env.dbCreds || 'mongodb://localhost:27017/stratos');

        // console.log(process.env.dbCreds)
        // return 

        // console.log(await Vendors.find({}).lean().exec())

        // return

        let vendors = fs.readFileSync('scripts/vendors.csv', 'utf8');
        vendors = csv.parse(vendors, {
            columns: true,
            skip_empty_lines: true
        });

        

        for (const vendor of vendors) {
            // console.log(vendor.VendorName, vendor.VendorCode)
            const vendorID = await getID('VND');
            const v = {
                addedBy: process.env.NODE_ENV == 'production' ? '667266726672667266726672' : '667266726672667266726672',
                vendorName: vendor.VendorName,
                vendorCode: vendor.VendorCode,
                vendorGroup: Object.keys(vendorTypes).find(key => vendorTypes[key].includes(vendor.VendorName)),
                vendorID: 'VND' + vendorID,
            }
            // console.log(v)
            await Vendors.create(v);
            await updateID('VND');
        }
        

        process.exit(0);

        // console.log(vendors)
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

startVendor();