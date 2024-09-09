const path = require('path');
const { engine } = require('express-handlebars');
const express = require('express');
const axios = require('axios');
const printer = require('./src/modules/printer');
const kanbanPrinter = require('./src/modules/kanbanPrinter');

const app = express();

app.use(express.static('public'));
app.use(express.json());
app.set('view engine', 'hbs');
app.set('json spaces', 40);
app.engine("hbs", engine({ extname: "hbs", layoutsDir: "./views/", partialsDir  : [
    //  path to your partials
    path.join('./views/'),
    path.join('./views/viewComponents/'),
    path.join('./views/pos/'),
    path.join('./views/kanban/'),
]}));

app.get('/', (req, res) => {
    res.render('main',{ layout: 'main' });
});

app.post('/printLabels', async (req, res) => {
    printer.printLabels(req.body).then(() => {
        res.status(200).send(JSON.stringify({
            message: 'Labels has printed',
            isSuccess: true
        }));
    }).catch((err) => {
        console.log(err);
        res.status(500).send(JSON.stringify({
            message: err,
            isSuccess: false,
        }))
    })
    
});

app.post('/printKanban', async (req, res) => {
    kanbanPrinter.printLabels(req.body).then(() => {
        res.status(200).send(JSON.stringify({
            message: 'Labels has printed',
            isSuccess: true
        }));
    }).catch((err) => {
        console.log(err);
        res.status(500).send(JSON.stringify({
            message: err,
            isSuccess: false,
        }))
    })
    
});

app.get('/getAssociates', async (req, res) => {
    let requestOptions = {
        method: 'post',
        url: 'http://ptg-tijapp3/CHRONOS/T03/AJAX/WsAssociates.asmx/GetAssociates',
        headers: { "Content-Type" : "application/json;" },
        timeout: 5000,
    }
    const r = { code: 500, data: null };
    await axios(requestOptions).then((resp) => {
        r.code = 200;
        r.data = resp.data.d.data;
    }).catch((err) => {
        console.log(err);
        res.send(err);
    })
    res.send(r);
});

app.get('/getKanban', async (req, res) => {
    let requestOptions = {
        method: 'get',
        url: 'http://ptg-tijapp3/Chronos/IKANBAN/Home/Purchased',
        headers: { "Content-Type" : "application/json;" },
        timeout: 5000,
    }
    await axios(requestOptions).then((resp) => {
        res.send(resp.data);
    }).catch((err) => {
        res.send(err);
    })
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log('Server begin in port:', PORT);
});
