const excel = require('exceljs');

const generateExcel = async (data, fields, name) => {
	const workbook = new excel.Workbook();
	const sheet    = workbook.addWorksheet('Sheet1');
	let columns = [];

	fields.texts.forEach(val => {
		columns.push({header: val.label, key: val.id})
	})
	fields.checkboxes.forEach(val => {
		columns.push({header: val.label, key: val.id})
	})

	sheet.columns = columns

	for (var i = 0; i < data.length; i++) {
		sheet.addRow(data[i])
	}

	await workbook.xlsx.writeFile("/tmp/" + name + ".xlsx");

	// console.log("/tmp/" + name + ".xlsx")

	return (name + ".xlsx")

}

module.exports = {generateExcel}