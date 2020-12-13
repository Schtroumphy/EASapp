import { Injectable } from '@angular/core';

import { ElectronService } from 'ngx-electron';
import { Observable, of, throwError} from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Place } from '../../models/place.schema';

@Injectable()
export class PlaceService {
  constructor(private _electronService: ElectronService) {}

  getPlaces(): Observable<Place[]> {
    return of(this._electronService.ipcRenderer.sendSync('get-places')).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  getPlaceById(placeId : number): Observable<Place> {
    return of(this._electronService.ipcRenderer.sendSync('get-place-by-id', placeId)).pipe(
      catchError((error: any) => throwError(error.json))
    );
  }

  addPlace(place: Place): Observable<Place[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('add-place', place)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }


  deletePlace(place: Place): Observable<Place[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('delete-place', place)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }

  updatePlace(place: Place): Observable<Place[]> {
    return of(
      this._electronService.ipcRenderer.sendSync('update-place', place)
    ).pipe(catchError((error: any) => throwError(error.json)));
  }
}