const { jsPDF } = require('jspdf');
const { print } = process.platform === 'win32' ? require('pdf-to-printer') : require('unix-print')
const bwipjs = require('bwip-js');


const generateCode = async({doc, bcid, text, x, y, h, w}) => {
    const opts = {
        bcid, 
        text, 
        scale: 1,
        includetext: false,
    };
   
    const code = await bwipjs.toBuffer(opts)
    doc.addImage({imageData: code, format: 'PNG', x, y, w, h})
}

const addText = ({doc, text, fontSize, x, y, maxWidth, fontType}) => {
    doc.setFontSize(fontSize);
    doc.setFont(undefined, fontType === undefined ? 'normal' : fontType);

    doc.text(text, x, y, {maxWidth: maxWidth});
}

const firstPageTemplate = (doc) => {
    addText({
        doc, 
        text: 'Supplier:',
        fontSize: 7,
        x: 0.0625,
        y: 0.875,
        fontType:'bold'
    });
    
    addText({
        doc, 
        text: 'Lead time:',
        fontSize: 7,
        x: 0.0625,
        y: 1.1,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'Order Qty:',
        fontSize: 7,
        x: 1,
        y: 1.1,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'Kanban Qty:',
        fontSize: 7,
        x: 2,
        y: 1.1,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'Daily Usage:',
        fontSize: 7,
        x: 0.0625,
        y: 1.4,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'Location:',
        fontSize: 7,
        x: 1,
        y: 1.4,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'Safety stock:',
        fontSize: 7,
        max: 1,
        x: 2,
        y: 1.4,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'UOM:',
        fontSize: 7,
        max: 1,
        x: 0.0625,
        y: 1.7,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'ABC Class:',
        fontSize: 7,
        x: 1,
        y: 1.7,
        fontType:'bold'
    });
    addText({
        doc, 
        text: 'No.cards:',
        fontSize: 7,
        x: 2,
        y: 1.7,
        fontType:'bold'
    });
}

exports.printLabels = async ({toPrintData}) => {
    const doc = new jsPDF({
        orientation: "landscape",
        unit: "in",
        format: [3 , 2]
    });

    for(const label of toPrintData){
        if(doc.internal.getCurrentPageInfo().pageNumber != 1) doc.addPage(); 
        firstPageTemplate(doc);
        const date = new Date();
        const fecha = new Date(label.kanbanCardUpdateAt);
        const dia = fecha.getDate();
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();
        const fechaFormateada = `${mes}/${dia}/${anio}`;

        addText({
            doc,
            text: `Print date: ${date.toLocaleDateString()} - Update at: ${fechaFormateada}`,
            fontSize: 6,
            x: 0.0625,
            y: 0.25,
        });

        addText({
            doc,
            text: `${label.kanbanCardNo}`,
            fontSize: 8,
            x: 2.5,
            y: 0.25
        });

        addText({
            doc,
            text: `${label.item}`,
            fontSize: 10,
            x: 0.0625,
            y: 0.5,
            maxWidth: 2.8
        });

        addText({
            doc,
            text: `${label.description === null ? '' : label.description}`,
            fontSize: 7,
            x: 0.0625,
            y: 0.65,
            maxWidth: 2.8
        });

        addText({
            doc,
            text: `${label.supplierCategory}`,
            fontSize: 7,
            x: 0.0625,
            y: 0.97,
            maxWidth: 2.8
        });

        addText({
            doc,
            text: `${label.kanbanLeadTime}`,
            fontSize: 7,
            x: 0.0625,
            y: 1.2
        });

        addText({
            doc,
            text: `${label.reorderQty}`,
            fontSize: 7,
            x: 1,
            y: 1.2
        });

        addText({
            doc,
            text: `${label.kanbanQty}`,
            fontSize: 7,
            x: 2,
            y: 1.2
        });

        addText({
            doc,
            text: `${label.dailyUsage}`,
            fontSize: 7,
            x: 0.0625,
            y: 1.5
        });

        addText({
            doc,
            text: `${label.itemLocation === null ? '' : label.itemLocation}`,
            fontSize: 7,
            x: 1,
            y: 1.5
        });

        addText({
            doc,
            text: `${label.safetyStock}`,
            fontSize: 7,
            x: 2,
            y: 1.5
        });

        addText({
            doc,
            text: `${label.uom}`,
            fontSize: 7,
            x: 0.0625,
            y: 1.8
        });

        addText({
            doc,
            text: `${label.kanbanClass}`,
            fontSize: 7,
            x: 1,
            y: 1.8
        });

        addText({
            doc,
            text: `${label.cardQty}`,
            fontSize: 7,
            x: 2,
            y: 1.8
        });

        
        doc.addPage();
        await generateCode({
            doc,
            bcid: 'code39',
            text: `${label.kanbanCardNo}`,
            h: 0.25,
            w: 2.5,
            x: 0.25,
            y: 1.25,
        });
    };


    doc.save("test1.pdf");
    await process.platform === 'win32' 
    ?  print("test1.pdf", { printer: 'ZDesigner ZD421-203dpi ZPL (Copy 1)', orientation: 'landscape', scale:'fit', copies:1, side:'duplex' })
    :  print("test1.pdf", 'Evolis Primacy 2', ["-o orientation-requested=4", `-n 1`] );
};