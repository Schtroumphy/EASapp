import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { createConnection } from 'typeorm';
import { Item } from './../EASapp/src/app/core/models/item.schema';
import { Driver } from './../EASapp/src/app/core/models/driver.schema';
import { Patient } from './../EASapp/src/app/core/models/patient.schema';

let win: BrowserWindow = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

async function createWindow(): Promise<BrowserWindow> {

  const connection = await createConnection({
    type: 'sqlite',
    synchronize: true,
    logging: true,
    logger: 'simple-console',
    database: './src/assets/data/database.sqlite',
    entities: [ Item, Driver, Patient],
  });

  const itemRepo = connection.getRepository(Item);
  const driverRepo = connection.getRepository(Driver);
  const patientRepo = connection.getRepository(Patient);

  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve) ? true : false,
      contextIsolation: false,  // false if you want to run 2e2 test with Spectron
      enableRemoteModule : true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
    },
  });
  win.webContents.openDevTools();

  if (serve) {

    win.webContents.openDevTools();

    require('electron-reload')(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL('http://localhost:4200');

  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'dist/index.html'),
      protocol: 'file:',
      slashes: true
    }));
  }

  ipcMain.on('get-drivers', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await driverRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-patients', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await patientRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-items', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await itemRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-item', async (event: any, _item: Item) => {
    try {
      const item = await itemRepo.create(_item);
      await itemRepo.save(item);
      event.returnValue = await itemRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-driver', async (event: any, _driver: Driver) => {
    try {
      const item = await driverRepo.create(_driver);
      await driverRepo.save(item);
      event.returnValue = await driverRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-patient', async (event: any, _patient: Patient) => {
    try {
      const item = await patientRepo.create(_patient);
      await patientRepo.save(item);
      event.returnValue = await patientRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-item', async (event: any, _item: Item) => {
    try {
      const item = await itemRepo.create(_item);
      await itemRepo.remove(item);
      event.returnValue = await itemRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-driver', async (event: any, _driver: Driver) => {
    try {
      const item = await driverRepo.create(_driver);
      await driverRepo.remove(item);
      event.returnValue = await driverRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-patient', async (event: any, _patient: Patient) => {
    try {
      const item = await patientRepo.create(_patient);
      await patientRepo.remove(item);
      event.returnValue = await patientRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('update-driver', async (event: any, _driver: Driver) => {
    
    try {
      let driverToUpdate = await driverRepo.findOne(_driver.id);
      driverToUpdate.firstname = _driver.firstname;
      driverToUpdate.lastname = _driver.lastname;
      driverToUpdate.email = _driver.email;
      driverToUpdate.phoneNumber = _driver.phoneNumber;
      await driverRepo.save(driverToUpdate);
      event.returnValue = await driverRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('update-patient', async (event: any, _patient: Patient) => {
    
    try {
      let patientToUpdate = await patientRepo.findOne(_patient.id);
      patientToUpdate.firstname = _patient.firstname;
      patientToUpdate.lastname = _patient.lastname;
      patientToUpdate.email = _patient.email;
      patientToUpdate.phoneNumber = _patient.phoneNumber;
      patientToUpdate.address = _patient.address;
      await patientRepo.save(patientToUpdate);
      event.returnValue = await patientRepo.find();
    } catch (err) {
      throw err;
    }
  });

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });

} catch (e) {
  // Catch Error
  // throw e;
}
