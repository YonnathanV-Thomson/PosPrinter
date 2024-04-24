const { jsPDF } = require('jspdf');
const { print } = process.platform === 'win32' ? require('pdf-to-printer') : require('unix-print')
const bwipjs = require('bwip-js')

function codify(str, displacement) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        let char = str[i];
        if (char.match(/[0-9]/)) {
        let number = parseInt(char);
        number = (number + displacement) % 10;
        if (number < 0) {
            number = 10 + number;
        }
        result += number.toString();
        } else {
        result += char;
        }
    }

    return result;
}

const generateCode = async({doc, text, x, y, h, w}) => {
    const opts = {
        bcid: 'qrcode', 
        text, 
        scale: 2,
        includetext: true,
    };
   
    const code = await bwipjs.toBuffer(opts)

    const pageHeight = doc.internal.pageSize.getHeight()

    y = (pageHeight - h) /2
    doc.addImage({imageData: code, format: 'PNG', x, y, w, h})
}

const addText = ({doc, text, fontSize, x, y}) => {
    doc.setFontSize(fontSize)

    doc.text(text, x, y, {maxWidth: 1.5});
}

const templateLabel = (doc, selectedDate) => {
    addText({
        doc,
        text: 'Nombre: ',
        fontSize: 8,
        x: 1, 
        y: 0.2,
    });
    addText({
        doc,
        text: 'Firma de cierre:',
        fontSize: 8,
        x: 1,
        y: 0.5
    })
    addText({
        doc,
        text: 'Area: ',
        fontSize: 8,
        x: 1,
        y: 0.65
    });

    addText({
        doc,
        text: 'Reporta a: ' ,
        fontSize: 8,
        x: 1,
        y: 0.9
    });

    addText({
        doc,
        text: 'Fecha de compromiso:' ,
        fontSize: 8,
        x: 1,
        y: 1.2
    });
    addText({
        doc,
        text: 'Fecha de llenado:',
        fontSize: 7,
        x: 0.1,
        y: 0.2
    });
    addText({
        doc,
        text: selectedDate,
        fontSize: 8,
        x: 0.2,
        y: 0.3
    })
}

const getString = (currentDate) => {
    const year = currentDate.getFullYear().toString().slice(-2); 
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hour = currentDate.getHours().toString();
    const minutes = currentDate.getMinutes().toString();
    const seconds = currentDate.getSeconds().toString().slice(-1);
    const miliseconds = currentDate.getMilliseconds().toString().slice(-2);

    let result = currentDate.valueOf().toString();
    result = result.split('');

    const numbers = result.sort((a, b) => a - b).filter(a => a != 0); 
    const twoShorter = (parseInt(numbers[0]) + parseInt(numbers[1])).toString();

    return currentDate.valueOf().toString() + twoShorter;
}

const manageData = (associates, copies) => {
    arrayCopied = [];

    for (let i = 1; i <= Number(copies); i++) {
        arrayCopied.push(...associates);
    }

    arrayCopied.sort((a, b) => a.ASSOCIATE_NUMBER - b.ASSOCIATE_NUMBER);

    return arrayCopied;
}

exports.printLabels = async ({toPrintData, selectedDate, copies}) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "in",
        format: [2.5, 1.5]
    });
    
    for(const associate of manageData(toPrintData, copies)){
        templateLabel(doc, selectedDate);
        const date = new Date();
        const codifedText = codify(getString(date), 3);
        await generateCode({
            doc,
            text: `<an:${associate.ASSOCIATE_NUMBER}:an><ci:${codifedText}:ci>`, 
            x: 0.1, 
            h: 0.75, 
            w: 0.75, 
            angle: 0
        });
        
        addText({
            doc,
            text: associate.ASSOCIATE_NAME,
            fontSize: 7,
            x: 1.1, 
            y: 0.3,
        });
    
        addText({
            doc,
            text: associate.PL,
            fontSize: 7,
            x: 1.1,
            y: 0.75
        });
            
        addText({
            doc,
            text: associate.REPORT_TO,
            fontSize: 7,
            x: 1.1,
            y: 1
        });

        addText({
            doc,
            text: 'Id: ' + codifedText,
            fontSize: 7,
            x: .08,
            y: 1.25
        });

        addText({
            doc,
            text: 'Numero: ' + associate.ASSOCIATE_NUMBER,
            fontSize: 7,
            x: .2,
            y: 1.4
        });

        doc.addPage();
    }

    doc.save("test.pdf");
    await process.platform === 'win32' 
    ?  print("test.pdf", { printer: 'ZP450', orientation: 'landscape', scale:'noscale', copies:1 })
    :  print("test.pdf", 'ZP450', ["-o orientation-requested=4", `-n 1`] );
};
