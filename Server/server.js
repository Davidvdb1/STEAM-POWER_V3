import express from 'express';
import livereload from "livereload";
import connectLiveReload from 'connect-livereload'
import { join } from 'path';
import __dirname from "./modules/__dirname.js"

const livereloadServer = livereload.createServer();
livereloadServer.watch(join(__dirname, '..', 'Frontend'));
livereloadServer.server.once('connection', () => {
    setTimeout(() => {
        livereloadServer.refresh("/")
    }, 100);
})

const PORT = process.env.PORT || 2023;
const APP = express();

APP.use(connectLiveReload()) //! HAS TO BE BEFORE THE STATIC PAGES

//#region WEB SERVER
APP.use("/", express.static(join(__dirname, '..', 'Frontend')));
//#endregion

/* ---ACTIVATE MIDDLEWARE--- */

APP.listen(PORT, () => {
    console.log(`App running @ http://localhost:${PORT}`);
});