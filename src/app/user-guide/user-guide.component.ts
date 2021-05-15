import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss']
})
export class UserGuideComponent{

  panelOpenState = false;

  constructor() { }

  ngOnInit(): void {
  }

}
