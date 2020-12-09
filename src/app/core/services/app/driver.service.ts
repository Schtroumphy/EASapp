import { Injectable } from '@angular/core';

import { Item } from '../../models/item.schema';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class DriverService {
  constructor(private _electronService: ElectronService) {}

  getItems(): Observable<Item[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-items')).pipe(
      catchError((error: any) => throwError(error.json))
    );
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
}