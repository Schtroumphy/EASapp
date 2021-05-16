import { NgModule } from '@angular/core';

import { HomeRoutingModule } from './home-routing.module';

import { HomeComponent } from './home.component';
import { AdvancedComponent } from '../advanced/advanced.component';
import { CalendarComponent } from '../calendar/calendar.component';
import { DriversComponent } from '../drivers/drivers.component';
import { EventComponent } from '../event/event.component';
import { NavigationComponent } from '../navigation/navigation/navigation.component';
import { PatientsComponent } from '../patients/patients.component';
import { PlacesComponent } from '../places/places.component';
import { UserGuideComponent } from '../user-guide/user-guide.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu'
import { MatDatepickerModule } from '@angular/material/datepicker'
import { MatNativeDateModule } from '@angular/material/core';
import { MatMomentDateModule } from "@angular/material-moment-adapter";
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { FlatpickrModule } from 'angularx-flatpickr';
import { NgSelectModule } from '@ng-select/ng-select';
import { RandomcolorModule } from 'angular-randomcolor';

@NgModule({
  declarations: [HomeComponent, BottomNavComponent, NavigationComponent, DriversComponent, PatientsComponent, CalendarComponent, PlacesComponent, EventComponent, AdvancedComponent, UserGuideComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,

    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatDatepickerModule,MatNativeDateModule, MatMomentDateModule,
    MatListModule,
    MatTableModule, 
    MatInputModule,
    MatPaginatorModule, 
    MatSortModule, 
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    FormsModule,
    FullCalendarModule,
    MatDialogModule,
    MatExpansionModule,MatRadioModule,
    FlatpickrModule.forRoot(),
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory,
    }),
    NgSelectModule,
    RandomcolorModule
    
  ],
  exports: [ReactiveFormsModule]
})
export class HomeModule {}
