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

import { ReactiveFormsModule } from '@angular/forms'

@NgModule({
  declarations: [HomeComponent, NavigationComponent, DriversComponent, PatientsComponent, CalendarComponent, PlacesComponent, EventComponent, AdvancedComponent, UserGuideComponent],
  imports: [
    HomeRoutingModule,
    ReactiveFormsModule
  ],
  exports: [ReactiveFormsModule]
})
export class HomeModule {}
