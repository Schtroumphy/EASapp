import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { DriversComponent } from './drivers.component';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  {
    path: 'drivers',
    component: DriversComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes), MatButtonModule],
  exports: [RouterModule, MatButtonModule]
})
export class DriversRoutingModule {}
