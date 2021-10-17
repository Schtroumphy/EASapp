import { app, BrowserWindow, screen, ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import { Between, createConnection, getConnectionManager } from 'typeorm';
import { Authentification } from './src/app/core/models/auth.schema.js';
import { Driver } from './src/app/core/models/driver.schema.js';
import { Patient } from './src/app/core/models/patient.schema.js';
import { Evenement } from './src/app/core/models/evenement.schema.js';
import { Place } from './src/app/core/models/place.schema.js';
import { Absence } from './src/app/core/models/absence.schema.js';

const log = require('electron-log');

let win: BrowserWindow = null;
let authRepo = null
let eventRepo = null
let driverRepo = null
let patientRepo = null
let placeRepo = null
let absenceRepo = null
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');

async function createWindow(): Promise<BrowserWindow> {

  console.log("DIRNAME : " + __dirname)
  var connection = null
  try {
     connection = await createConnection({
      name: "connection",
      type: 'sqlite',
      synchronize: false,
      logging: 'all',
      logger: 'advanced-console',
      // TODO if dev src else dist
      database: './dist/assets/data/database.sqlite',
      entities: [Authentification, Evenement, Driver, Patient, Place, Absence],
    
      // migrations: [
      //   "../src/migration/*{.ts,.js}"
      // ],
      // cli: {
      //   migrationsDir: "../src/migration"
      // },
      // migrationsRun: true,
    })
    log.info("DATABASE CONNECTION OK")
  } catch (e) {
    log.warn('[EXCEPTION WHILE TERMINATING APPLICATION CONTEXT]', e);
    console.log('[EXCEPTION WHILE TERMINATING APPLICATION CONTEXT]', e);
     // If AlreadyHasActiveConnectionError occurs, return already existing connection
     if (e.name === "AlreadyHasActiveConnectionError") {
      const existentConn = getConnectionManager().get("connection");
      connection = existentConn;
   }
  }

  try {
    await connection.query('PRAGMA foreign_keys=OFF');
    await connection.synchronize();
    await connection.query('PRAGMA foreign_keys=ON');
 
    authRepo = connection.getRepository(Authentification);
    eventRepo = connection.getRepository(Evenement);
    driverRepo = connection.getRepository(Driver);
    patientRepo = connection.getRepository(Patient);
    placeRepo = connection.getRepository(Place);
    absenceRepo = connection.getRepository(Absence);
  } catch (e){
    console.log("EXCEPTION : ", e)
    log.warn("EXCEPTION : ", e.json)
  }

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
      enableRemoteModule: true // true if you want to run 2e2 test  with Spectron or use remote module in renderer context (ie. Angular)
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


  // -------------------------- AUTHENTIFICATION --------------------------
  ipcMain.on('get-all-auth', async (event: any) => {
    try {
      event.returnValue = await authRepo.find();

    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-auth-by-identifiant', async (event: any, _identifiant: string) => {
    try {
      event.returnValue = await authRepo.findOne({ where: { identifiant: _identifiant } });

    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-authentification', async (event: any, _authentification : Authentification) => {
    try {
      const item = await authRepo.create(_authentification);
      await authRepo.save(item);
      event.returnValue = await authRepo.find();
    } catch (err) {
      throw err;
    }
  });

  // -------------------------- DRIVER --------------------------
  ipcMain.on('add-driver', async (event: any, _driver: Driver) => {
    try {
      const item = await driverRepo.create(_driver);
      await driverRepo.save(item);
      event.returnValue = await driverRepo.find();
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
      driverToUpdate.comment = _driver.comment;
      driverToUpdate.color = _driver.color;
      driverToUpdate.absences = _driver.absences;
      driverToUpdate.evenements = _driver.evenements;
      await driverRepo.save(driverToUpdate);
      event.returnValue = await driverRepo.find();
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

  ipcMain.on('get-drivers', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await driverRepo.find({
        relations: ['absences']
      })
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-driver-by-id', async (event: any, _driverId: number) => {
    try {
      event.returnValue = await driverRepo.findOne({ where: { id: _driverId } });

    } catch (err) {
      throw err;
    }
  });

  // -------------------------- ABSENCES --------------------------

  ipcMain.on('get-all-absences', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await absenceRepo.find({
        relations: ['driver']
      })
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-absence', async (event: any, _absence: Absence) => {
    try {
      const absence = new Absence( _absence.startDate,  _absence.endDate, _absence.reason);
      absence.driver = _absence.driver;
      //absence.reason = _absence.reason;
      //absence.driverId = _absence.driver.id
      await absenceRepo.save(absence);

      event.returnValue = await absenceRepo.find({
        relations: ['driver'], where: {
          driver: {
            id: _absence.driver.id
          }
        }
      });
    } catch (err) {
      throw err;
    }
  });

  // -------------------------- EVENT --------------------------

  ipcMain.on('add-event', async (event: any, _evenement: Evenement) => {
    try {
      const evenement = new Evenement();
      evenement.title = _evenement.title;
      evenement.date = _evenement.date;
      evenement.startPoint = _evenement.startPoint;
      evenement.startHour = _evenement.startHour;
      evenement.endPoint = _evenement.endPoint;
      evenement.endHour = _evenement.endHour;
      evenement.patient = _evenement.patient;
      evenement.driver = _evenement.driver;
      await eventRepo.save(evenement);

      //const item = await eventRepo.create(_evenement);
      //await eventRepo.save(item);
      event.returnValue = await eventRepo.find({
        relations: ['driver', 'patient', 'startPoint', 'endPoint'],
      });
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-event-and-get-id', async (event: any, _evenement: Evenement) => {
    try {
      const evenement = new Evenement();
      evenement.title = _evenement.title;
      evenement.date = _evenement.date;
      evenement.startPoint = _evenement.startPoint;
      evenement.startHour = _evenement.startHour;
      evenement.endPoint = _evenement.endPoint;
      evenement.endHour = _evenement.endHour;
      evenement.patient = _evenement.patient;
      evenement.driver = _evenement.driver;
      var newEventId;
      await eventRepo.save(evenement).then(evenement => {
        console.log("Event has been saved. Event id is", evenement.id);
        newEventId = evenement.id;
      });;
      const eventList = await eventRepo.find({
        relations: ['driver', 'patient', 'startPoint', 'endPoint'],
      });

      //const item = await eventRepo.create(_evenement);
      //await eventRepo.save(item);
      event.returnValue = [newEventId, eventList]
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-event-by-id', async (event: any, _eventId: number) => {
    try {

      event.returnValue = await eventRepo.findOne({ relations: ["patient", "driver", "startPoint", "endPoint"], where: { id: _eventId } });

    } catch (err) {
      console.log("ERREUR " + err);
      throw err;
    }
  });

  ipcMain.on('get-event-by-driver-id', async (event: any, _driverId: number) => {
    try {
      event.returnValue = await eventRepo.find({
        relations: ["patient", "driver", "startPoint", "endPoint"], where: {
          driver: {
            id: _driverId
          }
        }
      });

    } catch (err) {
      console.log("ERREUR " + err);
      throw err;
    }
  });

  ipcMain.on('get-events-on-period', async (event: any, _startDate: string, _endDate : string) => {
    try {
      event.returnValue = await eventRepo.find({
        relations: ["patient", "driver", "startPoint", "endPoint"],
          where: [
            { date: Between(_startDate , _endDate)},
          ]
      });

    } catch (err) {
      console.log("ERREUR " + err);
      throw err;
    }
  });

  ipcMain.on('get-events', async (event: any) => {
    try {
      event.returnValue = await eventRepo.find({
        relations: ["patient", "driver", "startPoint", "endPoint"]
      })
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-event', async (event: any, _evenId: number) => {
    try {
      await eventRepo.delete(_evenId);
      event.returnValue = await eventRepo.find({
        relations: ["patient", "driver", "startPoint", "endPoint"]
      });
    } catch (err) {
      throw err;
    }
  });



  ipcMain.on('update-event', async (event: any, _event: Evenement) => {

    try {
      let eventToUpdate = await eventRepo.findOne(_event.id);
      eventToUpdate.title = _event.title;
      eventToUpdate.driver = _event.driver;
      eventToUpdate.patient = _event.patient;
      eventToUpdate.startPoint = _event.startPoint;
      eventToUpdate.startHour = _event.startHour;
      eventToUpdate.endPoint = _event.endPoint;
      eventToUpdate.endHour = _event.endHour;
      eventToUpdate.date = _event.date;
      await eventRepo.save(eventToUpdate);
      event.returnValue = await eventRepo.find({
        relations: ["patient", "driver", "startPoint", "endPoint"]
      });
    } catch (err) {
      throw err;
    }
  });
  // -------------------------- PATIENTS --------------------------
  ipcMain.on('add-patient', async (event: any, _patient: Patient) => {
    try {
      const item = await patientRepo.create(_patient);
      await patientRepo.save(item);
      event.returnValue = await patientRepo.find();
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

  ipcMain.on('get-patients', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await patientRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-patient-by-id', async (event: any, _patientId: number) => {
    try {
      event.returnValue = await patientRepo.findOne({ where: { id: _patientId } });
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
      patientToUpdate.comment = _patient.comment;
      await patientRepo.save(patientToUpdate);
      event.returnValue = await patientRepo.find();
    } catch (err) {
      throw err;
    }
  });


  // -------------------------- PLACES --------------------------

  ipcMain.on('get-places', async (event: any, ...args: any[]) => {
    try {
      event.returnValue = await placeRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('get-place-by-id', async (event: any, _placeId: number) => {
    try {
      event.returnValue = await placeRepo.findOne({ where: { id: _placeId } });

    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('add-place', async (event: any, _place: Place) => {
    try {
      const item = await placeRepo.create(_place);
      await placeRepo.save(item);
      event.returnValue = await placeRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('update-place', async (event: any, _place: Place) => {

    try {
      let placeToUpdate = await placeRepo.findOne(_place.id);
      placeToUpdate.label = _place.label;
      placeToUpdate.postCode = _place.postCode;
      placeToUpdate.country = _place.country;
      await placeRepo.save(placeToUpdate);
      event.returnValue = await placeRepo.find();
    } catch (err) {
      throw err;
    }
  });

  ipcMain.on('delete-place', async (event: any, _place: Place) => {
    try {
      const item = await placeRepo.create(_place);
      await placeRepo.remove(item);
      event.returnValue = await placeRepo.find();
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
