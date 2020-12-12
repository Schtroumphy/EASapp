import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { HomeModule } from './home/home.module';
import { DetailModule } from './detail/detail.module';

import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation/navigation.component';
import { DriversComponent } from './drivers/drivers.component';
import { PatientsComponent } from './patients/patients.component';


import { LayoutModule } from '@angular/cdk/layout';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms'
import {MatDatepickerModule} from '@angular/material/datepicker';

//Ng Bootstrap modules
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

//Full calendar
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import bootstrapPlugin from '@fullcalendar/bootstrap';
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from '@fullcalendar/timegrid';
FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin
]);

//Services
import { DriverService } from '../app/core/services/app/driver.service'
import { PatientService } from '../app/core/services/app/patient.service'
import { ElectronService } from 'ngx-electron';
import { PlanningComponent } from './planning/planning.component';
import { CalendarComponent } from './calendar/calendar.component';
import { EventService } from './core/services/app/event.service';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin, bootstrapPlugin, listPlugin,timeGridPlugin,interactionPlugin
]);

@NgModule({
  declarations: [AppComponent, NavigationComponent, DriversComponent, PatientsComponent, PlanningComponent, CalendarComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    SharedModule,
    HomeModule,
    DetailModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatTableModule, MatInputModule, MatPaginatorModule, MatSortModule, MatProgressSpinnerModule,
    ReactiveFormsModule,
    FullCalendarModule,
    MatDatepickerModule,
    NgbModule
  ],
  providers: [DriverService, ElectronService, PatientService, EventService],
  bootstrap: [AppComponent]
})
export class AppModule {}
