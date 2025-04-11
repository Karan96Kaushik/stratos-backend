module.exports = {
    all: {
        texts: [
            {label:'Date', id:"createdTime", type:"date"},
            {label:'Procurement ID', id:"procurementID"},
            {label:'Sr No.', id:"srNo"},
            // {label:'Date', id:"date", type:"date"},
            {label:'Reference No.', id:"referenceNo"},
            {label:'Department', id:"department"},
            {label:'Procurement Requisition By', id:"procurementRequisitionBy"},
            {label:'Procurement Approved By', id:"procurementApprovedBy"},
            {label:'Last Approver Date', id:"lastApproverDate"},
            {label:'Vendor Name', id:"vendorName"},
            {label:'Vendor Code', id:"vendorCode"},
            {label:'Vendor Type', id:"vendorType"},
            {label:'Product Details', id:"productDetails"},
            {label:'Bill No', id:"billNo"},
            {label:'Amount', id:"amount", type: 'number'},
            {label:'GST Amount', id:"gstamount", type: 'number'},
            {label:'TDS Amount', id:"tdsamount", type: 'number'},
            // {label:'Total', id:"total", type: 'number'},
            {label:'Status', id:"status"},
            {label:'Payment Type', id:"paymentType"},
            {label:'Remarks', id:"remarks"},
            // {label:'Payment Month', id:"paymentMonth", },
            {label:'Paid Amount', id:"paidAmount", type: 'number'},
            {label:'Payment Reference', id:"paymentReference"},
            {label:'Payment Date', id:"paymentDate", type:"date"},
            {label:'Asset Tagging Code', id:"assetTaggingCode"},
            {label:'Tat', id:"tat"},
        ],
        checkboxes: [
            {label:"Archived", id:"archived"},
        ]
    }
}
// export {services, yearlyServices, otherServices, clientSourceOptions}