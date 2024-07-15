import React from 'react'
import { Button } from 'antd';
import intl from 'react-intl-universal';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

export const ExportCSV = ({csvData, fileName}) => {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const exportToCSV = (csvData, fileName) => {
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }

    return (
        <Button onClick={() => exportToCSV(csvData,fileName)}>{intl.get('@GENERAL.EXPORT-AS-EXCEL')}</Button>
    )
}

export function ExportExampleReport (csvSummary, csvData, fileName) {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const ws_summary = XLSX.utils.json_to_sheet(csvSummary);
    const ws_data = XLSX.utils.json_to_sheet(csvData);
    const wb = { Sheets: { 'summary': ws_summary,'data': ws_data }, SheetNames: ['summary','data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);

}

export function ExportReport (csvSummary, csvData, fileName) {

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const ws_summary = XLSX.utils.json_to_sheet(csvSummary);
    const ws_keys = Object.keys(csvData);
    var ws_new = { 'summary': ws_summary };
    ws_keys.forEach((x)=>{
        console.log('ws_keys: ', x);
        let ws_new_data = XLSX.utils.json_to_sheet(csvData[x]);
        ws_new[x] = ws_new_data;
    });
    const wb = { Sheets: ws_new, SheetNames: ['summary'].concat(ws_keys) };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);

}

export function ExportReport2 (csvSummary, csvOverview, csvData, fileName) { // TODO: add csvOverview

    var header = [
        "Institution", "Rank", "Staff Strength", "No. of Staff Login","No. of Staff without Login", "No. of Staff with Mobile App Log In", "Mobile App Login","Intranet Login", "Internet Login", "Total Login", "Total Hit Rate", "Login Percentage", "Login per Staff Strength"
    ];

    var header2 = [
        "Institution", "Rank", "Full Name", "Staff No", "Mobile App Login", "Intranet Login", "Internet Login", "Total Login", "Total Hit Rate"
    ];

    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';
    const ws_summary = XLSX.utils.json_to_sheet(csvSummary);

    var ws_summary_cols = [
        { wch: 18 },
        { wch: 29 }
    ];

    ws_summary["!cols"] = ws_summary_cols;
    const ws_overview = XLSX.utils.json_to_sheet(csvOverview); // TODO: new line

    var range = XLSX.utils.decode_range(ws_overview['!ref']);
    var count = 0;
    for(var C = range.s.c; C <= range.e.c; ++C) {
        var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
        if(!ws_overview[address]) continue;
        ws_overview[address].v = header[count++];
    }
    
    var objectMaxLength = []; 
    for (var i = 0; i < csvOverview.length; i++) {
      var value = Object.values(csvOverview[i]);
      for (var j = 0; j < value.length; j++) {
        if (typeof value[j] == "number") {
          objectMaxLength[j] = header[j].length;
        } else {
          objectMaxLength[j] =
            objectMaxLength[j] >= value[j].length
              ? objectMaxLength[j]
              : value[j].length + 1;
        }
      }

      for (var k = 0; k < objectMaxLength.length; k++){
          objectMaxLength[k] = 
            objectMaxLength[k] >= header[k].length
              ? objectMaxLength[k]
              : header[k].length
      }
    }

    var ws_overview_cols = [
        { wch: objectMaxLength[0] }, 
        { wch: objectMaxLength[1] }, 
        { wch: objectMaxLength[2] }, 
        { wch: objectMaxLength[3] }, 
        { wch: objectMaxLength[4] },
        { wch: objectMaxLength[5] }, 
        { wch: objectMaxLength[6] }, 
        { wch: objectMaxLength[7] }, 
        { wch: objectMaxLength[8] },
        { wch: objectMaxLength[9] },
        { wch: objectMaxLength[10] },
        { wch: objectMaxLength[11] },
        { wch: objectMaxLength[12] }
    ];

    ws_overview["!cols"] = ws_overview_cols;

    const ws_keys = Object.keys(csvData).sort(); // TODO: add .sort()
    var ws_new = { 'summary': ws_summary, 'overview': ws_overview }; // TODO: add 'overview': ws_overview
    console.log("Export csv = "+ JSON.stringify(ws_summary));
    ws_keys.forEach((x)=>{
        console.log('ws_keys: ', x);
        let ws_new_data = XLSX.utils.json_to_sheet(csvData[x]);
        var range2 = XLSX.utils.decode_range(ws_new_data['!ref']);
        console.log('Range 2 = ',range2);
        var count2 = 0;

        for(var C = range2.s.c; C <= range2.e.c; ++C) {
            var address = XLSX.utils.encode_col(C) + "1"; // <-- first row, column number C
            if(!ws_new_data[address]) continue;
            ws_new_data[address].v = header2[count++];
            ws_new_data[address].v =header2[C];
        }


        objectMaxLength = []; 
        for (var i = 0; i < csvData[x].length; i++) {
            var value = Object.values(csvData[x][i]);
            var key = Object.keys(csvData[x][i]);
            for (var j = 0; j < value.length; j++) {
                if (typeof value[j] == "number") {
                    objectMaxLength[j] = 15;
                  } else {
                    objectMaxLength[j] =
                        objectMaxLength[j] >= value[j].length
                        ? objectMaxLength[j] >= key[j].length
                        ? objectMaxLength[j]
                        : key[j].length
                        : value[j].length + 1;
                  }
            }
            // for (var k = 0; k < objectMaxLength.length; k++){
            //     objectMaxLength[k] = 
            //       objectMaxLength[k] >= header2[k].length
            //         ? objectMaxLength[k]
            //         : header2[k].length
            // }
        }
        
        objectMaxLength[2] += Math.floor(objectMaxLength[2] / 20);

        var ws_new_data_cols = [
            { wch: objectMaxLength[0] }, 
            { wch: objectMaxLength[1] }, 
            { wch: objectMaxLength[2] }, 
            { wch: objectMaxLength[3] }, 
            { wch: objectMaxLength[4] },
            { wch: objectMaxLength[5] }, 
            { wch: objectMaxLength[6] }, 
            { wch: objectMaxLength[7] },
            { wch: objectMaxLength[8] }
        ];

        ws_new_data["!cols"] = ws_new_data_cols;

        ws_new[x] = ws_new_data;
    });
    const wb = { Sheets: ws_new, SheetNames: ['summary','overview'].concat(ws_keys) }; // TODO: add 'overview'
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    FileSaver.saveAs(data, fileName + fileExtension);
}
