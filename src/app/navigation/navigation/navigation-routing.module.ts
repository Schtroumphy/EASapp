import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { NavigationComponent } from './navigation.component';

const routes: Routes = [
  {
    path: 'navigation',
    component: NavigationComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NavigationRoutingModule {}
