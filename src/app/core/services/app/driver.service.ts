import { Injectable } from '@angular/core';

import { Item } from '../../models/item.schema';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Driver } from '../../models/driver.schema';

@Injectable()
export class DriverService {
  constructor(private _electronService: ElectronService) {}

  getItems(): Observable<Item[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-items')).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  getDrivers(): Observable<Driver[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-drivers')).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  getDriverById(driverId : number): Observable<Driver> {
    return of(this._electronService.ipcRenderer.sendSync('get-driver-by-id', driverId)).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }


  addDriver(driver: Driver): Observable<Driver[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-driver', driver)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  addItem(item: Item): Observable<Item[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-item', item)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  deleteItem(item: Item): Observable<Item[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-item', item)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  deleteDriver(driver: Driver): Observable<Driver[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-driver', driver)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  updateDriver(driver: Driver): Observable<Driver[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('update-driver', driver)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }
}