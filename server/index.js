import express from 'express';

const port = process.env.PORT || 3000;

const progress = [];

const app = express();
app.use('/fontawesome', express.static('node_modules/@fortawesome/fontawesome-free/css'));
app.use('/webfonts', express.static('node_modules/@fortawesome/fontawesome-free/webfonts'));
app.use('/', express.static('client'))


app.get('/api/progress', (req, res) => {
    res.send(JSON.stringify(progress));
    progress = [];
})

app.post('/api/progress', (req, res) => {
    console.log(req.body);
    const measureData = JSON.parse(req.body);
    progress.push(measureData);
    res.send(JSON.stringify(progress));
})

app.listen(port, () => {
    console.log(`listening on ${port}`);
})
