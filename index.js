const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
let Datastore = require("nedb")

let win
let datastore

function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences : {
            nodeIntegration: true,
            contextIsolation: false,
        },
        autoHideMenuBar: true
    })

    win.loadFile(__dirname + '/renderer/index.html')

    win.addListener('ready-to-show', () => {
        win.show()
    })
}

function initDatastore() {
    const dbPath = path.join(app.getPath("userData"), "notes.json");

    datastore = new Datastore({
        filename: dbPath,
        autoload: true
    })

    datastore.loadDatabase((err) => {
        if(err) {
            console.log("There was some error in loading the datastore")
            throw err
        } else {
            console.log("Datastore loaded successfully!")
        }    
    })
}

app.whenReady().then(() => {
    initDatastore()
    createWindow()
})

app.addListener('window-all-closed', () => {
    if (process.platform !== 'darwin'){
        app.quit()
    }  
})

// all ipc calls
ipcMain.on('save_note', (e, note) => {
    datastore.insert(note, (err, new_doc) => {
        if(err) {
            console.log('There was some error in inserting the doc')
            throw err
        }
        console.log('Data inserted successfully', new_doc)
    })
})

ipcMain.handle('get_data', async () => {
    return new Promise((resolve, reject) => {
        datastore.find({}, (err, docs) => {
            if(err){
                reject(err)
            } else {
                resolve(docs)
            }
        })
    })
})

ipcMain.on('delete_note', (e, id) => {
    datastore.remove({ _id: id }, {}, (err, numRemoved) => {
        if (err) {
            console.log('There was an error deleting the note')
            throw err
        }
        console.log(`Deleted ${numRemoved} note(s) successfully`)
    })
})

ipcMain.on('toggle_pin', (e, noteId) => {
    datastore.findOne({ _id: noteId }, (err, note) => {
        if (err || !note) {
            console.log('Error finding note or note not found')
            return;
        }

        const newPinnedStatus = !note.pinned;
        datastore.update({ _id: noteId }, { $set: { pinned: newPinnedStatus, timestamp: Date.now() } }, {}, (updateErr) => {
            if (updateErr) {
                console.log('Error updating pin status')
                throw updateErr;
            }
            console.log(newPinnedStatus ? 'Note pinned successfully' : 'Note unpinned successfully')
            e.sender.send('pin_updated'); // Notify renderer process to refresh
        })
    })
})
